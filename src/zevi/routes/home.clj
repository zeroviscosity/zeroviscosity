(ns zevi.routes.home
  (:use compojure.core
        postal.core)
  (:require [zevi.views.layout :as layout]
            [zevi.util :as util]
            [noir.response :as resp]
            [noir.validation :as validation]))

(defn home-page []
  (layout/render "home.html"))

(defn contact-me [name email message comment]
  (cond

    (empty? name)
    (resp/json {:result "Please provide your name."})

    (false? (validation/is-email? email))
    (resp/json {:result "Please provide your email."})

    (empty? message)
    (resp/json {:result "Please enter a message."})

    (false? (empty? comment))
    (resp/json {:result "You entered something in a box that needed to be left empty. Perhaps you are a spam bot? No offense intended if you are in fact human."})

    :else
    (do
      (send-message {:from email
                     :to ["kent.english@gmail.com"]
                     :subject "Website Contact"
                     :body message})
      (resp/json {:result "success"}))))

(defroutes home-routes
  (GET "/" [] (home-page))
  (POST "/contact-me" [name email message comment] (contact-me name email message comment)))
