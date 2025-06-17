"use client"

import { useState, useEffect, useCallback } from "react"
import { wsClient } from "@/lib/websocket-client"
import { webrtcClient, type CallData } from "@/lib/webrtc-client"

export interface RealtimeMessage {
  id: string
  content: string
  senderId: string
  conversationId: string
  timestamp: string
  type: "text" | "audio" | "image" | "video"
  status: "sent" | "delivered" | "read"
}

export interface TypingStatus {
  userId: string
  isTyping: boolean
  conversationId: string
}

export interface CallStatus {
  callId: string
  from: string
  to: string
  type: "voice" | "video"
  status: "ringing" | "active" | "ended"
  startTime?: string
  endTime?: string
}

export function useRealtimeMessaging(currentUserId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([])
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null)
  const [currentCall, setCurrentCall] = useState<CallStatus | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  // Connexion WebSocket
  const connect = useCallback(async () => {
    if (!currentUserId) return

    try {
      setConnectionError(null)
      await wsClient.connect(currentUserId)
      setIsConnected(true)
      console.log("✅ Connecté au WebSocket")
    } catch (error) {
      console.error("❌ Erreur connexion WebSocket:", error)
      setConnectionError(error instanceof Error ? error.message : "Erreur de connexion")
      setIsConnected(false)
    }
  }, [currentUserId])

  // Déconnexion
  const disconnect = useCallback(() => {
    wsClient.disconnect()
    setIsConnected(false)
    setMessages([])
    setTypingUsers([])
    setOnlineUsers([])
  }, [])

  // Envoi de message
  const sendMessage = useCallback(
    (content: string, conversationId: string, to: string, type: "text" | "audio" | "image" | "video" = "text") => {
      if (!wsClient.isConnected) {
        console.warn("⚠️ WebSocket non connecté")
        return false
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const message: RealtimeMessage = {
        id: messageId,
        content,
        senderId: currentUserId,
        conversationId,
        timestamp: new Date().toISOString(),
        type,
        status: "sent",
      }

      // Ajouter le message localement
      setMessages((prev) => [...prev, message])

      // Envoyer via WebSocket
      return wsClient.sendChatMessage(content, conversationId, to, type)
    },
    [currentUserId],
  )

  // Indicateur de frappe
  const sendTyping = useCallback((to: string, isTyping: boolean) => {
    return wsClient.sendTyping(to, isTyping)
  }, [])

  // Marquer comme lu
  const markAsRead = useCallback((messageIds: string[], to: string) => {
    return wsClient.sendMessageRead(to, messageIds)
  }, [])

  // Gestion des appels
  const initiateCall = useCallback(
    async (targetUserId: string, callType: "voice" | "video" = "voice") => {
      try {
        const callId = await webrtcClient.initiateCall(targetUserId, callType)
        setCurrentCall({
          callId,
          from: currentUserId,
          to: targetUserId,
          type: callType,
          status: "ringing",
          startTime: new Date().toISOString(),
        })
        return callId
      } catch (error) {
        console.error("❌ Erreur initiation appel:", error)
        throw error
      }
    },
    [currentUserId],
  )

  const acceptCall = useCallback(
    async (callData: CallData) => {
      try {
        await webrtcClient.acceptCall(callData)
        setIncomingCall(null)
        setCurrentCall({
          callId: callData.callId,
          from: callData.from,
          to: currentUserId,
          type: callData.type,
          status: "active",
          startTime: new Date().toISOString(),
        })
      } catch (error) {
        console.error("❌ Erreur acceptation appel:", error)
        throw error
      }
    },
    [currentUserId],
  )

  const rejectCall = useCallback((callData: CallData) => {
    webrtcClient.rejectCall(callData)
    setIncomingCall(null)
  }, [])

  const endCall = useCallback(() => {
    webrtcClient.endCall()
    setCurrentCall((prev) =>
      prev
        ? {
            ...prev,
            status: "ended",
            endTime: new Date().toISOString(),
          }
        : null,
    )
  }, [])

  // Configuration des handlers WebSocket
  useEffect(() => {
    if (!currentUserId) return

    // Messages de chat
    wsClient.onMessage("chat-message", (data) => {
      console.log("💬 Nouveau message reçu:", data)
      const message: RealtimeMessage = {
        id: data.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: data.content,
        senderId: data.from,
        conversationId: data.conversationId,
        timestamp: data.timestamp || new Date().toISOString(),
        type: data.messageType || "text",
        status: "delivered",
      }
      setMessages((prev) => [...prev, message])
    })

    // Indicateurs de frappe
    wsClient.onMessage("typing", (data) => {
      console.log("⌨️ Indicateur de frappe:", data)
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.from)
        if (data.isTyping) {
          return [
            ...filtered,
            {
              userId: data.from,
              isTyping: true,
              conversationId: data.conversationId || "",
            },
          ]
        }
        return filtered
      })

      // Supprimer l'indicateur après 3 secondes
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== data.from))
        }, 3000)
      }
    })

    // Messages lus
    wsClient.onMessage("message-read", (data) => {
      console.log("👁️ Messages lus:", data)
      setMessages((prev) => prev.map((msg) => (data.messageIds.includes(msg.id) ? { ...msg, status: "read" } : msg)))
    })

    // Utilisateurs en ligne
    wsClient.onMessage("user-online", (data) => {
      console.log("🟢 Utilisateur en ligne:", data.userId)
      setOnlineUsers((prev) => [...new Set([...prev, data.userId])])
    })

    wsClient.onMessage("user-offline", (data) => {
      console.log("🔴 Utilisateur hors ligne:", data.userId)
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId))
    })

    wsClient.onMessage("users-list", (data) => {
      console.log("👥 Liste des utilisateurs:", data.users)
      setOnlineUsers(data.users || [])
    })

    return () => {
      // Nettoyer les handlers
      wsClient.offMessage("chat-message")
      wsClient.offMessage("typing")
      wsClient.offMessage("message-read")
      wsClient.offMessage("user-online")
      wsClient.offMessage("user-offline")
      wsClient.offMessage("users-list")
    }
  }, [currentUserId])

  // Configuration des handlers WebRTC
  useEffect(() => {
    // Appel entrant
    webrtcClient.on("incoming-call", (callData: CallData) => {
      console.log("📞 Appel entrant:", callData)
      setIncomingCall(callData)
    })

    // Appel accepté
    webrtcClient.on("call-answered", () => {
      console.log("✅ Appel accepté")
      setCurrentCall((prev) => (prev ? { ...prev, status: "active" } : null))
    })

    // Appel rejeté
    webrtcClient.on("call-rejected", () => {
      console.log("❌ Appel rejeté")
      setCurrentCall(null)
    })

    // Appel terminé
    webrtcClient.on("call-ended", () => {
      console.log("📴 Appel terminé")
      setCurrentCall((prev) =>
        prev
          ? {
              ...prev,
              status: "ended",
              endTime: new Date().toISOString(),
            }
          : null,
      )
      setIncomingCall(null)
    })

    // Connexion établie
    webrtcClient.on("call-connected", () => {
      console.log("🔗 Appel connecté")
      setCurrentCall((prev) => (prev ? { ...prev, status: "active" } : null))
    })

    return () => {
      // Nettoyer les handlers WebRTC
      webrtcClient.off("incoming-call")
      webrtcClient.off("call-answered")
      webrtcClient.off("call-rejected")
      webrtcClient.off("call-ended")
      webrtcClient.off("call-connected")
    }
  }, [])

  // Auto-connexion
  useEffect(() => {
    if (currentUserId && !isConnected) {
      connect()
    }

    return () => {
      if (isConnected) {
        disconnect()
      }
    }
  }, [currentUserId, isConnected, connect, disconnect])

  return {
    // État de connexion
    isConnected,
    connectionError,
    onlineUsers,

    // Messages
    messages,
    sendMessage,

    // Frappe
    typingUsers,
    sendTyping,

    // Lecture
    markAsRead,

    // Appels
    incomingCall,
    currentCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,

    // Contrôles
    connect,
    disconnect,

    // WebRTC
    webrtcClient,
  }
}
