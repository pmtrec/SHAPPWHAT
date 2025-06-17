class WebSocketClient {
  private ws: WebSocket | null = null
  private userId: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private isConnecting = false

  constructor() {
    this.setupEventHandlers()
  }

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error("Connexion déjà en cours"))
        return
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      this.isConnecting = true
      this.userId = userId

      try {
        // Utiliser le même serveur que l'API REST avec le path WebSocket
        const wsUrl = `ws://localhost:3001/ws?userId=${encodeURIComponent(userId)}`
        console.log("🔌 Connexion WebSocket:", wsUrl)

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log("✅ WebSocket connecté pour:", userId)
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error("❌ Erreur parsing message WebSocket:", error)
          }
        }

        this.ws.onclose = (event) => {
          console.log("🔴 WebSocket fermé:", event.code, event.reason)
          this.isConnecting = false
          this.stopHeartbeat()

          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error("❌ Erreur WebSocket:", error)
          this.isConnecting = false
          reject(error)
        }

        // Timeout de connexion
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false
            this.ws?.close()
            reject(new Error("Timeout de connexion WebSocket"))
          }
        }, 10000)
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close(1000, "Déconnexion volontaire")
      this.ws = null
    }
    this.userId = null
    this.reconnectAttempts = 0
  }

  sendMessage(type: string, data: any, to?: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket non connecté, impossible d'envoyer:", type)
      return false
    }

    try {
      const message = {
        type,
        data,
        to,
        timestamp: new Date().toISOString(),
      }

      this.ws.send(JSON.stringify(message))
      console.log("📤 Message envoyé:", type, to ? `vers ${to}` : "")
      return true
    } catch (error) {
      console.error("❌ Erreur envoi message:", error)
      return false
    }
  }

  // Méthodes spécifiques pour chaque type de message
  sendChatMessage(content: string, conversationId: string, to: string, messageType = "text") {
    return this.sendMessage(
      "chat-message",
      {
        content,
        conversationId,
        messageType,
      },
      to,
    )
  }

  sendCallOffer(offer: RTCSessionDescriptionInit, to: string, callType: "voice" | "video" = "voice") {
    return this.sendMessage(
      "call-offer",
      {
        offer,
        type: callType,
      },
      to,
    )
  }

  sendCallAnswer(answer: RTCSessionDescriptionInit, to: string, callId: string, accepted = true) {
    return this.sendMessage(
      "call-answer",
      {
        answer,
        callId,
        accepted,
      },
      to,
    )
  }

  sendIceCandidate(candidate: RTCIceCandidate, to: string) {
    return this.sendMessage(
      "ice-candidate",
      {
        candidate: candidate.toJSON(),
      },
      to,
    )
  }

  sendCallEnd(to: string, callId: string) {
    return this.sendMessage(
      "call-end",
      {
        callId,
      },
      to,
    )
  }

  sendTyping(to: string, isTyping: boolean) {
    return this.sendMessage(
      "typing",
      {
        isTyping,
      },
      to,
    )
  }

  sendMessageRead(to: string, messageIds: string[]) {
    return this.sendMessage(
      "message-read",
      {
        messageIds,
      },
      to,
    )
  }

  // Gestion des handlers de messages
  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler)
  }

  offMessage(type: string) {
    this.messageHandlers.delete(type)
  }

  private handleMessage(message: any) {
    const { type, data, from } = message

    console.log("📥 Message reçu:", type, from ? `de ${from}` : "")

    const handler = this.messageHandlers.get(type)
    if (handler) {
      handler({ ...data, from })
    } else {
      console.log("⚠️ Pas de handler pour:", type)
    }
  }

  private setupEventHandlers() {
    // Handler par défaut pour les messages système
    this.onMessage("ping", () => {
      this.sendMessage("pong", {})
    })

    this.onMessage("server-shutdown", (data) => {
      console.log("🛑 Serveur en cours d'arrêt:", data.message)
    })
  }

  private heartbeatInterval: NodeJS.Timeout | null = null

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage("ping", {})
      }
    }, 30000) // Ping toutes les 30 secondes
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`)

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId).catch(console.error)
      }
    }, delay)
  }

  // Getters pour l'état de connexion
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): string {
    if (!this.ws) return "disconnected"

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting"
      case WebSocket.OPEN:
        return "connected"
      case WebSocket.CLOSING:
        return "closing"
      case WebSocket.CLOSED:
        return "disconnected"
      default:
        return "unknown"
    }
  }
}

// Instance singleton
export const wsClient = new WebSocketClient()
