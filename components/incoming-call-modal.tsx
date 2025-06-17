"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Phone, PhoneOff, Video } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IncomingCallModalProps {
  callData: any
  onAccept: () => void
  onReject: () => void
  contacts: any[]
}

export function IncomingCallModal({ callData, onAccept, onReject, contacts }: IncomingCallModalProps) {
  const [isRinging, setIsRinging] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const caller = contacts.find((c) => c.id === callData.from) || { nom: "Inconnu", avatar: null }

  // Effet de sonnerie
  useEffect(() => {
    // Créer un contexte audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Créer un oscillateur pour la sonnerie
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // La note A4

    // Moduler le volume pour créer un effet de sonnerie
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Démarrer l'oscillateur
    oscillator.start()

    // Répéter la sonnerie
    const interval = setInterval(() => {
      if (isRinging) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6)
      }
    }, 1000)

    // Faire vibrer le téléphone
    if ("vibrate" in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300])
    }

    return () => {
      clearInterval(interval)
      oscillator.stop()
      audioContext.close()
      if ("vibrate" in navigator) {
        navigator.vibrate(0) // Arrêter la vibration
      }
    }
  }, [isRinging])

  const handleAccept = () => {
    setIsRinging(false)
    onAccept()
  }

  const handleReject = () => {
    setIsRinging(false)
    onReject()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <div className="bg-[#1f2c34] rounded-lg shadow-xl w-full max-w-md p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
          className="w-24 h-24 rounded-full bg-[#00a884] mx-auto mb-4 flex items-center justify-center"
        >
          {caller.avatar ? (
            <img
              src={caller.avatar || "/placeholder.svg"}
              alt={caller.nom}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-4xl text-white">{caller.nom.charAt(0)}</span>
          )}
        </motion.div>

        <h3 className="text-xl font-medium text-white mb-1">{caller.nom}</h3>
        <p className="text-gray-300 mb-6">
          {callData.type === "video" ? "Appel vidéo entrant" : "Appel vocal entrant"}
        </p>

        <div className="flex justify-center space-x-8">
          <Button
            onClick={handleReject}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
          >
            <PhoneOff className="w-8 h-8" />
          </Button>

          <Button
            onClick={handleAccept}
            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
          >
            {callData.type === "video" ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
