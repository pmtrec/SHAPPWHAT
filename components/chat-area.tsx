"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Send,
  Plus,
  ImageIcon,
  FileText,
  Camera,
  MicIcon,
  Wifi,
  WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageBubble } from "@/components/message-bubble"
import { AudioRecorder } from "@/components/audio-recorder"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatAreaProps {
  selectedContact: any
  selectedGroup: any
  conversations: any
  onSendMessage: (message: any) => void
  onBack: () => void
  user: any
  onCall?: (targetUserId: string, callType: "voice" | "video") => void
  isConnected?: boolean
}

export function ChatArea({
  selectedContact,
  selectedGroup,
  conversations,
  onSendMessage,
  onBack,
  user,
  onCall,
  isConnected = false,
}: ChatAreaProps) {
  const [message, setMessage] = useState("")
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const currentTarget = selectedContact || selectedGroup
  const conversationId = selectedContact
    ? `conv_${user.id}_${selectedContact.id}`
    : selectedGroup
      ? `group_${selectedGroup.id}`
      : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversations, conversationId])

  const getUserInitials = (name: string) => {
    const parts = name.split(" ")
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase()
  }

  const getProfileColor = (name: string) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const handleSendMessage = () => {
    if (!message.trim() || !currentTarget) return

    onSendMessage({
      contenu: message.trim(),
      type: "text",
    })

    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendAudio = (audioBlob: Blob, duration: number) => {
    const audioUrl = URL.createObjectURL(audioBlob)
    onSendMessage({
      contenu: audioUrl,
      type: "audio",
      duree: duration,
    })
    setShowAudioRecorder(false)
  }

  // Gestion des fichiers
  const handleFileUpload = (file: File, type: string) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      onSendMessage({
        contenu: e.target?.result,
        type: type,
        nom: file.name,
        taille: file.size,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, "image")
    }
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, "file")
    }
  }

  const handleCall = (type: "voice" | "video") => {
    if (selectedContact && onCall) {
      onCall(selectedContact.id, type)
    }
  }

  const attachOptions = [
    {
      icon: ImageIcon,
      label: "Photo",
      color: "text-purple-500",
      onClick: () => imageInputRef.current?.click(),
    },
    {
      icon: FileText,
      label: "Document",
      color: "text-blue-500",
      onClick: () => fileInputRef.current?.click(),
    },
    {
      icon: Camera,
      label: "Caméra",
      color: "text-pink-500",
      onClick: () => console.log("Ouvrir caméra"),
    },
  ]

  if (!currentTarget) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 bg-[#0b141a] flex items-center justify-center chat-background"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-64 h-64 mx-auto mb-8"
          >
            <svg viewBox="0 0 303 172" className="w-full h-full">
              <defs>
                <linearGradient id="a" x1="50%" x2="50%" y1="100%" y2="0%">
                  <stop offset="0%" stopColor="#25d366" stopOpacity=".1"></stop>
                  <stop offset="100%" stopColor="#25d366" stopOpacity=".05"></stop>
                </linearGradient>
              </defs>
              <g fill="none" fillRule="evenodd">
                <path fill="url(#a)" d="M229.38 158.13H0V0h303v84.37c0 28.35-23.03 51.38-51.38 51.38H229.38z"></path>
                <path fill="#404040" d="M229.38 143.13H15V15h273v69.37c0 20.07-16.31 36.38-36.38 36.38H229.38z"></path>
              </g>
            </svg>
          </motion.div>
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-light text-gray-300 mb-2"
          >
            WhatsApp Web
          </motion.h3>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-400 max-w-md mx-auto"
          >
            Sélectionnez un contact ou un groupe pour commencer à discuter.
          </motion.p>
        </div>
      </motion.div>
    )
  }

  // Obtenir les messages de la conversation actuelle
  const messages = conversationId && conversations[conversationId] ? conversations[conversationId] : []
  const displayName = currentTarget.name || currentTarget.nom

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col bg-[#0b141a]"
    >
      {/* Chat Header */}
      <div className="bg-[#202c33] border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-2 md:hidden text-gray-300 hover:bg-[#2a3942]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`relative ${selectedContact?.isOnline ? "status-indicator" : "status-indicator offline"}`}
          >
            <Avatar className="w-10 h-10 mr-3">
              {currentTarget.avatar ? (
                <AvatarImage src={currentTarget.avatar || "/placeholder.svg"} alt={displayName} />
              ) : (
                <AvatarFallback
                  className="text-white font-bold"
                  style={{
                    backgroundColor: selectedGroup ? "#00a884" : getProfileColor(displayName),
                  }}
                >
                  {getUserInitials(displayName)}
                </AvatarFallback>
              )}
            </Avatar>
          </motion.div>

          <div>
            <h3 className="font-medium text-white">{displayName}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-400">
                {selectedGroup
                  ? `${selectedGroup.membres?.length || selectedGroup.members?.length || 0} membres`
                  : selectedContact?.isOnline
                    ? "en ligne"
                    : "hors ligne"}
              </p>
              {/* Indicateur de connexion */}
              <div className="flex items-center">
                {isConnected ? (
                  <Wifi className="w-3 h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-[#2a3942]"
                    onClick={() => handleCall("voice")}
                    disabled={!selectedContact || !isConnected}
                  >
                    <Phone className="w-5 h-5" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Appel vocal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-[#2a3942]"
                    onClick={() => handleCall("video")}
                    disabled={!selectedContact || !isConnected}
                  >
                    <Video className="w-5 h-5" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Appel vidéo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-[#2a3942]">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Plus d'options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="bg-yellow-600 text-white text-center py-2 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span>Connexion en cours... Les messages seront envoyés une fois connecté.</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 chat-background">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-400 py-8"
          >
            <p>Aucun message pour le moment</p>
            <p className="text-sm mt-2">Commencez la conversation !</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg: any, index: number) => (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <MessageBubble message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Audio Recorder */}
      <AnimatePresence>
        {showAudioRecorder && (
          <AudioRecorder onSendAudio={handleSendAudio} onCancel={() => setShowAudioRecorder(false)} />
        )}
      </AnimatePresence>

      {/* Message Input */}
      {!showAudioRecorder && (
        <div className="bg-[#202c33] p-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-[#2a3942]"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Menu d'attachement */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-12 left-0 bg-[#233138] rounded-lg shadow-lg p-2 z-10 glass-effect"
                  >
                    <div className="flex flex-col space-y-2">
                      {attachOptions.map((option, index) => (
                        <motion.div
                          key={option.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center p-2 hover:bg-[#2a3942] rounded cursor-pointer"
                          onClick={() => {
                            option.onClick()
                            setShowAttachMenu(false)
                          }}
                        >
                          <option.icon className={`w-5 h-5 mr-2 ${option.color}`} />
                          <span className="text-white text-sm">{option.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Entrez un message" : "Connexion en cours..."}
                className="pr-20 bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400 focus:border-[#00a884] focus:ring-[#00a884]"
                disabled={!isConnected}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white w-8 h-8 p-0">
                    <Smile className="w-5 h-5" />
                  </Button>
                </motion.div>
                {message.trim() ? (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSendMessage}
                      size="sm"
                      className="bg-[#00a884] hover:bg-[#008069] w-8 h-8 p-0"
                      disabled={!isConnected}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white w-8 h-8 p-0"
                      onClick={() => setShowAudioRecorder(true)}
                    >
                      <MicIcon className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Inputs cachés pour les fichiers */}
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <input ref={fileInputRef} type="file" onChange={handleDocumentUpload} className="hidden" />
        </div>
      )}
    </motion.div>
  )
}
