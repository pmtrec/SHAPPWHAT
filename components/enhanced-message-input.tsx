"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Send,
  Plus,
  ImageIcon,
  FileText,
  Camera,
  MicIcon,
  X,
  Smile,
  MapPin,
  User,
  Eye,
  EyeOff,
  Clock,
  Gift,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { EmojiPicker } from "@/components/emoji-picker"
import { LocationPicker } from "@/components/location-picker"
import { ContactPicker } from "@/components/contact-picker"
import { GifPicker } from "@/components/gif-picker"
import { StickerPicker } from "@/components/sticker-picker"

interface EnhancedMessageInputProps {
  onSendMessage: (message: any) => void
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  recordingTime: number
  replyTo?: any
  onCancelReply?: () => void
  contacts?: any[]
  isGroup?: boolean
}

export function EnhancedMessageInput({
  onSendMessage,
  isRecording,
  onStartRecording,
  onStopRecording,
  recordingTime,
  replyTo,
  onCancelReply,
  contacts = [],
  isGroup = false,
}: EnhancedMessageInputProps) {
  const [message, setMessage] = useState("")
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showContactPicker, setShowContactPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [viewOnce, setViewOnce] = useState(false)
  const [disappearingTime, setDisappearingTime] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = () => {
    if (!message.trim()) return

    const messageData = {
      content: message.trim(),
      type: "text",
      replyTo: replyTo?.id || null,
      viewOnce,
      disappearAt: disappearingTime ? new Date(Date.now() + disappearingTime).toISOString() : null,
      mentions: extractMentions(message),
    }

    onSendMessage(messageData)
    setMessage("")
    setViewOnce(false)
    setDisappearingTime(null)
    if (onCancelReply) onCancelReply()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const extractMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }
    return mentions
  }

  const handleFileUpload = (file: File, type: string) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      onSendMessage({
        content: e.target?.result,
        type: type,
        fileName: file.name,
        fileSize: file.size,
        viewOnce,
        disappearAt: disappearingTime ? new Date(Date.now() + disappearingTime).toISOString() : null,
      })
      setViewOnce(false)
      setDisappearingTime(null)
    }
    reader.readAsDataURL(file)
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleGifSelect = (gif: any) => {
    onSendMessage({
      content: gif.url,
      type: "gif",
      viewOnce,
      disappearAt: disappearingTime ? new Date(Date.now() + disappearingTime).toISOString() : null,
    })
    setShowGifPicker(false)
    setViewOnce(false)
    setDisappearingTime(null)
  }

  const handleStickerSelect = (sticker: any) => {
    onSendMessage({
      content: sticker.url,
      type: "sticker",
      viewOnce,
      disappearAt: disappearingTime ? new Date(Date.now() + disappearingTime).toISOString() : null,
    })
    setShowStickerPicker(false)
    setViewOnce(false)
    setDisappearingTime(null)
  }

  const handleLocationShare = (location: any) => {
    onSendMessage({
      content: location,
      type: "location",
      viewOnce,
      disappearAt: disappearingTime ? new Date(Date.now() + disappearingTime).toISOString() : null,
    })
    setShowLocationPicker(false)
    setViewOnce(false)
    setDisappearingTime(null)
  }

  const handleContactShare = (contact: any) => {
    onSendMessage({
      content: contact,
      type: "contact",
      viewOnce,
      disappearAt: disappearingTime ? new Date(Date.now() + disappearingTime).toISOString() : null,
    })
    setShowContactPicker(false)
    setViewOnce(false)
    setDisappearingTime(null)
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const attachOptions = [
    {
      icon: ImageIcon,
      label: "Photo",
      color: "text-purple-500",
      onClick: () => imageInputRef.current?.click(),
    },
    {
      icon: Camera,
      label: "Vidéo",
      color: "text-red-500",
      onClick: () => videoInputRef.current?.click(),
    },
    {
      icon: FileText,
      label: "Document",
      color: "text-blue-500",
      onClick: () => documentInputRef.current?.click(),
    },
    {
      icon: MapPin,
      label: "Position",
      color: "text-green-500",
      onClick: () => setShowLocationPicker(true),
    },
    {
      icon: User,
      label: "Contact",
      color: "text-orange-500",
      onClick: () => setShowContactPicker(true),
    },
    {
      icon: Gift,
      label: "GIF",
      color: "text-pink-500",
      onClick: () => setShowGifPicker(true),
    },
    {
      icon: Zap,
      label: "Sticker",
      color: "text-yellow-500",
      onClick: () => setShowStickerPicker(true),
    },
  ]

  const disappearingOptions = [
    { label: "24 heures", value: 24 * 60 * 60 * 1000 },
    { label: "7 jours", value: 7 * 24 * 60 * 60 * 1000 },
    { label: "90 jours", value: 90 * 24 * 60 * 60 * 1000 },
  ]

  return (
    <div className="bg-[#202c33] p-4">
      {/* Reply preview */}
      {replyTo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-2 p-2 bg-[#2a3942] rounded-lg"
        >
          <div className="flex-1">
            <p className="text-[#00a884] text-sm font-medium">Répondre à {replyTo.sender}</p>
            <p className="text-gray-300 text-sm truncate">{replyTo.content}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancelReply} className="text-gray-400">
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-2 p-2 bg-[#2a3942] rounded-lg"
        >
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-white text-sm">Enregistrement... {formatRecordingTime(recordingTime)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onStopRecording} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Message options */}
      <div className="flex items-center space-x-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewOnce(!viewOnce)}
          className={`text-xs ${viewOnce ? "text-[#00a884]" : "text-gray-400"}`}
        >
          {viewOnce ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span className="ml-1">Vue unique</span>
        </Button>

        <div className="flex items-center">
          <Clock className="w-4 h-4 text-gray-400 mr-1" />
          <select
            value={disappearingTime || ""}
            onChange={(e) => setDisappearingTime(e.target.value ? Number.parseInt(e.target.value) : null)}
            className="bg-[#2a3942] text-gray-300 text-xs px-2 py-1 rounded border-none"
          >
            <option value="">Permanent</option>
            {disappearingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main input area */}
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

          {/* Attachment menu */}
          <AnimatePresence>
            {showAttachMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-12 left-0 bg-[#233138] rounded-lg shadow-lg p-2 z-10 glass-effect"
              >
                <div className="grid grid-cols-2 gap-2">
                  {attachOptions.map((option, index) => (
                    <motion.div
                      key={option.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center p-3 hover:bg-[#2a3942] rounded cursor-pointer"
                      onClick={() => {
                        option.onClick()
                        setShowAttachMenu(false)
                      }}
                    >
                      <option.icon className={`w-6 h-6 mb-1 ${option.color}`} />
                      <span className="text-white text-xs">{option.label}</span>
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
            placeholder={isGroup ? "Entrez un message ou @mention" : "Entrez un message"}
            className="pr-20 bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400 focus:border-[#00a884] focus:ring-[#00a884]"
            disabled={isRecording}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white w-8 h-8 p-0"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-5 h-5" />
              </Button>
            </motion.div>
            {message.trim() ? (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleSendMessage} size="sm" className="bg-[#00a884] hover:bg-[#008069] w-8 h-8 p-0">
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white w-8 h-8 p-0"
                  onMouseDown={onStartRecording}
                  onMouseUp={onStopRecording}
                  onMouseLeave={onStopRecording}
                >
                  <MicIcon className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Pickers */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 right-4 z-20"
          >
            <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
          </motion.div>
        )}

        {showGifPicker && <GifPicker onGifSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />}

        {showStickerPicker && (
          <StickerPicker onStickerSelect={handleStickerSelect} onClose={() => setShowStickerPicker(false)} />
        )}

        {showLocationPicker && (
          <LocationPicker onLocationSelect={handleLocationShare} onClose={() => setShowLocationPicker(false)} />
        )}

        {showContactPicker && (
          <ContactPicker
            contacts={contacts}
            onContactSelect={handleContactShare}
            onClose={() => setShowContactPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file, "image")
        }}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file, "video")
        }}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file, "document")
        }}
        className="hidden"
      />
    </div>
  )
}
