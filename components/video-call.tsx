"use client"

import { useState, useRef, useEffect } from "react"
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

interface VideoCallProps {
  contact: any
  onEndCall: () => void
  callType: "voice" | "video"
}

export function VideoCall({ contact, onEndCall, callType }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(callType === "voice")
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    initializeCall()

    // Simuler la connexion après 3 secondes
    const connectTimer = setTimeout(() => {
      setIsConnected(true)
    }, 3000)

    // Démarrer le compteur de durée
    const durationTimer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => {
      cleanup()
      clearTimeout(connectTimer)
      clearInterval(durationTimer)
    }
  }, [])

  const initializeCall = async () => {
    try {
      // Obtenir l'accès à la caméra et au microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      })

      localStreamRef.current = stream

      if (localVideoRef.current && callType === "video") {
        localVideoRef.current.srcObject = stream
      }

      // Initialiser WebRTC (simulation)
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      })

      peerConnectionRef.current = peerConnection

      // Ajouter le stream local
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })

      // Gérer le stream distant (simulation)
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation de l'appel:", error)
    }
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getUserInitials = (name: string) => {
    const parts = name.split(" ")
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Video Area */}
      <div className="flex-1 relative">
        {callType === "video" && isConnected ? (
          <>
            {/* Remote Video */}
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

            {/* Local Video (Picture in Picture) */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
              {!isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </>
        ) : (
          /* Voice Call or Connecting */
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-6">
                <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-[#00a884] text-white text-4xl">
                  {getUserInitials(contact.nom || contact.name)}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-light text-white mb-2">{contact.nom || contact.name}</h2>

              <p className="text-gray-400 mb-4">
                {!isConnected
                  ? callType === "video"
                    ? "Appel vidéo..."
                    : "Appel en cours..."
                  : formatDuration(callDuration)}
              </p>

              {!isConnected && (
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-[#00a884] rounded-full"></div>
                    <div className="w-2 h-2 bg-[#00a884] rounded-full animation-delay-200"></div>
                    <div className="w-2 h-2 bg-[#00a884] rounded-full animation-delay-400"></div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Call Status */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-1">
        <span className="text-white text-sm">{isConnected ? formatDuration(callDuration) : "Connexion..."}</span>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-4">
          {/* Mute */}
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleMute}
            className={`rounded-full w-14 h-14 ${
              isMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </Button>

          {/* Speaker (Voice calls only) */}
          {callType === "voice" && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`rounded-full w-14 h-14 ${
                isSpeakerOn ? "bg-[#00a884] hover:bg-[#008069]" : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
            </Button>
          )}

          {/* Video Toggle (Video calls only) */}
          {callType === "video" && (
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleVideo}
              className={`rounded-full w-14 h-14 ${
                isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
            </Button>
          )}

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
