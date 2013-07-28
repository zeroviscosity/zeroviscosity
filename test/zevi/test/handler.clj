(ns zevi.test.handler
  (:use clojure.test
        ring.mock.request
        zevi.handler))

(deftest test-app
  (testing "main route"
    (let [response (app (request :get "/"))]
      (is (= (:status response) 200))
      (is (.startsWith (:body response)
             "<!DOCTYPE html>"))))

  (testing "not-found route"
    (let [response (app (request :get "/invalid"))]
      (is (= (:status response) 404)))))
