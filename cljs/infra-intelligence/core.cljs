(ns infra-intelligence.core
  (:require
   [clojure.string :as str]
   [clojure.set :as set]
   [clojure.core.async :as async :refer [go chan >! <! timeout]]
   [reagent.core :as r]))

;; ============================================================================
;; Enhanced Configuration with Real Infrastructure
;; ============================================================================

(def default-config
  {:known-domains 
   {:primary ["cyrillrafael.org" "marchdown.net" "dissemblage.art" 
              "hyperstitious.org" "xenoethics.info" "xenoethics.org"]
    :development ["localhost" "127.0.0.1" "dev.local"]
    :cloud-providers ["herokuapp.com" "vercel.app" "netlify.app" "github.io"]}
   
   :known-subdomains
   {:common ["www" "api" "blog" "docs" "admin" "staging" "dev"]
    :services ["auth" "cdn" "mail" "ftp" "ssh"]
    :monitoring ["status" "health" "metrics" "logs"]}
   
   :github {:api-base "https://api.github.com"
            :known-users ["uprootiny" "marchdown" "cyrillrafael"]
            :rate-limit 60}
   
   :apis {:dns [{:name "google" :endpoint "https://dns.google/resolve"}
               {:name "cloudflare" :endpoint "https://cloudflare-dns.com/dns-query"}]
          :ssl [{:name "ssl-labs" :endpoint "https://api.ssllabs.com/api/v3/analyze"}]
          :security [{:name "security-headers" :endpoint "https://securityheaders.com/"}]}
   
   :cache {:ttl {:domain-health 300 :github-repos 1800 :dns-records 3600 
                 :ssl-analysis 86400 :llm-analysis 7200}
           :max-entries 1000}
   
   :llm {:models ["anthropic/claude-3.5-sonnet" "anthropic/claude-3-opus" 
                  "openai/gpt-4-turbo-preview" "openai/gpt-3.5-turbo"]
         :default-model "anthropic/claude-3.5-sonnet"
         :temperature 0.3
         :max-tokens 2000}})

;; ============================================================================
;; Advanced Prompt Composition System
;; ============================================================================

(defn format-ssl-analysis [ssl-data]
  (when ssl-data
    (str "SSL Configuration:\n"
         "- SSL Enabled: " (:ssl-enabled ssl-data) "\n"
         "- Security Headers:\n"
         (when-let [headers (:security-headers ssl-data)]
           (str/join "\n" 
                     (map (fn [[k v]] 
                            (str "  * " (name k) ": " (if v v "MISSING")))
                          headers))))))

(defn format-performance-data [perf-data]
  (when perf-data
    (str "Performance Metrics:\n"
         "- Response Time: " (:response-time perf-data) "ms\n"
         "- Status Code: " (:status-code perf-data) "\n"
         "- Status: " (name (:status perf-data)) "\n")))

(defn format-dns-data [dns-data]
  (when dns-data
    (str "DNS Configuration:\n"
         "- Records: " (count (:records dns-data)) " found\n"
         "- TTL: " (get-in dns-data [:records :Answer 0 :TTL] "unknown") "\n")))

(defn compose-infrastructure-prompt [inspection-data]
  (let [domain (:domain inspection-data)
        https-check (:https-check inspection-data)
        ssl-check (:ssl-check inspection-data)
        dns-check (:dns-check inspection-data)
        maturity (:maturity-score inspection-data)]
    
    (str "Infrastructure Analysis Request for: " domain "\n\n"
         
         "INSPECTION DATA:\n"
         "================\n"
         (format-performance-data https-check)
         "\n"
         (format-ssl-analysis ssl-check)
         "\n"
         (format-dns-data dns-check)
         "\n"
         "Calculated Maturity Score: " (when maturity (str (Math/round (* maturity 100)) "%")) "\n\n"
         
         "ANALYSIS REQUIREMENTS:\n"
         "=====================\n"
         "1. Provide specific health score (0-100) based on actual metrics above\n"
         "2. Identify concrete security vulnerabilities from the SSL/header data\n"
         "3. Assess performance using the actual response time (" (:response-time https-check) "ms)\n"
         "4. Compare against industry standards for " domain " type of service\n"
         "5. Prioritize 3 specific, actionable recommendations\n"
         "6. Identify critical risks requiring immediate attention\n\n"
         
         "Focus on the ACTUAL DATA provided, not generic recommendations.")))

