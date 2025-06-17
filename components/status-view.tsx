"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Plus, Camera, Type, Palette, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"

interface StatusViewProps {
  user: any
  statuses: any[]
  setStatuses: (statuses: any[]) => void
  contacts: any[]
}

export function StatusView({ user, statuses, setStatuses, contacts }: StatusViewProps) {
  const [showCreateStatus, setShowCreateStatus] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [statusBg, setStatusBg] = useState("#00a884")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getUserInitials = (name: string) => {
    const parts = name.split(" ")
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase()
  }

  const getProfileColor = (name: string) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const backgroundColors = ["#00a884", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8"]

  const createTextStatus = () => {
    if (!statusText.trim()) return

    const newStatus = {
      id: Date.now().toString(),
      type: "text",
      contenu: statusText,
      backgroundColor: statusBg,
      timestamp: Date.now(),
      vues: 0,
      auteur: user.nom,
    }

    setStatuses([newStatus, ...statuses])
    setStatusText("")
    setShowCreateStatus(false)
  }

  const createImageStatus = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newStatus = {
        id: Date.now().toString(),
        type: "image",
        contenu: e.target?.result,
        timestamp: Date.now(),
        vues: 0,
        auteur: user.nom,
      }

      setStatuses([newStatus, ...statuses])
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      createImageStatus(file)
    }
  }

  const formatTime = (timestamp: number) => {
    const now = new Date()
    const statusDate = new Date(timestamp)
    const diffHours = Math.floor((now.getTime() - statusDate.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return "À l'instant"
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return "Expiré"
  }

  // Filtrer les statuts récents (moins de 24h)
  const recentStatuses = statuses.filter((status) => {
    const now = Date.now()
    const statusTime = status.timestamp
    return now - statusTime < 24 * 60 * 60 * 1000 // 24 heures
  })

  return (
    <div className="flex-1 bg-[#111b21] flex">
      {/* Liste des statuts */}
      <div className="w-80 bg-[#111b21] border-r border-gray-700 flex flex-col">
        <div className="p-4 bg-[#202c33] border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Statuts</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Mon statut */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-gray-300 text-sm font-medium mb-3">Mon statut</h3>
            <div className="flex items-center">
              <div className="relative">
                <Avatar className="w-12 h-12 mr-3">
                  <AvatarFallback
                    className="text-white font-bold"
                    style={{ backgroundColor: getProfileColor(user.nom) }}
                  >
                    {getUserInitials(user.nom)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00a884] hover:bg-[#008069] p-0"
                  onClick={() => setShowCreateStatus(true)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Mon statut</p>
                <p className="text-gray-400 text-sm">Appuyez pour ajouter un statut</p>
              </div>
            </div>
          </div>

          {/* Statuts récents */}
          {recentStatuses.length > 0 && (
            <div className="p-4">
              <h3 className="text-gray-300 text-sm font-medium mb-3">Récents</h3>
              <div className="space-y-3">
                {recentStatuses.map((status) => (
                  <motion.div
                    key={status.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center cursor-pointer hover:bg-[#2a3942] p-2 rounded"
                  >
                    <Avatar className="w-12 h-12 mr-3 border-2 border-[#00a884]">
                      <AvatarFallback
                        className="text-white font-bold"
                        style={{ backgroundColor: getProfileColor(status.auteur) }}
                      >
                        {getUserInitials(status.auteur)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-medium">{status.auteur}</p>
                      <p className="text-gray-400 text-sm">{formatTime(status.timestamp)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone de création de statut */}
      <div className="flex-1 bg-[#0b141a] flex items-center justify-center">
        <AnimatePresence>
          {showCreateStatus ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 bg-[#202c33] rounded-lg m-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold">Créer un statut</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateStatus(false)}
                  className="text-gray-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Statut texte */}
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    <Type className="w-4 h-4 inline mr-2" />
                    Statut texte
                  </label>
                  <Textarea
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    placeholder="Quoi de neuf ?"
                    className="bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400 resize-none"
                    rows={3}
                  />
                </div>

                {/* Couleurs de fond */}
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    <Palette className="w-4 h-4 inline mr-2" />
                    Couleur de fond
                  </label>
                  <div className="flex space-x-2">
                    {backgroundColors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          statusBg === color ? "border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setStatusBg(color)}
                      />
                    ))}
                  </div>
                </div>

                {/* Aperçu */}
                {statusText && (
                  <div className="p-4 rounded-lg text-white text-center" style={{ backgroundColor: statusBg }}>
                    {statusText}
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex space-x-2">
                  <Button
                    onClick={createTextStatus}
                    disabled={!statusText.trim()}
                    className="flex-1 bg-[#00a884] hover:bg-[#008069]"
                  >
                    Publier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-[#2a3942] text-gray-300 hover:bg-[#2a3942]"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 opacity-20">
                <svg viewBox="0 0 24 24" className="w-full h-full text-gray-400">
                  <path
                    fill="currentColor"
                    d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-300 mb-2">Statuts</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Cliquez sur un statut pour le voir ou créez le vôtre pour le partager avec vos contacts.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
