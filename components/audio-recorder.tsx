"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Send, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob, duration: number) => void
  onCancel: () => void
}

export function AudioRecorder({ onSendAudio, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream
      chunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      mediaRecorder.start(100) // Collecter les données toutes les 100ms
      setIsRecording(true)
      setIsPaused(false)

      // Démarrer le timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Erreur lors de l'accès au microphone:", error)
      alert("Impossible d'accéder au microphone. Veuillez vérifier les permissions.")
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setRecordingTime(0)
    setIsPlaying(false)
  }

  const sendAudio = () => {
    if (audioBlob) {
      onSendAudio(audioBlob, recordingTime)
      cleanup()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleCancel = () => {
    cleanup()
    onCancel()
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="bg-[#202c33] border-t border-gray-700 p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Bouton d'enregistrement principal */}
          {!audioBlob && (
            <div className="flex items-center space-x-2">
              {!isRecording ? (
                <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 rounded-full w-12 h-12 p-0">
                  <Mic className="w-6 h-6" />
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 rounded-full w-12 h-12 p-0">
                    <Square className="w-6 h-6" />
                  </Button>
                  {!isPaused ? (
                    <Button onClick={pauseRecording} variant="ghost" className="text-gray-300 hover:text-white">
                      <Pause className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button onClick={resumeRecording} variant="ghost" className="text-gray-300 hover:text-white">
                      <Play className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contrôles de lecture */}
          {audioBlob && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="bg-[#00a884] hover:bg-[#008069] rounded-full w-12 h-12 p-0"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button onClick={deleteRecording} variant="ghost" className="text-red-400 hover:text-red-300">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Indicateur de temps */}
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-mono">{formatTime(recordingTime)}</span>
                {isPaused && <span className="text-yellow-400 text-sm">PAUSE</span>}
              </div>
            )}
            {audioBlob && !isRecording && <span className="text-gray-300 font-mono">{formatTime(recordingTime)}</span>}
          </div>

          {/* Visualiseur audio (simulation) */}
          {isRecording && !isPaused && (
            <div className="flex items-center space-x-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-[#00a884] rounded-full"
                  animate={{
                    height: [4, Math.random() * 20 + 4, 4],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-2">
          <Button onClick={handleCancel} variant="ghost" className="text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
          {audioBlob && (
            <Button onClick={sendAudio} className="bg-[#00a884] hover:bg-[#008069]">
              <Send className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Audio element pour la lecture */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </motion.div>
  )
}
