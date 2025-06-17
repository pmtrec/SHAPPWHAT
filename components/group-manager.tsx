"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface GroupManagerProps {
  user: any
  groups: any[]
  setGroups: (groups: any[]) => void
  contacts: any[]
  onSelectGroup: (group: any) => void
  conversations: any
}

export function GroupManager({ user, groups, setGroups, contacts, onSelectGroup, conversations }: GroupManagerProps) {
  const [showNewGroupForm, setShowNewGroupForm] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  const getUserInitials = (name: string) => {
    const parts = name.split(" ")
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase()
  }

  const getProfileColor = (name: string) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert("Veuillez entrer un nom de groupe")
      return
    }

    if (selectedContacts.length === 0) {
      alert("Veuillez sélectionner au moins un contact")
      return
    }

    const newGroup = {
      id: `group_${Date.now()}`,
      name: groupName,
      createur: user.nom,
      members: [user.id, ...selectedContacts],
      dateCreation: new Date().toLocaleDateString("fr-FR"),
    }

    setGroups([...groups, newGroup])
    setGroupName("")
    setSelectedContacts([])
    setShowNewGroupForm(false)
  }

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId)
      } else {
        return [...prev, contactId]
      }
    })
  }

  return (
    <div className="flex-1 bg-[#111b21] flex items-center justify-center">
      <AnimatePresence>
        {showNewGroupForm ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md p-6 bg-[#202c33] rounded-lg m-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Nouveau groupe</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewGroupForm(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-300 mb-1">
                  Nom du groupe
                </label>
                <Input
                  id="groupName"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Entrez le nom du groupe"
                  className="bg-[#2a3942] border-[#2a3942] text-white placeholder-gray-400 focus:border-[#00a884] focus:ring-[#00a884]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ajouter des participants</label>
                <div className="max-h-40 overflow-y-auto">
                  {contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className={`flex items-center p-2 rounded hover:bg-[#2a3942] cursor-pointer ${
                        selectedContacts.includes(contact.id) ? "bg-[#2a3942]" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={contact.id}
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        className="mr-2 accent-[#00a884]"
                      />
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarFallback
                          className="text-white font-bold"
                          style={{ backgroundColor: getProfileColor(contact.nom) }}
                        >
                          {getUserInitials(contact.nom)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">{contact.nom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreateGroup} className="w-full gradient-button">
                Créer le groupe
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 opacity-20">
              <Users className="w-full h-full text-gray-400" />
            </div>
            <h3 className="text-xl font-light text-gray-300 mb-2">Groupes</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Créez des groupes pour discuter avec plusieurs personnes en même temps.
            </p>
            <Button onClick={() => setShowNewGroupForm(true)} className="mt-4 gradient-button">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau groupe
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
