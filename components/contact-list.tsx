"use client"

import { useState } from "react"
import { Search, Archive, MessageCircle, Smartphone, Plus, Users, Monitor, MoreVertical, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NewContactForm } from "@/components/new-contact-form"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ContactListProps {
  user: any
  contacts: any[]
  conversations: any
  groups: any[]
  selectedContact: any
  selectedGroup: any
  onSelectContact: (contact: any) => void
  onSelectGroup: (group: any) => void
  currentSection: string
  onRefresh: () => void
  onAddContact: (contact: any) => any
  onSyncContacts: () => void
  onShowQRCode: () => void
  onArchiveChat: (chatId: string, type: "contact" | "group") => void
  onDeleteChat: (chatId: string, type: "contact" | "group") => void
  archivedChats: string[]
}

export function ContactList({
  user,
  contacts,
  conversations,
  groups,
  selectedContact,
  selectedGroup,
  onSelectContact,
  onSelectGroup,
  currentSection,
  onRefresh,
  onAddContact,
  onSyncContacts,
  onShowQRCode,
  onArchiveChat,
  onDeleteChat,
  archivedChats = [],
}: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("Toutes")
  const [showNewContact, setShowNewContact] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; chat: any; type: "contact" | "group" } | null>(null)

  const getUserInitials = (name: string) => {
    const parts = name.split(" ")
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase()
  }

  const getProfileColor = (name: string) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getLastMessage = (conversationId: string) => {
    const conversation = conversations[conversationId]
    if (!conversation || conversation.length === 0) return null
    return conversation[conversation.length - 1]
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const messageDate = new Date(timestamp)
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Hier"
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString("fr-FR", { weekday: "short" })
    } else {
      return messageDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    }
  }

  // Combiner contacts et groupes pour l'affichage
  const getAllChats = () => {
    const contactChats = contacts.map((contact) => ({
      ...contact,
      type: "contact" as const,
      targetId: contact.id,
      conversationId: `conv_${user.id}_${contact.id}`,
    }))

    const groupChats = groups.map((group) => ({
      ...group,
      type: "group" as const,
      targetId: `group_${group.id}`,
      conversationId: `group_${group.id}`,
    }))

    return [...contactChats, ...groupChats]
  }

  const filteredChats = getAllChats().filter((chat) => {
    const searchLower = searchTerm.toLowerCase()
    const isArchived = archivedChats.includes(chat.targetId)

    // Si on affiche les archivées, ne montrer que les archivées
    if (showArchived) {
      return (
        isArchived &&
        (chat.nom?.toLowerCase().includes(searchLower) ||
          chat.name?.toLowerCase().includes(searchLower) ||
          chat.telephone?.includes(searchTerm))
      )
    }

    // Sinon, ne pas montrer les archivées
    if (isArchived) return false

    if (chat.type === "contact") {
      return (
        chat.nom?.toLowerCase().includes(searchLower) ||
        chat.name?.toLowerCase().includes(searchLower) ||
        chat.telephone?.includes(searchTerm)
      )
    } else {
      return chat.name?.toLowerCase().includes(searchLower)
    }
  })

  const handleAddNewContact = async (contactData: any) => {
    const newContact = await onAddContact(contactData)
    setShowNewContact(false)
    return newContact
  }

  const handleArchiveChat = (chat: any) => {
    onArchiveChat(chat.targetId, chat.type)
  }

  const handleDeleteChat = (chat: any) => {
    setDeleteDialog({ open: true, chat, type: chat.type })
  }

  const confirmDelete = () => {
    if (deleteDialog) {
      onDeleteChat(deleteDialog.chat.targetId, deleteDialog.type)
      setDeleteDialog(null)
    }
  }

  const archivedCount = archivedChats.length

  if (showNewContact) {
    return (
      <div className="w-80 bg-[#111b21] border-r border-gray-700">
        <NewContactForm
          contacts={contacts}
          onAddContact={handleAddNewContact}
          onBack={() => setShowNewContact(false)}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-80 bg-[#111b21] border-r border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 bg-[#202c33] border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold text-white"
          >
            {showArchived ? "Archivées" : "WhatsApp"}
          </motion.h2>
          <div className="flex items-center space-x-2">
            {showArchived ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived(false)}
                className="text-gray-300 hover:text-white hover:bg-[#2a3942]"
              >
                Retour
              </Button>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-[#2a3942]"
                    onClick={onSyncContacts}
                    title="Synchroniser les contacts"
                  >
                    <Smartphone className="w-5 h-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-[#2a3942]"
                    onClick={onShowQRCode}
                    title="WhatsApp Web"
                  >
                    <Monitor className="w-5 h-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-[#2a3942]"
                    onClick={() => setShowNewContact(true)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative mb-4"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher ou démarrer une discussion"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#202c33] border-[#2a3942] text-white placeholder-gray-400 focus:border-[#00a884] focus:ring-[#00a884]"
          />
        </motion.div>

        {/* Tabs */}
        {!showArchived && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <Tabs defaultValue="Toutes" className="w-full">
              <TabsList className="w-full bg-[#202c33] border-b border-gray-700">
                {["Toutes", "Non lues", "Favoris", "Groupes"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={`text-sm px-3 py-1 data-[state=active]:bg-[#00a884] data-[state=active]:text-white data-[state=active]:shadow-none text-gray-300 hover:text-white`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>
        )}
      </div>

      {/* Archivées */}
      {!showArchived && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-4 py-3 border-b border-gray-700 hover:bg-[#2a3942] cursor-pointer transition-all duration-300"
          onClick={() => setShowArchived(true)}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#2a3942] rounded-full flex items-center justify-center mr-3">
              <Archive className="w-5 h-5 text-gray-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Archivées</span>
                <span className="text-[#00a884] text-sm font-medium">{archivedCount}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-gray-400 py-8 px-4"
          >
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {showArchived ? "Aucune discussion archivée" : "Aucune discussion"}
            </h3>
            <p className="text-sm mb-4">
              {showArchived ? "Les discussions archivées apparaîtront ici" : "Commencez à discuter avec vos contacts"}
            </p>
            {!showArchived && (
              <div className="space-y-2">
                <Button onClick={onSyncContacts} className="w-full bg-[#00a884] hover:bg-[#008069] text-sm">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Synchroniser les contacts
                </Button>
                <Button
                  onClick={() => setShowNewContact(true)}
                  variant="ghost"
                  className="w-full text-gray-300 hover:text-white text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un contact
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredChats.map((chat, index) => {
              const lastMessage = getLastMessage(chat.conversationId)
              const isSelected =
                (chat.type === "contact" && selectedContact?.id === chat.id) ||
                (chat.type === "group" && selectedGroup?.id === chat.id)

              const displayName = chat.name || chat.nom
              const isOnline = chat.isOnline || false

              return (
                <motion.div
                  key={chat.targetId}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ delay: index * 0.05 + 0.6, duration: 0.3 }}
                  className={`group flex items-center p-3 cursor-pointer hover-effect ${isSelected ? "bg-[#2a3942]" : ""}`}
                >
                  <div
                    className="flex items-center flex-1"
                    onClick={() => (chat.type === "contact" ? onSelectContact(chat) : onSelectGroup(chat))}
                  >
                    <div className={`relative ${isOnline ? "status-indicator" : "status-indicator offline"}`}>
                      <Avatar className="w-12 h-12 mr-3">
                        {chat.avatar ? (
                          <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={displayName} />
                        ) : (
                          <AvatarFallback
                            className="text-white font-bold"
                            style={{
                              backgroundColor: chat.type === "group" ? "#00a884" : getProfileColor(displayName),
                            }}
                          >
                            {chat.type === "group" ? <Users className="w-6 h-6" /> : getUserInitials(displayName)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate">{displayName}</h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-400">{formatTime(lastMessage.timestamp)}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 truncate">
                          {lastMessage
                            ? lastMessage.type === "text"
                              ? lastMessage.contenu
                              : lastMessage.type === "image"
                                ? "📷 Photo"
                                : lastMessage.type === "file"
                                  ? "📎 Fichier"
                                  : lastMessage.type === "audio"
                                    ? "🎵 Audio"
                                    : lastMessage.contenu
                            : chat.type === "group"
                              ? `${chat.members?.length || 0} membres`
                              : "Aucun message"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu contextuel */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-8 h-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#2a3942] border-gray-700">
                        <DropdownMenuItem
                          onClick={() => handleArchiveChat(chat)}
                          className="text-gray-300 hover:text-white hover:bg-[#3b4a54]"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          {showArchived ? "Désarchiver" : "Archiver"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteChat(chat)}
                          className="text-red-400 hover:text-red-300 hover:bg-[#3b4a54]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialog?.open || false} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent className="bg-[#2a3942] border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Supprimer {deleteDialog?.type === "group" ? "le groupe" : "la discussion"} ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Cette action supprimera définitivement {deleteDialog?.type === "group" ? "le groupe" : "la discussion"} et
              tous ses messages. Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-600 text-white hover:bg-gray-700">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
