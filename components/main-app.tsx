"use client"

import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { ContactList } from "@/components/contact-list"
import { ChatArea } from "@/components/chat-area"
import { StatusView } from "@/components/status-view"
import { GroupManager } from "@/components/group-manager"
import { CallsView } from "@/components/calls-view"
import { SettingsView } from "@/components/settings-view"
import { ContactSync } from "@/components/contact-sync"
import { QRCodeView } from "@/components/qr-code-view"
import { IncomingCallModal } from "@/components/incoming-call-modal"
import { RealtimeVideoCall } from "@/components/realtime-video-call"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useContacts } from "@/hooks/use-contacts"
import { useNotifications } from "@/hooks/use-notifications"
import { useEncryption } from "@/hooks/use-encryption"
import { useRealtimeMessaging } from "@/hooks/use-realtime-messaging"
import { wsClient } from "@/lib/websocket-client"
import { AnimatePresence } from "framer-motion"

interface MainAppProps {
  user: any
  onLogout: () => void
}

export function MainApp({ user, onLogout }: MainAppProps) {
  // États locaux pour les données
  const [contacts, setContacts] = useLocalStorage("whatsapp_contacts", [])
  const [groups, setGroups] = useLocalStorage("whatsapp_groups", [])
  const [statuses, setStatuses] = useLocalStorage("whatsapp_statuses", [])
  const [calls, setCalls] = useLocalStorage("whatsapp_calls", [])
  const [conversations, setConversations] = useLocalStorage("whatsapp_conversations", {})
  const [currentUser, setCurrentUser] = useLocalStorage("whatsapp_user", user)
  const [isContactSyncEnabled, setIsContactSyncEnabled] = useLocalStorage("contact_sync_enabled", false)
  const [encryptionKeys, setEncryptionKeys] = useLocalStorage("encryption_keys", null)
  const [archivedChats, setArchivedChats] = useLocalStorage("archived_chats", [])

  // Hooks pour les fonctionnalités
  const { syncPhoneContacts, requestContactsPermission, isLoading: contactsLoading } = useContacts()
  const { requestNotificationPermission, sendNotification } = useNotifications()
  const { generateKeys, encryptMessage, decryptMessage } = useEncryption()

  // Hook pour la messagerie en temps réel
  const {
    isConnected,
    onlineUsers,
    incomingCall,
    currentCall,
    sendMessage: sendRealtimeMessage,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    webrtcClient,
  } = useRealtimeMessaging(currentUser?.id)

  // États pour la navigation
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [currentSection, setCurrentSection] = useState("chats")
  const [replyTo, setReplyTo] = useState<any>(null)
  const [showContactSync, setShowContactSync] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  // Refs pour éviter les re-initialisations
  const permissionsInitialized = useRef(false)
  const encryptionInitialized = useRef(false)

  // Initialisation du chiffrement (une seule fois)
  useEffect(() => {
    if (encryptionInitialized.current || encryptionKeys) return

    const keys = generateKeys()
    setEncryptionKeys(keys)
    encryptionInitialized.current = true
  }, [encryptionKeys, generateKeys, setEncryptionKeys])

  // Demander les permissions au démarrage (une seule fois)
  useEffect(() => {
    if (permissionsInitialized.current) return

    const initializePermissions = async () => {
      try {
        await requestNotificationPermission()
        if (isContactSyncEnabled) {
          await requestContactsPermission()
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation des permissions:", error)
      } finally {
        permissionsInitialized.current = true
      }
    }

    initializePermissions()
  }, []) // Pas de dépendances pour éviter les re-exécutions

  // Écouter les messages entrants
  useEffect(() => {
    const handleIncomingMessage = (data: any) => {
      const { from, content, type = "text" } = data
      const conversationId = `conv_${currentUser.id}_${from}`

      // Ajouter le message à la conversation
      setConversations((prev) => {
        const updatedConversations = { ...prev }
        if (!updatedConversations[conversationId]) {
          updatedConversations[conversationId] = []
        }

        const newMessage = {
          id: `msg_${Date.now()}`,
          expediteur: from,
          contenu: content,
          type: type || "text",
          heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          statut: "delivered",
          timestamp: new Date().toISOString(),
          encrypted: data.encrypted || false,
        }

        updatedConversations[conversationId] = [...updatedConversations[conversationId], newMessage]
        return updatedConversations
      })

      // Envoyer notification
      const contact = contacts.find((c) => c.id === from)
      if (contact && !document.hasFocus()) {
        sendNotification(`Nouveau message de ${contact.nom}`, content)
      }

      // Marquer comme lu si la conversation est ouverte
      if (selectedContact?.id === from) {
        wsClient.sendMessageRead(from, [data.id])
      }
    }

    wsClient.onMessage("chat-message", handleIncomingMessage)

    return () => {
      wsClient.offMessage("chat-message")
    }
  }, [contacts, selectedContact, currentUser?.id, sendNotification, setConversations])

  // Mettre à jour le statut en ligne des contacts
  useEffect(() => {
    if (onlineUsers.length === 0) return

    setContacts((prevContacts) =>
      prevContacts.map((contact) => ({
        ...contact,
        isOnline: onlineUsers.includes(contact.id),
      })),
    )
  }, [onlineUsers, setContacts])

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact)
    setSelectedGroup(null)
  }

  const handleSelectGroup = (group: any) => {
    setSelectedGroup(group)
    setSelectedContact(null)
  }

  const handleSendMessage = async (messageData: any) => {
    const targetId = selectedContact ? selectedContact.id : selectedGroup?.id
    if (!targetId || !encryptionKeys) return

    const conversationId = selectedContact ? `conv_${currentUser.id}_${targetId}` : `group_${targetId}`

    // Chiffrer le message
    const encryptedContent = encryptMessage(messageData.content || messageData.contenu, encryptionKeys.publicKey)

    const newMessage = {
      id: `msg_${Date.now()}`,
      expediteur: "moi",
      contenu: messageData.content || messageData.contenu,
      encryptedContent,
      type: messageData.type,
      heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      statut: "sending",
      timestamp: new Date().toISOString(),
      replyTo: messageData.replyTo ? replyTo : null,
      viewOnce: messageData.viewOnce || false,
      disappearAt: messageData.disappearAt || null,
      mentions: messageData.mentions || [],
      reactions: [],
      starred: false,
      edited: false,
      encrypted: true,
    }

    // Ajouter le message localement
    setConversations((prev) => {
      const updatedConversations = { ...prev }
      if (!updatedConversations[conversationId]) {
        updatedConversations[conversationId] = []
      }
      updatedConversations[conversationId] = [...updatedConversations[conversationId], newMessage]
      return updatedConversations
    })

    // Envoyer via WebSocket si c'est un contact individuel
    if (selectedContact && isConnected) {
      const success = sendRealtimeMessage(
        newMessage.contenu,
        conversationId,
        selectedContact.id,
        newMessage.type as any,
      )

      // Mettre à jour le statut du message
      if (success) {
        setTimeout(() => {
          setConversations((prev) => {
            const updated = { ...prev }
            if (updated[conversationId]) {
              updated[conversationId] = updated[conversationId].map((msg) =>
                msg.id === newMessage.id ? { ...msg, statut: "sent" } : msg,
              )
            }
            return updated
          })
        }, 100)
      }
    }

    // Clear reply
    setReplyTo(null)
  }

  const handleCall = async (targetUserId: string, callType: "voice" | "video") => {
    try {
      await initiateCall(targetUserId, callType)
    } catch (error) {
      console.error("Erreur lors de l'appel:", error)
    }
  }

  const handleArchiveChat = (chatId: string, type: "contact" | "group") => {
    setArchivedChats((prev) => {
      if (prev.includes(chatId)) {
        return prev.filter((id) => id !== chatId)
      } else {
        return [...prev, chatId]
      }
    })
  }

  const handleDeleteChat = (chatId: string, type: "contact" | "group") => {
    // Supprimer la conversation
    const conversationId = type === "contact" ? `conv_${currentUser.id}_${chatId}` : `group_${chatId}`
    setConversations((prev) => {
      const updated = { ...prev }
      delete updated[conversationId]
      return updated
    })

    // Supprimer des archivées si nécessaire
    setArchivedChats((prev) => prev.filter((id) => id !== chatId))

    // Désélectionner si c'était sélectionné
    if (selectedContact?.id === chatId || selectedGroup?.id === chatId) {
      setSelectedContact(null)
      setSelectedGroup(null)
    }
  }

  const handleSyncContacts = async () => {
    try {
      const phoneContacts = await syncPhoneContacts()
      const whatsappContacts = phoneContacts.map((contact) => ({
        id: `contact_${Date.now()}_${Math.random()}`,
        nom: contact.name,
        telephone: contact.tel,
        avatar: null,
        isOnline: false,
        lastSeen: new Date().toISOString(),
        description: "Salut ! J'utilise WhatsApp.",
        isBlocked: false,
        isFavorite: false,
        isWhatsAppUser: Math.random() > 0.3,
        syncedFromPhone: true,
      }))

      setContacts((prev) => [...prev, ...whatsappContacts])
      setIsContactSyncEnabled(true)
      setShowContactSync(false)
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
    }
  }

  const handleReply = (message: any) => {
    setReplyTo(message)
  }

  const handleForward = (message: any) => {
    console.log("Forward message:", message)
  }

  const handleStar = (message: any) => {
    const targetId = selectedContact ? selectedContact.id : selectedGroup?.id
    if (!targetId) return

    const conversationId = selectedContact ? `conv_${currentUser.id}_${targetId}` : `group_${targetId}`

    setConversations((prev) => {
      const updatedConversations = { ...prev }
      if (updatedConversations[conversationId]) {
        updatedConversations[conversationId] = updatedConversations[conversationId].map((msg: any) =>
          msg.id === message.id ? { ...msg, starred: !msg.starred } : msg,
        )
      }
      return updatedConversations
    })
  }

  const handleReact = (message: any, reaction: string) => {
    const targetId = selectedContact ? selectedContact.id : selectedGroup?.id
    if (!targetId) return

    const conversationId = selectedContact ? `conv_${currentUser.id}_${targetId}` : `group_${targetId}`

    setConversations((prev) => {
      const updatedConversations = { ...prev }
      if (updatedConversations[conversationId]) {
        updatedConversations[conversationId] = updatedConversations[conversationId].map((msg: any) => {
          if (msg.id === message.id) {
            const reactions = msg.reactions || []
            const existingReaction = reactions.find((r: any) => r.emoji === reaction)

            if (existingReaction) {
              existingReaction.count += 1
            } else {
              reactions.push({ emoji: reaction, count: 1, users: [currentUser.id] })
            }

            return { ...msg, reactions }
          }
          return msg
        })
      }
      return updatedConversations
    })
  }

  const handleAddContact = (contactData: any) => {
    const newContact = {
      id: `contact_${Date.now()}`,
      nom: contactData.nom,
      telephone: contactData.telephone,
      avatar: null,
      isOnline: false,
      lastSeen: new Date().toISOString(),
      description: "Salut ! J'utilise WhatsApp.",
      isBlocked: false,
      isFavorite: false,
      isWhatsAppUser: true,
      syncedFromPhone: false,
    }

    setContacts((prev) => [...prev, newContact])
    return newContact
  }

  const handleAddGroup = (groupData: any) => {
    const newGroup = {
      id: `group_${Date.now()}`,
      name: groupData.name,
      members: [currentUser.id, ...(groupData.members || [])],
      avatar: null,
      description: groupData.description || "Nouveau groupe",
      createdAt: new Date().toISOString(),
      admins: [currentUser.id],
      settings: {
        whoCanSend: "everyone",
        whoCanEditInfo: "admins",
        disappearingMessages: false,
        disappearingMessagesDuration: "7d",
      },
      encryptionKey: generateKeys().publicKey,
    }

    setGroups((prev) => [...prev, newGroup])
    return newGroup
  }

  const handleUpdateUser = (userData: any) => {
    const updatedUser = { ...currentUser, ...userData }
    setCurrentUser(updatedUser)
  }

  // Composants pour les sections
  const CommunityView = () => (
    <div className="flex-1 bg-[#0b141a] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 mx-auto mb-6 bg-[#00a884] rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h3 className="text-xl font-light text-gray-300 mb-2">Communautés</h3>
        <p className="text-gray-400 mb-4">
          Organisez vos groupes autour de sujets communs et restez connecté avec votre communauté.
        </p>
        <button className="px-6 py-2 bg-[#00a884] hover:bg-[#008069] text-white rounded-md transition-colors">
          Créer une communauté
        </button>
      </div>
    </div>
  )

  const BusinessView = () => (
    <div className="flex-1 bg-[#0b141a] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 mx-auto mb-6 bg-[#25d366] rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
          </svg>
        </div>
        <h3 className="text-xl font-light text-gray-300 mb-2">WhatsApp Business</h3>
        <p className="text-gray-400 mb-4">
          Créez un profil professionnel, ajoutez un catalogue et connectez-vous avec vos clients.
        </p>
        <button className="px-6 py-2 bg-[#25d366] hover:bg-[#128c7e] text-white rounded-md transition-colors">
          Configurer Business
        </button>
      </div>
    </div>
  )

  const ArchivedView = () => (
    <div className="flex-1 bg-[#0b141a] flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-xl font-light text-gray-300 mb-2">Discussions archivées</h3>
        <p className="text-gray-400">Aucune discussion archivée</p>
      </div>
    </div>
  )

  const StarredView = () => (
    <div className="flex-1 bg-[#0b141a] flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-xl font-light text-gray-300 mb-2">Messages favoris</h3>
        <p className="text-gray-400">Aucun message favori</p>
      </div>
    </div>
  )

  const renderMainContent = () => {
    if (showContactSync) {
      return (
        <ContactSync
          onSync={handleSyncContacts}
          onCancel={() => setShowContactSync(false)}
          isLoading={contactsLoading}
        />
      )
    }

    if (showQRCode) {
      return <QRCodeView onClose={() => setShowQRCode(false)} />
    }

    switch (currentSection) {
      case "status":
        return <StatusView user={currentUser} statuses={statuses} setStatuses={setStatuses} contacts={contacts} />
      case "calls":
        return <CallsView user={currentUser} contacts={contacts} calls={calls} setCalls={setCalls} />
      case "groups":
        return (
          <GroupManager
            user={currentUser}
            groups={groups}
            setGroups={setGroups}
            contacts={contacts}
            onSelectGroup={handleSelectGroup}
            conversations={conversations}
          />
        )
      case "communities":
        return <CommunityView />
      case "business":
        return <BusinessView />
      case "archived":
        return <ArchivedView />
      case "starred":
        return <StarredView />
      case "settings":
        return <SettingsView user={currentUser} onUpdateUser={handleUpdateUser} onLogout={onLogout} />
      default:
        return (
          <>
            <ContactList
              user={currentUser}
              contacts={contacts}
              conversations={conversations}
              groups={groups}
              selectedContact={selectedContact}
              selectedGroup={selectedGroup}
              onSelectContact={handleSelectContact}
              onSelectGroup={handleSelectGroup}
              currentSection={currentSection}
              onRefresh={() => {}}
              onAddContact={handleAddContact}
              onSyncContacts={() => setShowContactSync(true)}
              onShowQRCode={() => setShowQRCode(true)}
              onArchiveChat={handleArchiveChat}
              onDeleteChat={handleDeleteChat}
              archivedChats={archivedChats}
            />
            <ChatArea
              selectedContact={selectedContact}
              selectedGroup={selectedGroup}
              conversations={conversations}
              onSendMessage={handleSendMessage}
              onReply={handleReply}
              onForward={handleForward}
              onStar={handleStar}
              onReact={handleReact}
              onBack={() => {
                setSelectedContact(null)
                setSelectedGroup(null)
              }}
              user={currentUser}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              contacts={contacts}
              encryptionKeys={encryptionKeys}
              onCall={handleCall}
              isConnected={isConnected}
            />
          </>
        )
    }
  }

  return (
    <div className="flex h-screen bg-[#111b21]">
      <div className="flex w-full max-w-7xl mx-auto bg-[#111b21] shadow-xl">
        <Sidebar
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          user={currentUser}
          onLogout={onLogout}
          isConnected={isConnected}
        />
        {renderMainContent()}

        {/* Appel entrant */}
        <AnimatePresence>
          {incomingCall && (
            <IncomingCallModal
              callData={incomingCall}
              onAccept={() => acceptCall(incomingCall)}
              onReject={() => rejectCall(incomingCall)}
              contacts={contacts}
            />
          )}
        </AnimatePresence>

        {/* Appel actif */}
        <AnimatePresence>
          {currentCall && currentCall.status === "active" && (
            <RealtimeVideoCall
              callData={currentCall}
              onEndCall={endCall}
              onToggleMute={() => webrtcClient.toggleMute()}
              onToggleVideo={() => webrtcClient.toggleVideo()}
              contacts={contacts}
              localStream={webrtcClient.getLocalStream()}
              remoteStream={webrtcClient.getRemoteStream()}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
