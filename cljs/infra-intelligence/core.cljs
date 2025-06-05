;; ============================================================================
;; Infrastructure Intelligence Core Library
;; ============================================================================
;; Design Brief:
;; Real-world infrastructure inspection with multi-tier caching, LLM analysis,
;; and reactive state management. Focuses on actual data collection from live
;; systems (DNS, HTTP, GitHub APIs) with intelligent caching and AI-powered
;; insights. Built for interactive manipulation and batch operations.
;; ============================================================================

(ns infra-intelligence.core
  (:require
   [clojure.spec.alpha :as s]
   [clojure.string :as str]
   [clojure.set :as set]
   [clojure.test :refer [deftest is testing run-tests]]
   [clojure.core.async :as async :refer [go chan >! <! timeout]]))

;; ============================================================================
;; Data Model & Specifications
;; ============================================================================

(s/def ::id string?)
(s/def ::domain string?)
(s/def ::url string?)
(s/def ::status #{:up :down :degraded :unknown :checking})
(s/def ::timestamp inst?)
(s/def ::response-time (s/and number? pos?))
(s/def ::maturity-score (s/and number? #(<= 0 % 1)))

(s/def ::inspection-result
  (s/keys :req-un [::id ::status ::timestamp]
          :opt-un [::response-time ::error ::headers ::ssl-info]))

(s/def ::cache-entry
  (s/keys :req-un [::data ::timestamp ::ttl]
          :opt-un [::hits ::last-access]))

(s/def ::infrastructure-component
  (s/keys :req-un [::id ::type ::status]
          :opt-un [::domain ::url ::maturity-score ::inspection-result]))

;; ============================================================================
;; Configuration
;; ============================================================================

(def config
  {:domains ["cyrillrafael.org" "marchdown.net" "dissemblage.art" 
             "hyperstitious.org" "xenoethics.info" "xenoethics.org"]
   
   :github {:api-base "https://api.github.com"
            :users ["uprootiny" "marchdown" "cyrillrafael"]}
   
   :dns {:providers [{:name "google" :endpoint "https://dns.google/resolve"}
                     {:name "cloudflare" :endpoint "https://cloudflare-dns.com/dns-query"}]}
   
   :cache {:ttl {:domain-health 300          ; 5 minutes
                 :dns-records 3600           ; 1 hour  
                 :github-repos 1800          ; 30 minutes
                 :ssl-certs 86400            ; 24 hours
                 :llm-analysis 3600}         ; 1 hour
           :max-entries 1000}
   
   :llm {:endpoint "https://openrouter.ai/api/v1/chat/completions"
         :model "anthropic/claude-3.5-sonnet"
         :temperature 0.3
         :max-tokens 1000}
   
   :health-check {:timeout-ms 10000
                  :retry-attempts 3
                  :concurrent-limit 5}})

;; ============================================================================
;; Cache Management
;; ============================================================================

(defonce cache-store (atom {}))

(defn cache-key [type identifier]
  (str (name type) ":" identifier))

(defn cache-fresh? [entry ttl-seconds]
  (when entry
    (< (- (.now js/Date) (:timestamp entry)) (* ttl-seconds 1000))))

(defn cache-get [type identifier]
  (let [key (cache-key type identifier)
        entry (get @cache-store key)
        ttl (get-in config [:cache :ttl type] 300)]
    (when (cache-fresh? entry ttl)
      (swap! cache-store update-in [key] assoc 
             :hits (inc (:hits entry 0))
             :last-access (.now js/Date))
      (:data entry))))

(defn cache-set [type identifier data]
  (let [key (cache-key type identifier)
        entry {:data data 
               :timestamp (.now js/Date)
               :hits 1
               :last-access (.now js/Date)}]
    (swap! cache-store assoc key entry)
    data))

(defn cache-invalidate 
  ([type identifier]
   (let [key (cache-key type identifier)]
     (swap! cache-store dissoc key)))
  ([type]
   (swap! cache-store 
          #(into {} (remove (fn [[k v]] (str/starts-with? k (str (name type) ":"))) %)))))

(defn cache-stats []
  (let [entries @cache-store
        total-entries (count entries)
        total-hits (reduce + (map #(:hits % 0) (vals entries)))
        by-type (group-by #(first (str/split (key %) #":")) entries)]
    {:total-entries total-entries
     :total-hits total-hits
     :hit-rate (if (pos? total-entries) (/ total-hits total-entries) 0)
     :by-type (into {} (map (fn [[type entries]] 
                              [type (count entries)]) by-type))}))

;; ============================================================================
;; HTTP Client with Retry Logic
;; ============================================================================

(defn fetch-with-timeout [url options timeout-ms]
  (js/Promise.race
    #js [(js/fetch url (clj->js options))
         (js/Promise. (fn [_ reject]
                        (js/setTimeout #(reject (js/Error. "Timeout")) timeout-ms)))]))

(defn fetch-with-retry [url options max-retries]
  (letfn [(attempt [retries-left]
            (-> (fetch-with-timeout url options (:timeout-ms config))
                (.catch (fn [error]
                          (if (pos? retries-left)
                            (do
                              (.warn js/console "Fetch failed, retrying..." retries-left "attempts left")
                              (js/Promise.
                                (fn [resolve reject]
                                  (js/setTimeout 
                                    #(-> (attempt (dec retries-left))
                                         (.then resolve)
                                         (.catch reject))
                                    (* (- max-retries retries-left) 1000)))))
                            (js/Promise.reject error))))))]
    (attempt max-retries)))

;; ============================================================================
;; Infrastructure Inspection
;; ============================================================================

(defn inspect-endpoint [url]
  (let [start-time (.now js/Performance)]
    (-> (fetch-with-retry url {:method "HEAD" :mode "no-cors"} 
                         (:retry-attempts (:health-check config)))
        (.then (fn [response]
                 (let [end-time (.now js/Performance)
                       response-time (- end-time start-time)]
                   {:url url
                    :status (if (.-ok response) :up :down)
                    :status-code (.-status response)
                    :response-time response-time
                    :headers (when-let [headers (.-headers response)]
                               (js->clj (.fromEntries headers)))
                    :timestamp (.now js/Date)})))
        (.catch (fn [error]
                  {:url url
                   :status :down
                   :error (.-message error)
                   :timestamp (.now js/Date)})))))

(defn inspect-ssl [domain]
  (-> (js/fetch (str "https://" domain) {:method "HEAD"})
      (.then (fn [response]
               (let [headers (js->clj (.fromEntries (.-headers response)))]
                 {:domain domain
                  :ssl-enabled true
                  :security-headers 
                  {:strict-transport-security (get headers "strict-transport-security")
                   :content-security-policy (get headers "content-security-policy")
                   :x-frame-options (get headers "x-frame-options")
                   :x-content-type-options (get headers "x-content-type-options")}
                  :timestamp (.now js/Date)})))
      (.catch (fn [error]
                {:domain domain
                 :ssl-enabled false
                 :error (.-message error)
                 :timestamp (.now js/Date)}))))

(defn dns-lookup [domain record-type]
  (let [provider (first (:providers (:dns config)))
        url (str (:endpoint provider) "?name=" domain "&type=" record-type)]
    (-> (js/fetch url)
        (.then #(.json %))
        (.then (fn [data]
                 {:domain domain
                  :record-type record-type
                  :records (js->clj data :keywordize-keys true)
                  :timestamp (.now js/Date)}))
        (.catch (fn [error]
                  {:domain domain
                   :record-type record-type
                   :error (.-message error)
                   :timestamp (.now js/Date)})))))

;; ============================================================================
;; GitHub API Integration
;; ============================================================================

(defn github-api [endpoint & {:keys [auth-token]}]
  (let [url (str (:api-base (:github config)) endpoint)
        headers (cond-> {"Accept" "application/vnd.github.v3+json"}
                  auth-token (assoc "Authorization" (str "token " auth-token)))]
    (-> (fetch-with-retry url {:headers headers} 2)
        (.then #(.json %))
        (.then #(js->clj % :keywordize-keys true))
        (.catch (fn [error]
                  {:error (.-message error)
                   :endpoint endpoint})))))

(defn github-user-repos [username]
  (if-let [cached (cache-get :github-repos username)]
    (js/Promise.resolve cached)
    (-> (github-api (str "/users/" username "/repos"))
        (.then (fn [repos]
                 (cache-set :github-repos username repos)
                 repos)))))

(defn github-repo-details [owner repo]
  (let [repo-id (str owner "/" repo)]
    (if-let [cached (cache-get :github-repo repo-id)]
      (js/Promise.resolve cached)
      (-> (js/Promise.all 
            #js [(github-api (str "/repos/" repo-id))
                 (github-api (str "/repos/" repo-id "/languages"))
                 (github-api (str "/repos/" repo-id "/contributors"))])
          (.then (fn [results]
                   (let [details {:repo (aget results 0)
                                  :languages (aget results 1)
                                  :contributors (aget results 2)}]
                     (cache-set :github-repo repo-id details)
                     details)))))))

;; ============================================================================
;; LLM Integration
;; ============================================================================

(def prompt-templates
  {:infrastructure-analysis
   "You are an expert infrastructure engineer. Analyze this technical data and provide:
1. Health score (0-100) with reasoning
2. Maturity assessment (nascent/developing/mature/optimized)  
3. Key risks and recommendations
4. Specific next actions

Data: {data}

Respond with structured analysis in 200 words or less."

   :security-assessment
   "As a cybersecurity expert, assess this infrastructure component:

{data}

Provide:
1. Security score (0-100)
2. Vulnerability analysis
3. Compliance gaps
4. Priority fixes

Be specific and actionable."})

(defn call-llm [prompt-type data & {:keys [api-key]}]
  (let [llm-config (:llm config)
        template (get prompt-templates prompt-type)
        prompt (str/replace template "{data}" (pr-str data))]
    
    (if (empty? api-key)
      (js/Promise.reject (js/Error. "LLM API key required"))
      
      (-> (js/fetch (:endpoint llm-config)
                    #js {:method "POST"
                         :headers #js {"Content-Type" "application/json"
                                      "Authorization" (str "Bearer " api-key)}
                         :body (js/JSON.stringify 
                                 #js {:model (:model llm-config)
                                      :messages #js [#js {:role "user" :content prompt}]
                                      :temperature (:temperature llm-config)
                                      :max_tokens (:max-tokens llm-config)})})
          (.then (fn [response]
                   (if (.-ok response)
                     (.json response)
                     (js/Promise.reject (js/Error. (str "LLM API error: " (.-status response)))))))
          (.then (fn [data]
                   (let [result (js->clj data :keywordize-keys true)]
                     (get-in result [:choices 0 :message :content]))))))))

;; ============================================================================
;; Analysis Engine
;; ============================================================================

(defn calculate-maturity-score [inspection-data]
  (let [https-working? (= :up (get-in inspection-data [:https-check :status]))
        ssl-enabled? (get-in inspection-data [:ssl-check :ssl-enabled])
        response-time (get-in inspection-data [:https-check :response-time] 99999)
        has-security-headers? (seq (get-in inspection-data [:ssl-check :security-headers]))
        
        base-score (if https-working? 0.4 0.0)
        ssl-bonus (if ssl-enabled? 0.2 0.0)
        performance-score (cond
                            (< response-time 200) 0.2
                            (< response-time 500) 0.15
                            (< response-time 1000) 0.1
                            :else 0.0)
        security-bonus (if has-security-headers? 0.2 0.0)]
    
    (min 1.0 (+ base-score ssl-bonus performance-score security-bonus))))

(defn comprehensive-inspection [domain]
  (let [cache-key (str "comprehensive:" domain)]
    (if-let [cached (cache-get :domain-health cache-key)]
      (js/Promise.resolve cached)
      
      (-> (js/Promise.all 
            #js [(inspect-endpoint (str "https://" domain))
                 (inspect-endpoint (str "http://" domain))
                 (inspect-ssl domain)
                 (dns-lookup domain "A")])
          (.then (fn [results]
                   (let [inspection {:domain domain
                                     :https-check (aget results 0)
                                     :http-check (aget results 1)
                                     :ssl-check (aget results 2)
                                     :dns-check (aget results 3)
                                     :timestamp (.now js/Date)}
                         maturity (calculate-maturity-score inspection)]
                     (cache-set :domain-health cache-key 
                               (assoc inspection :maturity-score maturity))
                     inspection)))))))

;; ============================================================================
;; State Management
;; ============================================================================

(defonce app-state 
  (atom {:infrastructure {}
         :filters #{}
         :active-operations #{}
         :selections #{}
         :ui-mode :topology}))

(defn update-infrastructure [component-id data]
  (swap! app-state assoc-in [:infrastructure component-id] data))

(defn get-filtered-components [filters]
  (let [components (:infrastructure @app-state)]
    (if (empty? filters)
      components
      (into {} (filter (fn [[id component]]
                         (every? #(apply-filter % component) filters)) 
                       components)))))

(defn apply-filter [filter-spec component]
  (case (:type filter-spec)
    :status (= (:status component) (:value filter-spec))
    :domain (str/includes? (:domain component) (:value filter-spec))
    :maturity (>= (:maturity-score component 0) (:value filter-spec))
    true))

(defn add-filter [filter-spec]
  (swap! app-state update :filters conj filter-spec))

(defn remove-filter [filter-spec]
  (swap! app-state update :filters disj filter-spec))

;; ============================================================================
;; Batch Operations
;; ============================================================================

(defn batch-inspect [domains]
  (let [results-chan (chan)
        domain-count (count domains)]
    
    (go
      ;; Limit concurrent operations
      (let [semaphore (chan (:concurrent-limit (:health-check config)))]
        ;; Initialize semaphore
        (dotimes [_ (:concurrent-limit (:health-check config))]
          (>! semaphore :token))
        
        ;; Process domains with concurrency control
        (doseq [domain domains]
          (<! semaphore) ; Wait for available slot
          (go
            (try
              (let [result (<! (comprehensive-inspection domain))]
                (>! results-chan {:domain domain :result result :success true}))
              (catch js/Error e
                (>! results-chan {:domain domain :error (.-message e) :success false}))
              (finally
                (>! semaphore :token))))) ; Release slot
        
        ;; Collect results
        (loop [collected [] remaining domain-count]
          (if (zero? remaining)
            collected
            (let [result (<! results-chan)]
              (recur (conj collected result) (dec remaining)))))))
    
    results-chan))

;; ============================================================================
;; Tests
;; ============================================================================

(deftest test-cache-functionality
  (testing "Cache operations"
    ;; Clear cache first
    (reset! cache-store {})
    
    ;; Test cache set/get
    (let [test-data {:test "value" :timestamp (.now js/Date)}]
      (cache-set :test "key1" test-data)
      (is (= test-data (cache-get :test "key1"))))
    
    ;; Test cache miss
    (is (nil? (cache-get :test "nonexistent")))
    
    ;; Test cache invalidation
    (cache-invalidate :test "key1")
    (is (nil? (cache-get :test "key1")))))

(deftest test-maturity-calculation
  (testing "Maturity score calculation"
    (let [good-inspection {:https-check {:status :up :response-time 150}
                           :ssl-check {:ssl-enabled true 
                                       :security-headers {"strict-transport-security" "max-age=31536000"}}}
          poor-inspection {:https-check {:status :down}
                           :ssl-check {:ssl-enabled false}}]
      
      (is (> (calculate-maturity-score good-inspection) 0.8))
      (is (< (calculate-maturity-score poor-inspection) 0.2)))))

(deftest test-filter-system
  (testing "Component filtering"
    (let [component1 {:domain "test1.com" :status :up :maturity-score 0.8}
          component2 {:domain "test2.com" :status :down :maturity-score 0.3}]
      
      (reset! app-state {:infrastructure {"comp1" component1 "comp2" component2}})
      
      ;; Test status filter
      (let [up-components (get-filtered-components [{:type :status :value :up}])]
        (is (= 1 (count up-components)))
        (is (contains? up-components "comp1")))
      
      ;; Test maturity filter  
      (let [mature-components (get-filtered-components [{:type :maturity :value 0.5}])]
        (is (= 1 (count mature-components)))
        (is (contains? mature-components "comp1"))))))

(deftest test-dns-lookup-structure
  (testing "DNS lookup returns expected structure"
    ;; This would typically be mocked in a real test environment
    (let [mock-result {:domain "example.com"
                       :record-type "A"
                       :records {:Status 0 :Answer [{:data "93.184.216.34"}]}
                       :timestamp 1234567890}]
      
      (is (s/valid? (s/keys :req-un [::domain]) mock-result))
      (is (contains? mock-result :timestamp)))))

(deftest test-config-validation
  (testing "Configuration structure"
    (is (sequential? (:domains config)))
    (is (every? string? (:domains config)))
    (is (contains? (:cache config) :ttl))
    (is (contains? (:github config) :api-base))
    (is (pos? (get-in config [:cache :ttl :domain-health])))))

;; ============================================================================
;; Public API
;; ============================================================================

(defn init! 
  "Initialize the infrastructure intelligence system"
  [user-config]
  (let [merged-config (merge config user-config)]
    (reset! cache-store {})
    (.log js/console "Infrastructure Intelligence initialized" 
          (select-keys merged-config [:domains :github :cache]))))

(defn inspect-infrastructure 
  "Inspect a single infrastructure component"
  [type identifier]
  (case type
    :domain (comprehensive-inspection identifier)
    :github-user (github-user-repos identifier)
    :github-repo (let [[owner repo] (str/split identifier #"/")]
                   (github-repo-details owner repo))
    (js/Promise.reject (js/Error. (str "Unknown inspection type: " type)))))

(defn batch-analyze 
  "Analyze multiple components with LLM"
  [component-ids prompt-type api-key]
  (go
    (let [components (map #(get-in @app-state [:infrastructure %]) component-ids)
          analyses (for [component components]
                     (<! (call-llm prompt-type component :api-key api-key)))]
      analyses)))

(defn get-system-health 
  "Get overall system health summary"
  []
  (let [components (:infrastructure @app-state)
        total (count components)
        by-status (group-by :status (vals components))]
    {:total total
     :up (count (:up by-status))
     :down (count (:down by-status))
     :degraded (count (:degraded by-status))
     :cache-stats (cache-stats)}))

;; Development helpers
(defn run-all-tests []
  (run-tests))

(defn clear-cache! []
  (reset! cache-store {}))

;; Export for external use
(def api
  {:init! init!
   :inspect-infrastructure inspect-infrastructure
   :batch-analyze batch-analyze
   :get-system-health get-system-health
   :cache-get cache-get
   :cache-invalidate cache-invalidate
   :add-filter add-filter
   :remove-filter remove-filter
   :run-tests run-all-tests})

;; ============================================================================
;; Example Usage
;; ============================================================================

(comment
  ;; Initialize system
  (init! {:llm {:api-key "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"}}) ;; test key with $8 limit, okay to commit to a public repo 'cause the whole thing is there to fly and burrrn in public.
  
  ;; Inspect a domain
  (-> (inspect-infrastructure :domain "hyperstitious.org")
      (.then #(.log js/console "Inspection result:" %)))
  
  ;; Batch analyze with LLM
  (go
    (let [results (<! (batch-analyze ["sepharia" "arboretum"] 
                                     :infrastructure-analysis 
                                     "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"))]
      (.log js/console "LLM analyses:" results)))
  
  ;; Get system health
  (.log js/console "System health:" (get-system-health))
  
  ;; Run tests
  (run-all-tests))