(defn compose-security-prompt [inspection-data]
  (let [ssl-headers (get-in inspection-data [:ssl-check :security-headers])
        status-code (get-in inspection-data [:https-check :status-code])
        ssl-enabled (get-in inspection-data [:ssl-check :ssl-enabled])]
    
    (str "Security Assessment for: " (:domain inspection-data) "\n\n"
         
         "SECURITY EVIDENCE:\n"
         "==================\n"
         "SSL Status: " (if ssl-enabled "ENABLED" "DISABLED") "\n"
         "HTTP Status: " status-code "\n"
         "Security Headers Found:\n"
         (if ssl-headers
           (str/join "\n" (map (fn [[header value]]
                                 (str "- " (name header) ": " 
                                      (if value "PRESENT" "MISSING")))
                               ssl-headers))
           "No security headers detected") "\n\n"
         
         "SECURITY ANALYSIS REQUIRED:\n"
         "===========================\n"
         "1. Rate security posture (0-100) based on actual header analysis\n"
         "2. Identify specific vulnerabilities from missing/weak headers\n"
         "3. Assess SSL/TLS configuration strength\n"
         "4. Check for common attack vectors (XSS, CSRF, clickjacking)\n"
         "5. Provide compliance assessment (OWASP Top 10, PCI DSS relevant items)\n"
         "6. Prioritize security fixes by risk level\n\n"
         
         "Base analysis on the ACTUAL SECURITY HEADERS detected above.")))

(defn compose-performance-prompt [inspection-data]
  (let [response-time (get-in inspection-data [:https-check :response-time])
        status (get-in inspection-data [:https-check :status])
        domain (:domain inspection-data)]
    
    (str "Performance Analysis for: " domain "\n\n"
         
         "PERFORMANCE DATA:\n"
         "=================\n"
         "Response Time: " response-time "ms\n"
         "Service Status: " (name status) "\n"
         "Domain Type: " (cond
                           (str/includes? domain "api") "API Service"
                           (str/includes? domain "blog") "Content Site"
                           (str/includes? domain "docs") "Documentation"
                           :else "Web Application") "\n\n"
         
         "PERFORMANCE ANALYSIS REQUIRED:\n"
         "==============================\n"
         "1. Performance score (0-100) based on " response-time "ms response time\n"
         "2. Compare against industry benchmarks for this service type\n"
         "3. Identify bottlenecks causing current response time\n"
         "4. Recommend specific optimizations (CDN, caching, compression)\n"
         "5. Suggest monitoring and alerting thresholds\n"
         "6. Estimate performance impact of recommendations\n\n"
         
         "Focus on the actual " response-time "ms response time measurement.")))

;; ============================================================================
;; Enhanced GitHub Analysis
;; ============================================================================

(defn compose-repository-prompt [repo-data]
  (let [repos (:repos repo-data)
        total-stars (:total-stars repo-data)
        languages (frequencies (map :language repos))]
    
    (str "Repository Portfolio Analysis for: " (:user repo-data) "\n\n"
         
         "REPOSITORY DATA:\n"
         "================\n"
         "Total Repositories: " (count repos) "\n"
         "Total Stars: " total-stars "\n"
         "Language Distribution:\n"
         (str/join "\n" (map (fn [[lang count]] 
                               (str "- " lang ": " count " repos"))
                             languages)) "\n\n"
         
         "Repository Details:\n"
         (str/join "\n" (map (fn [repo]
                               (str "- " (:name repo) " (" (:language repo) ") - " (:stars repo) " stars"))
                             repos)) "\n\n"
         
         "ANALYSIS REQUIRED:\n"
         "==================\n"
         "1. Assess development maturity and code quality indicators\n"
         "2. Identify deployment readiness of repositories\n"
         "3. Suggest infrastructure requirements for each project\n"
         "4. Recommend CI/CD improvements based on project types\n"
         "5. Identify security considerations for different languages\n"
         "6. Prioritize repositories for infrastructure deployment\n\n"
         
         "Base recommendations on the actual repository data above.")))

;; ============================================================================
;; State Management with Reactive Updates
;; ============================================================================

(defonce app-state 
  (r/atom {:config default-config
           :infrastructure {}
           :cache {}
           :operations #{}
           :filters []
           :ui {:selected-domains #{}
                :analysis-history []
                :suggestions {:domains [] :subdomains []}}}))

