(ns zevi.routes.home
  (:use compojure.core)
  (:require [zevi.views.layout :as layout]
            [zevi.util :as util]))

(defn home-page []
  (layout/render "home.html"))

(defroutes home-routes
  (GET "/" [] (home-page)))
