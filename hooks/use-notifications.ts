"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const isInitialized = useRef(false)

  // Initialiser le statut des permissions une seule fois
  useEffect(() => {
    if (isInitialized.current) return

    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
    isInitialized.current = true
  }, [])

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.warn("Ce navigateur ne supporte pas les notifications")
      return false
    }

    // Si déjà accordée, retourner true directement
    if (Notification.permission === "granted") {
      return true
    }

    // Si déjà refusée, ne pas redemander
    if (Notification.permission === "denied") {
      console.warn("Permission de notification refusée")
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === "granted"
    } catch (error) {
      console.error("Erreur lors de la demande de permission:", error)
      return false
    }
  }, [])

  const sendNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (!("Notification" in window)) {
      console.warn("Notifications non supportées")
      return null
    }

    if (Notification.permission !== "granted") {
      console.warn("Permission de notification non accordée")
      return null
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "whatsapp-message",
        requireInteraction: false,
        ...options,
      })

      // Auto-fermer après 5 secondes
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error)
      return null
    }
  }, [])

  return {
    permission,
    requestNotificationPermission,
    sendNotification,
  }
}