(defn update-suggestions [domain-input]
  (let [config (:config @app-state)
        all-domains (flatten (vals (:known-domains config)))
        matching-domains (filter #(str/includes? % domain-input) all-domains)
        subdomains (get-in config [:known-subdomains :common])]
    
    (swap! app-state assoc-in [:ui :suggestions] 
           {:domains matching-domains
            :subdomains (map #(str % "." domain-input) subdomains)})))

;; ============================================================================
;; Enhanced Inspection with Real API Calls
;; ============================================================================

(defn github-fetch [endpoint auth-token]
  (let [headers (cond-> {"Accept" "application/vnd.github.v3+json"
                         "User-Agent" "Infrastructure-Intelligence/1.0"}
                  auth-token (assoc "Authorization" (str "token " auth-token)))]
    (-> (js/fetch (str "https://api.github.com" endpoint) 
                  #js {:headers (clj->js headers)})
        (.then #(.json %))
        (.then #(js->clj % :keywordize-keys true)))))

(defn enhanced-github-inspection [username]
  (go
    (try
      (let [user-data (<! (github-fetch (str "/users/" username) nil))
            repos-data (<! (github-fetch (str "/users/" username "/repos?sort=updated&per_page=20") nil))
            
            ;; Enhanced analysis
            total-stars (reduce + (map :stargazers_count repos-data))
            languages (frequencies (map :language repos-data))
            recent-activity (filter #(> (js/Date.parse (:updated_at %)) 
                                        (- (js/Date.now) (* 30 24 60 60 1000))) repos-data)
            
            analysis {:user username
                      :public-repos (:public_repos user-data)
                      :followers (:followers user-data)
                      :total-stars total-stars
                      :languages languages
                      :recent-repos (count recent-activity)
                      :repos (take 10 (sort-by :stargazers_count > repos-data))
                      :deployment-candidates (filter #(and (:has_pages %)
                                                           (> (:stargazers_count %) 0)) repos-data)}]
        analysis)
      (catch js/Error e
        {:error (.-message e) :user username}))))

(defn comprehensive-domain-inspection [domain]
  (go
    (try
      (let [;; Multiple concurrent checks
            https-check (<! (inspect-endpoint (str "https://" domain)))
            http-check (<! (inspect-endpoint (str "http://" domain)))
            ssl-check (<! (inspect-ssl domain))
            dns-check (<! (dns-lookup domain "A"))
            
            ;; Calculate enhanced maturity
            maturity (calculate-enhanced-maturity https-check ssl-check dns-check)
            
            ;; Security score
            security-score (calculate-security-score ssl-check)
            
            result {:domain domain
                    :timestamp (js/Date.now)
                    :https-check https-check
                    :http-check http-check  
                    :ssl-check ssl-check
                    :dns-check dns-check
                    :maturity-score maturity
                    :security-score security-score
                    :recommendations (generate-recommendations https-check ssl-check dns-check)}]
        
        ;; Cache the result
        (swap! app-state assoc-in [:infrastructure domain] result)
        result)
      (catch js/Error e
        {:domain domain :error (.-message e)}))))

(defn calculate-enhanced-maturity [https-check ssl-check dns-check]
  (let [base-score (case (:status https-check)
                     :up 0.4
                     :degraded 0.2  
                     :down 0.0
                     0.1)
        
        ssl-score (if (:ssl-enabled ssl-check) 0.25 0.0)
        
        perf-score (let [rt (:response-time https-check 9999)]
                     (cond
                       (< rt 200) 0.2
                       (< rt 500) 0.15
                       (< rt 1000) 0.1
                       :else 0.05))
        
        security-score (let [headers (:security-headers ssl-check)]
                         (if (and headers (> (count (filter val headers)) 2))
                           0.15
                           0.0))]
    
    (min 1.0 (+ base-score ssl-score perf-score security-score))))

(defn calculate-security-score [ssl-check]
  (let [ssl-points (if (:ssl-enabled ssl-check) 30 0)
        headers (:security-headers ssl-check)
        header-points (if headers
                        (* 10 (count (filter val headers)))
                        0)]
    (min 100 (+ ssl-points header-points))))

(defn generate-recommendations [https-check ssl-check dns-check]
  (let [recommendations []]
    (cond-> recommendations
      (not (:ssl-enabled ssl-check))
      (conj {:priority :critical
             :title "Enable SSL/HTTPS"
             :description "Site is not using SSL encryption"
             :action "Install SSL certificate and redirect HTTP to HTTPS"})
      
      (> (:response-time https-check 0) 1000)
      (conj {:priority :high
             :title "Optimize Response Time"
             :description (str "Response time is " (:response-time https-check) "ms")
             :action "Implement caching, CDN, or server optimization"})
      
      (empty? (filter val (:security-headers ssl-check {})))
      (conj {:priority :medium
             :title "Add Security Headers"
             :description "Missing critical security headers"
             :action "Implement HSTS, CSP, X-Frame-Options headers"}))))

;; ============================================================================
;; Enhanced LLM Integration with Better Error Handling
;; ============================================================================

(defn call-llm-with-retry [prompt data api-key & {:keys [max-retries] :or {max-retries 3}}]
  (go
    (loop [attempts 0]
      (try
        (let [response (<! (call-llm prompt data api-key))]
          (if (str/includes? response "error")
            (if (< attempts max-retries)
              (do
                (<! (timeout (* 1000 (inc attempts)))) ; Exponential backoff
                (recur (inc attempts)))
              {:error "Max retries exceeded" :attempts attempts})
            response))
        (catch js/Error e
          (if (< attempts max-retries)
            (do
              (<! (timeout (* 1000 (inc attempts))))
              (recur (inc attempts)))
            {:error (.-message e) :attempts attempts}))))))

(defn call-llm [prompt-type data api-key]
  (go
    (let [endpoint "https://openrouter.ai/api/v1/chat/completions"
          
          composed-prompt (case prompt-type
                            :infrastructure-analysis (compose-infrastructure-prompt data)
                            :security-assessment (compose-security-prompt data)
                            :performance-analysis (compose-performance-prompt data)
                            :repository-analysis (compose-repository-prompt data)
                            (str "Analyze this data: " (pr-str data)))
          
          body {:model "anthropic/claude-3.5-sonnet"
                :messages [{:role "user" :content composed-prompt}]
                :temperature 0.3
                :max_tokens 2000}]
      
      (try
        (let [response (<! (js/fetch endpoint 
                                     #js {:method "POST"
                                          :headers #js {"Content-Type" "application/json"
                                                       "Authorization" (str "Bearer " api-key)}
                                          :body (js/JSON.stringify (clj->js body))}))
              json-data (<! (.json response))]
          
          (if (.-ok response)
            (get-in (js->clj json-data :keywordize-keys true) 
                    [:choices 0 :message :content])
            {:error (str "API Error: " (.-status response))}))
        (catch js/Error e
          {:error (.-message e)})))))

;; ============================================================================
;; Export API for JavaScript
;; ============================================================================

(defn export-api []
  (set! js/window.infraIntelligence
        #js {:init (fn [config] 
                     (swap! app-state update :config merge (js->clj config :keywordize-keys true)))
             
             :inspectDomain (fn [domain callback]
                              (go 
                                (let [result (<! (comprehensive-domain-inspection domain))]
                                  (callback (clj->js result)))))
             
             :inspectGitHub (fn [username callback]
                              (go
                                (let [result (<! (enhanced-github-inspection username))]
                                  (callback (clj->js result)))))
             
             :analyzeLLM (fn [prompt-type data api-key callback]
                           (go
                             (let [result (<! (call-llm-with-retry prompt-type 
                                                                  (js->clj data :keywordize-keys true) 
                                                                  api-key))]
                               (callback (clj->js result)))))
             
             :updateSuggestions (fn [input]
                                  (update-suggestions input)
                                  (clj->js (get-in @app-state [:ui :suggestions])))
             
             :getSystemHealth (fn []
                                (let [infra (:infrastructure @app-state)
                                      total (count infra)
                                      by-status (group-by #(get-in % [1 :https-check :status]) infra)]
                                  (clj->js {:total total
                                            :up (count (:up by-status))
                                            :down (count (:down by-status))
                                            :cache-entries (count (:cache @app-state))})))
             
             :clearCache (fn []
                           (swap! app-state assoc :cache {})
                           (swap! app-state assoc :infrastructure {}))}))

;; Initialize when loaded
(defn init []
  (export-api)
  (.log js/console "Infrastructure Intelligence Core loaded and exported"))
