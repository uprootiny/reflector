(comment
  (ns build
    (:require [clojure.tools.build.api :as b]))
  
  (def lib 'infra-intelligence/core)
  (def class-dir "target/classes")
  (def uber-file (format "target/%s-standalone.jar" (name lib)))
  
  (defn clean [_]
    (b/delete {:path "target"}))
  
  (defn compile-cljs [_]
    (b/process {:command-args ["npx" "shadow-cljs" "release" "lib"]})))
