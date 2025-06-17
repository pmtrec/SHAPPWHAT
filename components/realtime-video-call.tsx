"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RealtimeVideoCallProps {
  callData: any
  onEndCall: () => void
  onToggleMute: () => boolean
  onToggleVideo: () => boolean
  contacts: any[]
  localStream: MediaStream | null
  remoteStream: MediaStream | null
}

export function RealtimeVideoCall({
  callData,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  contacts,
  localStream,
  remoteStream,
}: RealtimeVideoCallProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const participant = contacts.find((c) => c.id === (callData.from === "moi" ? callData.to : callData.from)) || {
    nom: "Inconnu",
    avatar: null,
  }

  // Configurer les flux vidéo
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [localStream, remoteStream])

  // Minuteur d'appel
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Formater la durée
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleToggleMute = () => {
    const newMuteState = onToggleMute()
    setIsMuted(newMuteState)
  }

  const handleToggleVideo = () => {
    const newVideoState = onToggleVideo()
    setIsVideoOff(newVideoState)
  }

  const handleToggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = isSpeakerOn
      setIsSpeakerOn(!isSpeakerOn)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Zone principale de l'appel */}
      <div className="flex-1 relative">
        {/* Vidéo distante (plein écran) */}
        {callData.type === "video" && remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1f2c34]">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-[#00a884] mx-auto mb-4 flex items-center justify-center">
                {participant.avatar ? (
                  <img
                    src={participant.avatar || "/placeholder.svg"}
                    alt={participant.nom}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-white">{participant.nom.charAt(0)}</span>
                )}
              </div>
              <h3 className="text-2xl font-medium text-white mb-2">{participant.nom}</h3>
              <p className="text-gray-300">{formatDuration(callDuration)}</p>
            </div>
          </div>
        )}

        {/* Vidéo locale (petite fenêtre) */}
        {callData.type === "video" && !isVideoOff && (
          <div className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Contrôles d'appel */}
      <div className="bg-[#1f2c34] p-6 flex justify-center space-x-6">
        <Button
          onClick={handleToggleMute}
          className={`w-14 h-14 rounded-full ${
            isMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
          } flex items-center justify-center`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        {callData.type === "video" && (
          <Button
            onClick={handleToggleVideo}
            className={`w-14 h-14 rounded-full ${
              isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
            } flex items-center justify-center`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>
        )}

        <Button
          onClick={handleToggleSpeaker}
          className={`w-14 h-14 rounded-full ${
            !isSpeakerOn ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
          } flex items-center justify-center`}
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </Button>

        <Button
          onClick={onEndCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  )
}
