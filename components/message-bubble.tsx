"use client"

import {
  Check,
  CheckCheck,
  Download,
  Play,
  Pause,
  Reply,
  Forward,
  Star,
  MoreVertical,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  FrownIcon as Sad,
  ThumbsUpIcon as Wow,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MessageBubbleProps {
  message: any
  onReply?: (message: any) => void
  onForward?: (message: any) => void
  onStar?: (message: any) => void
  onReact?: (message: any, reaction: string) => void
  onEdit?: (message: any) => void
  onDelete?: (message: any) => void
  isGroup?: boolean
}

export function MessageBubble({
  message,
  onReply,
  onForward,
  onStar,
  onReact,
  onEdit,
  onDelete,
  isGroup = false,
}: MessageBubbleProps) {
  const isMyMessage = message.expediteur === "moi"
  const [isPlaying, setIsPlaying] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  const reactions = [
    { emoji: "❤️", name: "heart", icon: Heart },
    { emoji: "👍", name: "like", icon: ThumbsUp },
    { emoji: "😂", name: "laugh", icon: Laugh },
    { emoji: "😮", name: "wow", icon: Wow },
    { emoji: "😢", name: "sad", icon: Sad },
    { emoji: "😡", name: "angry", icon: Angry },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-400" />
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAudioPlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReaction = (reaction: string) => {
    if (onReact) {
      onReact(message, reaction)
    }
    setShowReactions(false)
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        return (
          <div className="break-words">
            {message.contenu}
            {message.edited && <span className="text-xs text-gray-400 ml-2">(modifié)</span>}
          </div>
        )

      case "image":
        return (
          <motion.div whileHover={{ scale: 1.02 }} className="max-w-sm">
            <img
              src={message.contenu || "/placeholder.svg"}
              alt="Image"
              className="max-w-full rounded-lg cursor-pointer"
              onClick={() => window.open(message.contenu, "_blank")}
            />
            {message.viewOnce && <div className="text-xs text-gray-400 mt-1">📷 Vue unique</div>}
          </motion.div>
        )

      case "gif":
        return (
          <motion.div whileHover={{ scale: 1.02 }} className="max-w-sm">
            <img
              src={message.contenu || "/placeholder.svg"}
              alt="GIF"
              className="max-w-full rounded-lg cursor-pointer"
            />
            <div className="text-xs text-gray-400 mt-1">GIF</div>
          </motion.div>
        )

      case "sticker":
        return (
          <motion.div whileHover={{ scale: 1.1 }} className="w-32 h-32">
            <img src={message.contenu || "/placeholder.svg"} alt="Sticker" className="w-full h-full object-contain" />
          </motion.div>
        )

      case "file":
        return (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 bg-[#2a3942] rounded-lg cursor-pointer min-w-[200px]"
          >
            <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {message.nom?.split(".").pop()?.toUpperCase() || "FILE"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{message.nom}</p>
              {message.taille && <p className="text-gray-400 text-xs">{formatFileSize(message.taille)}</p>}
            </div>
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <Download className="w-4 h-4" />
            </Button>
          </motion.div>
        )

      case "audio":
        return (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 bg-[#2a3942] rounded-lg min-w-[200px]"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAudioPlay}
              className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008069] text-white p-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-600 rounded-full">
                  <div className="h-full bg-[#00a884] rounded-full" style={{ width: "30%" }}></div>
                </div>
                <span className="text-gray-400 text-xs">{message.duree ? formatDuration(message.duree) : "0:00"}</span>
              </div>
            </div>
          </motion.div>
        )

      case "location":
        return (
          <motion.div whileHover={{ scale: 1.02 }} className="p-3 bg-[#2a3942] rounded-lg cursor-pointer min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#00a884] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📍</span>
              </div>
              <span className="text-white font-medium">Position partagée</span>
            </div>
            <div className="text-gray-400 text-sm">
              Lat: {message.contenu.latitude?.toFixed(6)}, Lng: {message.contenu.longitude?.toFixed(6)}
            </div>
          </motion.div>
        )

      case "contact":
        return (
          <motion.div whileHover={{ scale: 1.02 }} className="p-3 bg-[#2a3942] rounded-lg cursor-pointer min-w-[200px]">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <div>
                <p className="text-white font-medium">{message.contenu.name || message.contenu.nom}</p>
                <p className="text-gray-400 text-sm">{message.contenu.telephone}</p>
              </div>
            </div>
          </motion.div>
        )

      default:
        return <div className="break-words">{message.contenu}</div>
    }
  }

  return (
    <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"} group`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
          isMyMessage ? "message-bubble-out" : "message-bubble-in"
        }`}
        onDoubleClick={() => setShowReactions(true)}
      >
        {/* Reply to message */}
        {message.replyTo && (
          <div className="mb-2 p-2 bg-black bg-opacity-20 rounded border-l-2 border-[#00a884]">
            <p className="text-xs text-gray-300">Réponse à</p>
            <p className="text-sm text-gray-200 truncate">{message.replyTo.content}</p>
          </div>
        )}

        {/* Group sender name */}
        {isGroup && !isMyMessage && <p className="text-xs text-[#00a884] font-medium mb-1">{message.expediteur}</p>}

        {renderMessageContent()}

        {/* Message reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction: any, index: number) => (
              <span key={index} className="text-xs bg-black bg-opacity-20 px-1 rounded">
                {reaction.emoji} {reaction.count}
              </span>
            ))}
          </div>
        )}

        {/* Message info */}
        <div
          className={`flex items-center justify-between gap-2 mt-1 text-xs ${
            isMyMessage ? "text-green-200" : "text-gray-400"
          }`}
        >
          <div className="flex items-center gap-1">
            <span>{message.heure}</span>
            {message.starred && <Star className="w-3 h-3 fill-current" />}
            {message.disappearAt && <span className="text-xs">⏰</span>}
          </div>
          {isMyMessage && message.statut && getStatusIcon(message.statut)}
        </div>

        {/* Message actions (visible on hover) */}
        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 bg-[#233138] rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-gray-300 hover:text-white"
              onClick={() => setShowReactions(true)}
            >
              ❤️
            </Button>
            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 text-gray-300 hover:text-white"
                onClick={() => onReply(message)}
              >
                <Reply className="w-3 h-3" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-300 hover:text-white">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#233138] border-gray-700">
                {onForward && (
                  <DropdownMenuItem onClick={() => onForward(message)} className="text-gray-300 hover:text-white">
                    <Forward className="w-4 h-4 mr-2" />
                    Transférer
                  </DropdownMenuItem>
                )}
                {onStar && (
                  <DropdownMenuItem onClick={() => onStar(message)} className="text-gray-300 hover:text-white">
                    <Star className="w-4 h-4 mr-2" />
                    {message.starred ? "Retirer des favoris" : "Ajouter aux favoris"}
                  </DropdownMenuItem>
                )}
                {isMyMessage && onEdit && message.type === "text" && (
                  <DropdownMenuItem onClick={() => onEdit(message)} className="text-gray-300 hover:text-white">
                    Modifier
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(message)} className="text-red-400 hover:text-red-300">
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Reaction picker */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowReactions(false)}
          >
            <motion.div className="bg-[#233138] rounded-lg p-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {reactions.map((reaction) => (
                <Button
                  key={reaction.name}
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 text-2xl hover:bg-[#2a3942]"
                  onClick={() => handleReaction(reaction.emoji)}
                >
                  {reaction.emoji}
                </Button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
