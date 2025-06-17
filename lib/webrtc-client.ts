"use client"

import { wsClient } from "./websocket-client"

export interface CallData {
  callId: string
  from: string
  to: string
  type: "voice" | "video"
  offer?: RTCSessionDescriptionInit
  answer?: RTCSessionDescriptionInit
  candidate?: RTCIceCandidateInit
}

export interface CallEvent {
  type: "incoming-call" | "call-answered" | "call-ended" | "call-connected" | "call-disconnected" | "remote-stream"
  data: any
}

class WebRTCClient {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private currentCallId: string | null = null
  private isInitiator = false
  private eventHandlers: Map<string, ((data: any) => void)[]> = new Map()

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  }

  constructor() {
    this.setupWebSocketListeners()
  }

  // Système d'événements personnalisé
  on(event: string, handler: (data: any) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  off(event: string, handler?: (data: any) => void) {
    if (!this.eventHandlers.has(event)) return

    if (handler) {
      const handlers = this.eventHandlers.get(event)!
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      this.eventHandlers.set(event, [])
    }
  }

  private emit(event: string, data?: any) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Erreur dans le handler ${event}:`, error)
        }
      })
    }
  }

  private setupWebSocketListeners() {
    // Utiliser le nouveau système de handlers de messages
    wsClient.onMessage("call-offer", (data) => {
      console.log("📞 Offre d'appel reçue:", data)
      this.handleCallOffer(data)
    })

    wsClient.onMessage("call-answer", (data) => {
      console.log("✅ Réponse d'appel reçue:", data)
      this.handleCallAnswer(data)
    })

    wsClient.onMessage("ice-candidate", (data) => {
      console.log("🧊 Candidat ICE reçu:", data)
      this.handleIceCandidate(data)
    })

    wsClient.onMessage("call-end", (data) => {
      console.log("📴 Fin d'appel reçue:", data)
      this.handleCallEnd(data)
    })
  }

  async initiateCall(targetUserId: string, callType: "voice" | "video" = "voice"): Promise<string> {
    try {
      if (!wsClient.isConnected) {
        throw new Error("WebSocket non connecté")
      }

      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.currentCallId = callId
      this.isInitiator = true

      console.log(`📞 Initiation appel ${callType} vers ${targetUserId}`)

      // Obtenir le stream local
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      })

      console.log(
        "🎥 Stream local obtenu:",
        this.localStream.getTracks().map((t) => t.kind),
      )

      // Créer la connexion peer
      await this.createPeerConnection()

      // Ajouter le stream local
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          console.log("➕ Ajout track:", track.kind)
          this.peerConnection.addTrack(track, this.localStream)
        }
      })

      // Créer l'offre
      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === "video",
      })
      await this.peerConnection!.setLocalDescription(offer)

      console.log("📤 Envoi offre d'appel")

      // Envoyer l'offre via WebSocket
      const success = wsClient.sendCallOffer(offer, targetUserId, callType)
      if (!success) {
        throw new Error("Impossible d'envoyer l'offre d'appel")
      }

      this.emit("call-initiated", { callId, targetUserId, callType })
      return callId
    } catch (error) {
      console.error("❌ Erreur lors de l'initiation de l'appel:", error)
      this.cleanup()
      throw error
    }
  }

  async acceptCall(callData: CallData): Promise<void> {
    try {
      console.log("✅ Acceptation de l'appel:", callData.callId)

      this.currentCallId = callData.callId
      this.isInitiator = false

      // Obtenir le stream local
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: callData.type === "video",
        audio: true,
      })

      console.log(
        "🎥 Stream local obtenu pour réponse:",
        this.localStream.getTracks().map((t) => t.kind),
      )

      // Créer la connexion peer
      await this.createPeerConnection()

      // Ajouter le stream local
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          console.log("➕ Ajout track pour réponse:", track.kind)
          this.peerConnection.addTrack(track, this.localStream)
        }
      })

      // Définir la description distante
      if (callData.offer) {
        await this.peerConnection!.setRemoteDescription(callData.offer)
        console.log("📥 Description distante définie")
      }

      // Créer la réponse
      const answer = await this.peerConnection!.createAnswer()
      await this.peerConnection!.setLocalDescription(answer)

      console.log("📤 Envoi réponse d'appel")

      // Envoyer la réponse
      const success = wsClient.sendCallAnswer(answer, callData.from, callData.callId, true)
      if (!success) {
        throw new Error("Impossible d'envoyer la réponse d'appel")
      }

      this.emit("call-accepted", callData)
    } catch (error) {
      console.error("❌ Erreur lors de l'acceptation de l'appel:", error)
      this.rejectCall(callData)
      throw error
    }
  }

  rejectCall(callData: CallData) {
    console.log("❌ Rejet de l'appel:", callData.callId)
    wsClient.sendCallAnswer({} as RTCSessionDescriptionInit, callData.from, callData.callId, false)
    this.cleanup()
  }

  endCall() {
    console.log("📴 Fin d'appel")
    if (this.currentCallId) {
      // Trouver l'autre participant (à améliorer avec une meilleure gestion des participants)
      wsClient.sendCallEnd("", this.currentCallId) // Le serveur diffusera à tous les participants
    }
    this.cleanup()
  }

  private async createPeerConnection() {
    console.log("🔗 Création de la connexion peer")
    this.peerConnection = new RTCPeerConnection(this.configuration)

    // Gérer les candidats ICE
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 Nouveau candidat ICE:", event.candidate.type)
        wsClient.sendIceCandidate(event.candidate, "") // Le serveur diffusera
      } else {
        console.log("🧊 Collecte des candidats ICE terminée")
      }
    }

    // Gérer le stream distant
    this.peerConnection.ontrack = (event) => {
      console.log(
        "📺 Stream distant reçu:",
        event.streams[0].getTracks().map((t) => t.kind),
      )
      this.remoteStream = event.streams[0]
      this.emit("remote-stream", this.remoteStream)
    }

    // Gérer les changements de connexion
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      console.log("🔄 État de connexion:", state)

      if (state === "connected") {
        this.emit("call-connected")
      } else if (state === "disconnected" || state === "failed") {
        this.emit("call-disconnected")
      }
    }

    // Gérer les changements d'état ICE
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState
      console.log("🧊 État ICE:", state)
    }
  }

  private async handleCallOffer(data: any) {
    console.log("📞 Traitement offre d'appel:", data)
    const callData: CallData = {
      callId: data.callId || `call_${Date.now()}`,
      from: data.from,
      to: "", // Sera rempli par le composant
      type: data.type || "voice",
      offer: data.offer,
    }
    this.emit("incoming-call", callData)
  }

  private async handleCallAnswer(data: any) {
    try {
      console.log("✅ Traitement réponse d'appel:", data)

      if (!data.accepted) {
        console.log("❌ Appel rejeté")
        this.emit("call-rejected", data)
        this.cleanup()
        return
      }

      if (this.peerConnection && data.answer) {
        await this.peerConnection.setRemoteDescription(data.answer)
        console.log("📥 Description distante définie pour la réponse")
        this.emit("call-answered", data)
      }
    } catch (error) {
      console.error("❌ Erreur lors du traitement de la réponse:", error)
      this.emit("call-error", error)
    }
  }

  private async handleIceCandidate(data: any) {
    try {
      if (this.peerConnection && data.candidate) {
        const candidate = new RTCIceCandidate(data.candidate)
        await this.peerConnection.addIceCandidate(candidate)
        console.log("🧊 Candidat ICE ajouté:", candidate.type)
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du candidat ICE:", error)
    }
  }

  private handleCallEnd(data?: any) {
    console.log("📴 Traitement fin d'appel:", data)
    this.emit("call-ended", data)
    this.cleanup()
  }

  private cleanup() {
    console.log("🧹 Nettoyage des ressources WebRTC")

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
        console.log("⏹️ Track arrêté:", track.kind)
      })
      this.localStream = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.remoteStream = null
    this.currentCallId = null
    this.isInitiator = false
  }

  // Contrôles pendant l'appel
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        console.log("🔇 Audio", audioTrack.enabled ? "activé" : "désactivé")
        return !audioTrack.enabled // Retourne true si muted
      }
    }
    return false
  }

  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        console.log("📹 Vidéo", videoTrack.enabled ? "activée" : "désactivée")
        return !videoTrack.enabled // Retourne true si video off
      }
    }
    return false
  }

  // Getters
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  getCurrentCallId(): string | null {
    return this.currentCallId
  }

  isInCall(): boolean {
    return this.currentCallId !== null
  }

  getConnectionState(): string {
    return this.peerConnection?.connectionState || "disconnected"
  }
}

// Instance singleton
export const webrtcClient = new WebRTCClient()
