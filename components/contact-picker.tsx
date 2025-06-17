"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X, Search } from "lucide-react"
import { motion } from "framer-motion"

interface ContactPickerProps {
  contacts: any[]
  onContactSelect: (contact: any) => void
  onClose: () => void
}

export function ContactPicker({ contacts, onContactSelect, onClose }: ContactPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getUserInitials = (name: string) => {
    const parts = name.split(" ")
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase()
  }

  const getProfileColor = (name: string) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) || contact.telephone?.includes(searchTerm),
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-[#202c33] rounded-lg shadow-xl border border-gray-700 w-96 max-h-96 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-medium">Partager un contact</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un contact"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onContactSelect(contact)}
                className="w-full text-left p-2 hover:bg-[#2a3942] rounded transition-colors"
              >
                <div className="flex items-center">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback
                      className="text-white font-bold"
                      style={{ backgroundColor: getProfileColor(contact.name || contact.nom) }}
                    >
                      {getUserInitials(contact.name || contact.nom)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{contact.name || contact.nom}</p>
                    <p className="text-gray-400 text-sm">{contact.telephone}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p>Aucun contact trouvé</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
