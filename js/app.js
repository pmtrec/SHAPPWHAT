// WhatsApp Clone - Application JavaScript
class WhatsAppClone {
  constructor() {
    // État de l'application
    this.currentUser = null
    this.contacts = []
    this.conversations = {}
    this.activeConversation = null
    this.socket = null
    this.mediaRecorder = null
    this.audioChunks = []
    this.recordingInterval = null
    this.recordingStartTime = null
    this.peerConnections = {}
    this.localStream = null
    this.remoteStream = null
    this.callActive = false
    this.callType = null
    this.callContact = null

    // Initialisation
    this.init()
  }

  // Initialisation de l'application
  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.initElements()
      this.initEventListeners()
      this.checkAuthentication()
    })
  }

  // Initialisation des éléments DOM
  initElements() {
    // Auth elements
    this.authScreen = document.getElementById("authScreen")
    this.phoneStep = document.getElementById("phoneStep")
    this.verificationStep = document.getElementById("verificationStep")
    this.phoneForm = document.getElementById("phoneForm")
    this.verificationForm = document.getElementById("verificationForm")
    this.phoneDisplay = document.getElementById("phoneDisplay")
    this.testCode = document.getElementById("testCode")
    this.smsMode = document.getElementById("smsMode")

    // Main app elements
    this.mainApp = document.getElementById("mainApp")
    this.contactList = document.getElementById("contactList")
    this.defaultView = document.getElementById("defaultView")
    this.chatView = document.getElementById("chatView")
    this.messagesContainer = document.getElementById("messagesContainer")
    this.messageInput = document.getElementById("messageInput")
    this.contactName = document.getElementById("contactName")
    this.contactAvatar = document.getElementById("contactAvatar")
    this.contactStatusText = document.getElementById("contactStatusText")
    this.contactStatus = document.getElementById("contactStatus")
    this.searchInput = document.getElementById("searchInput")

    // Modals
    this.audioRecorderModal = document.getElementById("audioRecorderModal")
    this.recordingTime = document.getElementById("recordingTime")
    this.callModal = document.getElementById("callModal")
    this.callContactName = document.getElementById("callContactName")
    this.callStatus = document.getElementById("callStatus")
    this.callAvatar = document.getElementById("callAvatar")
    this.contactSyncModal = document.getElementById("contactSyncModal")

    // File inputs
    this.imageInput = document.getElementById("imageInput")
    this.documentInput = document.getElementById("documentInput")

    // Menus
    this.attachMenu = document.getElementById("attachMenu")
  }

  // Initialisation des écouteurs d'événements
  initEventListeners() {
    // Auth events
    this.phoneForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handlePhoneSubmit()
    })

    this.verificationForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleVerificationSubmit()
    })

    document.getElementById("backBtn").addEventListener("click", () => {
      this.showPhoneStep()
    })

    document.getElementById("resendBtn").addEventListener("click", () => {
      this.resendVerificationCode()
    })

    // Main app events
    document.getElementById("sendBtn").addEventListener("click", () => {
      this.sendMessage()
    })

    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        this.sendMessage()
      }
    })

    document.getElementById("micBtn").addEventListener("click", () => {
      this.startRecording()
    })

    document.getElementById("stopRecordingBtn").addEventListener("click", () => {
      this.stopRecording()
    })

    document.getElementById("cancelRecordingBtn").addEventListener("click", () => {
      this.cancelRecording()
    })

    document.getElementById("attachBtn").addEventListener("click", () => {
      this.toggleAttachMenu()
    })

    document.getElementById("emojiBtn").addEventListener("click", () => {
      this.insertEmoji()
    })

    document.getElementById("addContactBtn").addEventListener("click", () => {
      this.showAddContactDialog()
    })

    document.getElementById("syncContactsBtn").addEventListener("click", () => {
      this.showContactSyncModal()
    })

    document.getElementById("syncNowBtn").addEventListener("click", () => {
      this.syncContacts()
    })

    document.getElementById("skipSyncBtn").addEventListener("click", () => {
      this.hideContactSyncModal()
    })

    document.getElementById("voiceCallBtn").addEventListener("click", () => {
      this.startCall("audio")
    })

    document.getElementById("videoCallBtn").addEventListener("click", () => {
      this.startCall("video")
    })

    document.getElementById("endCallBtn").addEventListener("click", () => {
      this.endCall()
    })

    document.getElementById("backToChatList").addEventListener("click", () => {
      this.showDefaultView()
    })

    document.getElementById("userAvatar").addEventListener("click", () => {
      this.logout()
    })

    this.searchInput.addEventListener("input", () => {
      this.filterContacts()
    })

    // Attach menu options
    document.querySelectorAll(".attach-option").forEach((option) => {
      option.addEventListener("click", () => {
        const type = option.getAttribute("data-type")
        this.handleAttachOption(type)
        this.toggleAttachMenu()
      })
    })

    // File inputs
    this.imageInput.addEventListener("change", (e) => {
      this.handleFileSelected(e, "image")
    })

    this.documentInput.addEventListener("change", (e) => {
      this.handleFileSelected(e, "document")
    })

    // Sidebar navigation
    document.querySelectorAll(".sidebar-item").forEach((item) => {
      item.addEventListener("click", () => {
        const section = item.getAttribute("data-section")
        this.navigateToSection(section)
      })
    })

    // Click outside to close menus
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#attachBtn") && !e.target.closest("#attachMenu")) {
        this.attachMenu.classList.add("hidden")
      }
    })
  }

  // Vérification de l'authentification
  checkAuthentication() {
    const user = localStorage.getItem("whatsapp_user")
    if (user) {
      try {
        this.currentUser = JSON.parse(user)
        this.showMainApp()
        this.connectWebSocket()
        this.loadContacts()
      } catch (error) {
        console.error("Error parsing user data:", error)
        this.logout()
      }
    } else {
      this.showAuthScreen()
    }
  }

  // Affichage de l'écran d'authentification
  showAuthScreen() {
    this.authScreen.classList.remove("hidden")
    this.mainApp.classList.add("hidden")
    this.showPhoneStep()
  }

  // Affichage de l'étape du numéro de téléphone
  showPhoneStep() {
    this.phoneStep.classList.remove("hidden")
    this.verificationStep.classList.add("hidden")
  }

  // Affichage de l'étape de vérification
  showVerificationStep() {
    this.phoneStep.classList.add("hidden")
    this.verificationStep.classList.remove("hidden")
  }

  // Gestion de la soumission du numéro de téléphone
  handlePhoneSubmit() {
    const userName = document.getElementById("userName").value.trim()
    const countryCode = document.getElementById("countryCode").value
    const phoneNumber = document.getElementById("phoneNumber").value.trim()

    if (!userName || !phoneNumber) {
      alert("Veuillez remplir tous les champs")
      return
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`
    this.phoneDisplay.textContent = fullPhoneNumber

    // Génération d'un code de vérification aléatoire
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    this.testCode.textContent = verificationCode

    // Stockage temporaire des informations utilisateur
    this.tempUser = {
      name: userName,
      phoneNumber: fullPhoneNumber,
      verificationCode: verificationCode,
      avatar: userName.charAt(0).toUpperCase(),
    }

    // Simulation d'envoi de SMS
    this.simulateSendingSMS(fullPhoneNumber, verificationCode)
  }

  // Simulation d'envoi de SMS
  simulateSendingSMS(phoneNumber, code) {
    console.log(`Simulation d'envoi de SMS au ${phoneNumber} avec le code ${code}`)
    this.showVerificationStep()
  }

  // Gestion de la soumission du code de vérification
  handleVerificationSubmit() {
    const verificationCode = document.getElementById("verificationCode").value.trim()

    if (verificationCode === this.tempUser.verificationCode) {
      // Création de l'utilisateur
      this.currentUser = {
        ...this.tempUser,
        id: Date.now().toString(),
        status: "en ligne",
      }

      // Sauvegarde dans le localStorage
      localStorage.setItem("whatsapp_user", JSON.stringify(this.currentUser))

      // Affichage de l'application principale
      this.showMainApp()
      this.connectWebSocket()
      this.showContactSyncModal()
    } else {
      alert("Code de vérification incorrect")
    }
  }

  // Renvoi du code de vérification
  resendVerificationCode() {
    const resendBtn = document.getElementById("resendBtn")
    const resendText = document.getElementById("resendText")

    resendBtn.disabled = true
    resendText.textContent = "Code renvoyé"

    setTimeout(() => {
      resendBtn.disabled = false
      resendText.textContent = "Renvoyer le code"
    }, 30000)

    this.simulateSendingSMS(this.tempUser.phoneNumber, this.tempUser.verificationCode)
  }

  // Affichage de l'application principale
  showMainApp() {
    this.authScreen.classList.add("hidden")
    this.mainApp.classList.remove("hidden")
    this.showDefaultView()
  }

  // Connexion au WebSocket
  connectWebSocket() {
    // Déterminer l'URL du WebSocket (même domaine que la page)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/ws`

    try {
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log("WebSocket connecté")
        // Envoyer les informations de l'utilisateur au serveur
        this.socket.send(
          JSON.stringify({
            type: "user_connected",
            user: this.currentUser,
          }),
        )
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data)
        } catch (error) {
          console.error("Erreur de parsing du message WebSocket:", error)
        }
      }

      this.socket.onclose = () => {
        console.log("WebSocket déconnecté")
        // Tentative de reconnexion après 5 secondes
        setTimeout(() => {
          if (this.currentUser) {
            this.connectWebSocket()
          }
        }, 5000)
      }

      this.socket.onerror = (error) => {
        console.error("Erreur WebSocket:", error)
      }
    } catch (error) {
      console.error("Erreur de connexion WebSocket:", error)
      // Fallback en mode local si le WebSocket n'est pas disponible
      this.setupLocalMode()
    }
  }

  // Configuration du mode local (sans WebSocket)
  setupLocalMode() {
    console.log("Mode local activé (pas de WebSocket)")
    // Charger des contacts de démonstration
    this.loadDemoContacts()
  }

  // Gestion des messages WebSocket
  handleWebSocketMessage(data) {
    switch (data.type) {
      case "user_list":
        this.updateOnlineUsers(data.users)
        break
      case "message":
        this.receiveMessage(data.message)
        break
      case "call_request":
        this.handleIncomingCall(data)
        break
      case "call_accepted":
        this.handleCallAccepted(data)
        break
      case "call_rejected":
        this.handleCallRejected(data)
        break
      case "call_ended":
        this.handleCallEnded()
        break
      case "ice_candidate":
        this.handleIceCandidate(data)
        break
      case "session_description":
        this.handleSessionDescription(data)
        break
      default:
        console.log("Message WebSocket non géré:", data)
    }
  }

  // Mise à jour des utilisateurs en ligne
  updateOnlineUsers(users) {
    // Filtrer pour exclure l'utilisateur actuel
    const otherUsers = users.filter((user) => user.id !== this.currentUser.id)

    // Mettre à jour les contacts existants avec le statut en ligne
    this.contacts.forEach((contact) => {
      const onlineUser = otherUsers.find((user) => user.phoneNumber === contact.phoneNumber)
      contact.status = onlineUser ? "en ligne" : "hors ligne"
    })

    // Ajouter les nouveaux utilisateurs comme contacts
    otherUsers.forEach((user) => {
      if (!this.contacts.some((contact) => contact.phoneNumber === user.phoneNumber)) {
        this.contacts.push({
          ...user,
          status: "en ligne",
        })
      }
    })

    // Mettre à jour l'affichage des contacts
    this.renderContacts()

    // Mettre à jour le statut du contact actif
    if (this.activeConversation) {
      const activeContact = this.contacts.find((contact) => contact.id === this.activeConversation)
      if (activeContact) {
        this.updateContactStatus(activeContact)
      }
    }
  }

  // Chargement des contacts
  loadContacts() {
    // Récupérer les contacts depuis le localStorage
    const storedContacts = localStorage.getItem("whatsapp_contacts")
    if (storedContacts) {
      try {
        this.contacts = JSON.parse(storedContacts)
        this.renderContacts()
      } catch (error) {
        console.error("Erreur de parsing des contacts:", error)
        this.contacts = []
      }
    } else {
      // Pas de contacts stockés, charger des contacts de démonstration
      this.loadDemoContacts()
    }

    // Charger les conversations
    this.loadConversations()
  }

  // Chargement des contacts de démonstration
  loadDemoContacts() {
    this.contacts = [
      {
        id: "demo1",
        name: "Alice Martin",
        phoneNumber: "+33612345678",
        avatar: "A",
        status: "en ligne",
      },
      {
        id: "demo2",
        name: "Thomas Dubois",
        phoneNumber: "+33623456789",
        avatar: "T",
        status: "hors ligne",
      },
      {
        id: "demo3",
        name: "Sophie Lefèvre",
        phoneNumber: "+33634567890",
        avatar: "S",
        status: "en ligne",
      },
      {
        id: "demo4",
        name: "Groupe Famille",
        phoneNumber: "group1",
        avatar: "F",
        status: "groupe",
        isGroup: true,
        members: ["demo1", "demo2", "demo3"],
      },
    ]

    // Sauvegarder dans le localStorage
    localStorage.setItem("whatsapp_contacts", JSON.stringify(this.contacts))

    // Afficher les contacts
    this.renderContacts()
  }

  // Chargement des conversations
  loadConversations() {
    // Récupérer les conversations depuis le localStorage
    const storedConversations = localStorage.getItem("whatsapp_conversations")
    if (storedConversations) {
      try {
        this.conversations = JSON.parse(storedConversations)
      } catch (error) {
        console.error("Erreur de parsing des conversations:", error)
        this.conversations = {}
      }
    } else {
      // Pas de conversations stockées, initialiser avec des conversations vides
      this.conversations = {}

      // Créer des conversations de démonstration
      this.contacts.forEach((contact) => {
        this.conversations[contact.id] = this.generateDemoMessages(contact.id)
      })

      // Sauvegarder dans le localStorage
      this.saveConversations()
    }
  }

  // Génération de messages de démonstration
  generateDemoMessages(contactId) {
    const messages = []
    const contact = this.contacts.find((c) => c.id === contactId)

    if (contact) {
      // Message de bienvenue
      messages.push({
        id: Date.now() - 86400000, // Hier
        senderId: contactId,
        receiverId: this.currentUser.id,
        text: `Bonjour ! Je suis ${contact.name}. Comment vas-tu ?`,
        timestamp: Date.now() - 86400000,
        status: "read",
      })

      // Message de l'utilisateur
      messages.push({
        id: Date.now() - 3600000, // Il y a une heure
        senderId: this.currentUser.id,
        receiverId: contactId,
        text: "Salut ! Je vais bien, merci. Et toi ?",
        timestamp: Date.now() - 3600000,
        status: "read",
      })

      // Réponse du contact
      messages.push({
        id: Date.now() - 1800000, // Il y a 30 minutes
        senderId: contactId,
        receiverId: this.currentUser.id,
        text: "Très bien ! Je teste cette nouvelle application WhatsApp.",
        timestamp: Date.now() - 1800000,
        status: "read",
      })
    }

    return messages
  }

  // Sauvegarde des conversations
  saveConversations() {
    localStorage.setItem("whatsapp_conversations", JSON.stringify(this.conversations))
  }

  // Affichage des contacts
  renderContacts() {
    this.contactList.innerHTML = ""

    // Trier les contacts par date du dernier message
    const sortedContacts = [...this.contacts].sort((a, b) => {
      const aMessages = this.conversations[a.id] || []
      const bMessages = this.conversations[b.id] || []

      const aLastMessage = aMessages.length > 0 ? aMessages[aMessages.length - 1].timestamp : 0
      const bLastMessage = bMessages.length > 0 ? bMessages[bMessages.length - 1].timestamp : 0

      return bLastMessage - aLastMessage
    })

    sortedContacts.forEach((contact) => {
      const contactElement = document.createElement("div")
      contactElement.className = `contact-item ${this.activeConversation === contact.id ? "active" : ""}`
      contactElement.setAttribute("data-id", contact.id)

      // Récupérer le dernier message
      const messages = this.conversations[contact.id] || []
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

      // Compter les messages non lus
      const unreadCount = messages.filter((msg) => msg.senderId !== this.currentUser.id && msg.status !== "read").length

      contactElement.innerHTML = `
                <div class="relative mr-3">
                    <div class="w-12 h-12 bg-whatsapp-green rounded-full flex items-center justify-center text-white font-bold">
                        ${contact.avatar}
                    </div>
                    ${
                      contact.status === "en ligne"
                        ? '<div class="status-indicator"></div>'
                        : contact.status === "hors ligne"
                          ? '<div class="status-indicator offline"></div>'
                          : ""
                    }
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center">
                        <h3 class="font-medium text-white truncate">${contact.name}</h3>
                        <span class="text-xs text-gray-400">${lastMessage ? this.formatTime(lastMessage.timestamp) : ""}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <p class="text-sm text-gray-400 truncate">${lastMessage ? this.truncateMessage(lastMessage) : "Démarrer une conversation"}</p>
                        ${unreadCount > 0 ? `<span class="bg-whatsapp-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${unreadCount}</span>` : ""}
                    </div>
                </div>
            `

      contactElement.addEventListener("click", () => {
        this.openConversation(contact.id)
      })

      this.contactList.appendChild(contactElement)
    })
  }

  // Tronquer le message pour l'aperçu
  truncateMessage(message) {
    if (message.type === "image") {
      return "📷 Photo"
    } else if (message.type === "document") {
      return "📄 Document"
    } else if (message.type === "audio") {
      return "🎤 Message vocal"
    } else {
      return message.text.length > 30 ? message.text.substring(0, 30) + "..." : message.text
    }
  }

  // Formater l'heure
  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()

    // Si c'est aujourd'hui, afficher l'heure
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // Si c'est hier, afficher "Hier"
    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return "Hier"
    }

    // Sinon, afficher la date
    return date.toLocaleDateString()
  }

  // Ouverture d'une conversation
  openConversation(contactId) {
    this.activeConversation = contactId

    // Mettre à jour l'interface
    document.querySelectorAll(".contact-item").forEach((item) => {
      item.classList.toggle("active", item.getAttribute("data-id") === contactId)
    })

    // Récupérer le contact
    const contact = this.contacts.find((c) => c.id === contactId)
    if (!contact) return

    // Mettre à jour les informations du contact
    this.updateContactInfo(contact)

    // Afficher la vue de chat
    this.showChatView()

    // Afficher les messages
    this.renderMessages(contactId)

    // Marquer les messages comme lus
    this.markMessagesAsRead(contactId)
  }

  // Mise à jour des informations du contact
  updateContactInfo(contact) {
    this.contactName.textContent = contact.name
    this.contactAvatar.textContent = contact.avatar
    this.updateContactStatus(contact)
  }

  // Mise à jour du statut du contact
  updateContactStatus(contact) {
    if (contact.isGroup) {
      this.contactStatusText.textContent = `${contact.members.length} membres`
      this.contactStatus.classList.remove("status-indicator", "offline")
    } else {
      this.contactStatusText.textContent = contact.status
      this.contactStatus.classList.add("status-indicator")
      this.contactStatus.classList.toggle("offline", contact.status !== "en ligne")
    }
  }

  // Affichage de la vue de chat
  showChatView() {
    this.defaultView.classList.add("hidden")
    this.chatView.classList.remove("hidden")
  }

  // Affichage de la vue par défaut
  showDefaultView() {
    this.defaultView.classList.remove("hidden")
    this.chatView.classList.add("hidden")
    this.activeConversation = null

    // Désélectionner tous les contacts
    document.querySelectorAll(".contact-item").forEach((item) => {
      item.classList.remove("active")
    })
  }

  // Affichage des messages
  renderMessages(contactId) {
    this.messagesContainer.innerHTML = ""

    // Récupérer les messages
    const messages = this.conversations[contactId] || []

    // Grouper les messages par date
    const groupedMessages = this.groupMessagesByDate(messages)

    // Afficher les messages groupés
    Object.entries(groupedMessages).forEach(([date, msgs]) => {
      // Ajouter la date
      const dateElement = document.createElement("div")
      dateElement.className = "flex justify-center my-4"
      dateElement.innerHTML = `
                <div class="bg-whatsapp-light-gray px-3 py-1 rounded-full text-xs text-gray-300">
                    ${date}
                </div>
            `
      this.messagesContainer.appendChild(dateElement)

      // Ajouter les messages
      msgs.forEach((message) => {
        this.renderMessage(message)
      })
    })

    // Faire défiler vers le bas
    this.scrollToBottom()
  }

  // Grouper les messages par date
  groupMessagesByDate(messages) {
    const groups = {}

    messages.forEach((message) => {
      const date = new Date(message.timestamp)
      const now = new Date()

      let dateStr

      // Si c'est aujourd'hui
      if (date.toDateString() === now.toDateString()) {
        dateStr = "Aujourd'hui"
      }
      // Si c'est hier
      else {
        const yesterday = new Date()
        yesterday.setDate(now.getDate() - 1)
        if (date.toDateString() === yesterday.toDateString()) {
          dateStr = "Hier"
        } else {
          dateStr = date.toLocaleDateString()
        }
      }

      if (!groups[dateStr]) {
        groups[dateStr] = []
      }

      groups[dateStr].push(message)
    })

    return groups
  }

  // Affichage d'un message
  renderMessage(message) {
    const isOutgoing = message.senderId === this.currentUser.id

    const messageElement = document.createElement("div")
    messageElement.className = `flex ${isOutgoing ? "justify-end" : "justify-start"} mb-2`

    let messageContent = ""

    // Contenu du message selon le type
    if (message.type === "image") {
      messageContent = `
                <img src="${message.url}" alt="Image" class="max-w-full rounded-lg mb-1" style="max-height: 200px;">
            `
    } else if (message.type === "document") {
      messageContent = `
                <div class="flex items-center mb-1">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <span>${message.filename}</span>
                </div>
                <a href="${message.url}" target="_blank" class="text-blue-400 text-sm">Télécharger</a>
            `
    } else if (message.type === "audio") {
      messageContent = `
                <div class="flex items-center">
                    <button class="play-audio mr-2" data-url="${message.url}">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                        </svg>
                    </button>
                    <div class="audio-waveform bg-gray-700 h-8 flex-1 rounded-lg"></div>
                </div>
            `
    } else {
      // Message texte normal
      messageContent = `<p>${this.formatMessageText(message.text)}</p>`
    }

    messageElement.innerHTML = `
            <div class="message-bubble ${isOutgoing ? "message-bubble-out ml-12" : "message-bubble-in mr-12"} slide-in-right">
                ${messageContent}
                <div class="flex justify-end items-center mt-1">
                    <span class="text-xs opacity-70">${new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    ${
                      isOutgoing
                        ? `
                        <span class="ml-1">
                            ${
                              message.status === "sent"
                                ? `
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z"/>
                                </svg>
                            `
                                : message.status === "delivered"
                                  ? `
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18,7L16.59,5.59L10.25,11.93L7.41,9.09L6,10.5L10.25,14.75L18,7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z"/>
                                </svg>
                            `
                                  : `
                                <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18,7L16.59,5.59L10.25,11.93L7.41,9.09L6,10.5L10.25,14.75L18,7M18,7L16.59,5.59L10.25,11.93L7.41,9.09L6,10.5L10.25,14.75L18,7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z"/>
                                </svg>
                            `
                            }
                        </span>
                    `
                        : ""
                    }
                </div>
            </div>
        `

    this.messagesContainer.appendChild(messageElement)

    // Ajouter les écouteurs d'événements pour les messages audio
    if (message.type === "audio") {
      const playButton = messageElement.querySelector(".play-audio")
      if (playButton) {
        playButton.addEventListener("click", () => {
          this.playAudio(playButton.getAttribute("data-url"))
        })
      }
    }
  }

  // Formater le texte du message (emojis, liens, etc.)
  formatMessageText(text) {
    // Convertir les URLs en liens cliquables
    const urlRegex = /(https?:\/\/[^\s]+)/g
    text = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" class="text-blue-400">${url}</a>`)

    // Convertir les emojis textuels en emojis
    const emojiMap = {
      ":)": "😊",
      ":D": "😃",
      ":(": "😞",
      ";)": "😉",
      ":p": "😛",
      "<3": "❤️",
    }

    Object.entries(emojiMap).forEach(([text, emoji]) => {
      const regex = new RegExp(text.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g")
      text = text.replace(regex, emoji)
    })

    return text
  }

  // Faire défiler vers le bas
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
  }

  // Marquer les messages comme lus
  markMessagesAsRead(contactId) {
    if (!this.conversations[contactId]) return

    let updated = false

    this.conversations[contactId].forEach((message) => {
      if (message.senderId !== this.currentUser.id && message.status !== "read") {
        message.status = "read"
        updated = true
      }
    })

    if (updated) {
      this.saveConversations()
      this.renderContacts()
    }
  }

  // Envoi d'un message
  sendMessage() {
    const text = this.messageInput.value.trim()
    if (!text || !this.activeConversation) return

    const message = {
      id: Date.now().toString(),
      senderId: this.currentUser.id,
      receiverId: this.activeConversation,
      text: text,
      timestamp: Date.now(),
      status: "sent",
    }

    // Ajouter le message à la conversation
    this.addMessageToConversation(message)

    // Vider le champ de saisie
    this.messageInput.value = ""

    // Envoyer le message via WebSocket
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "message",
          message: message,
        }),
      )
    } else {
      // Mode local : simuler la réception d'une réponse
      this.simulateResponse(message)
    }
  }

  // Ajout d'un message à la conversation
  addMessageToConversation(message) {
    // Créer la conversation si elle n'existe pas
    if (!this.conversations[message.receiverId]) {
      this.conversations[message.receiverId] = []
    }

    // Ajouter le message
    this.conversations[message.receiverId].push(message)

    // Sauvegarder les conversations
    this.saveConversations()

    // Mettre à jour l'affichage
    this.renderMessages(this.activeConversation)
    this.renderContacts()
  }

  // Réception d'un message
  receiveMessage(message) {
    // Vérifier si le message est pour l'utilisateur actuel
    if (message.receiverId !== this.currentUser.id) return

    // Créer la conversation si elle n'existe pas
    if (!this.conversations[message.senderId]) {
      this.conversations[message.senderId] = []
    }

    // Ajouter le message
    this.conversations[message.senderId].push(message)

    // Sauvegarder les conversations
    this.saveConversations()

    // Mettre à jour l'affichage
    if (this.activeConversation === message.senderId) {
      this.renderMessages(this.activeConversation)
      this.markMessagesAsRead(message.senderId)
    }

    // Mettre à jour la liste des contacts
    this.renderContacts()

    // Afficher une notification
    this.showNotification(message)
  }

  // Affichage d'une notification
  showNotification(message) {
    // Vérifier si les notifications sont supportées
    if (!("Notification" in window)) return

    // Vérifier si l'utilisateur a déjà accordé la permission
    if (Notification.permission === "granted") {
      this.createNotification(message)
    }
    // Sinon, demander la permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          this.createNotification(message)
        }
      })
    }
  }

  // Création d'une notification
  createNotification(message) {
    const contact = this.contacts.find((c) => c.id === message.senderId)
    if (!contact) return

    const notification = new Notification(contact.name, {
      body: message.text,
      icon: "/favicon.ico",
    })

    notification.onclick = () => {
      window.focus()
      this.openConversation(message.senderId)
    }
  }

  // Simulation d'une réponse (mode local)
  simulateResponse(message) {
    // Ne simuler une réponse que pour les contacts de démonstration
    if (!this.activeConversation.startsWith("demo")) return

    const contact = this.contacts.find((c) => c.id === this.activeConversation)
    if (!contact) return

    // Simuler un délai de réponse
    setTimeout(
      () => {
        // Mettre à jour le statut du message envoyé
        const sentMessage = this.conversations[this.activeConversation].find((m) => m.id === message.id)
        if (sentMessage) {
          sentMessage.status = "delivered"
          setTimeout(() => {
            sentMessage.status = "read"
            this.saveConversations()
            this.renderMessages(this.activeConversation)
          }, 2000)
        }

        // Générer une réponse
        const responses = [
          "D'accord !",
          "Je comprends.",
          "Intéressant !",
          "Merci pour l'information.",
          "Je vais y réfléchir.",
          "Super !",
          `Je suis ${contact.name}, comment puis-je t'aider ?`,
          "Je ne suis pas sûr de comprendre.",
          "Peux-tu m'en dire plus ?",
          "Je suis d'accord avec toi.",
        ]

        const responseText = responses[Math.floor(Math.random() * responses.length)]

        const responseMessage = {
          id: Date.now().toString(),
          senderId: this.activeConversation,
          receiverId: this.currentUser.id,
          text: responseText,
          timestamp: Date.now(),
          status: "sent",
        }

        // Ajouter la réponse à la conversation
        if (!this.conversations[this.activeConversation]) {
          this.conversations[this.activeConversation] = []
        }

        this.conversations[this.activeConversation].push(responseMessage)
        this.saveConversations()

        // Mettre à jour l'affichage
        this.renderMessages(this.activeConversation)
        this.renderContacts()

        // Marquer comme lu si la conversation est active
        if (this.activeConversation === contact.id) {
          this.markMessagesAsRead(contact.id)
        } else {
          // Afficher une notification
          this.showNotification(responseMessage)
        }
      },
      1000 + Math.random() * 2000,
    )
  }

  // Filtrage des contacts
  filterContacts() {
    const query = this.searchInput.value.toLowerCase()

    document.querySelectorAll(".contact-item").forEach((item) => {
      const name = item.querySelector("h3").textContent.toLowerCase()
      if (name.includes(query)) {
        item.classList.remove("hidden")
      } else {
        item.classList.add("hidden")
      }
    })
  }

  // Affichage du menu d'attachement
  toggleAttachMenu() {
    this.attachMenu.classList.toggle("hidden")
  }

  // Gestion des options d'attachement
  handleAttachOption(type) {
    switch (type) {
      case "image":
        this.imageInput.click()
        break
      case "document":
        this.documentInput.click()
        break
    }
  }

  // Gestion des fichiers sélectionnés
  handleFileSelected(event, type) {
    const file = event.target.files[0]
    if (!file) return

    // Vérifier la taille du fichier (max 10 Mo)
    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 10 Mo)")
      return
    }

    // Créer un objet URL pour le fichier
    const url = URL.createObjectURL(file)

    // Créer le message
    const message = {
      id: Date.now().toString(),
      senderId: this.currentUser.id,
      receiverId: this.activeConversation,
      type: type,
      url: url,
      filename: file.name,
      timestamp: Date.now(),
      status: "sent",
    }

    // Ajouter le message à la conversation
    this.addMessageToConversation(message)

    // Réinitialiser l'input file
    event.target.value = ""

    // Envoyer le message via WebSocket (en mode réel, il faudrait uploader le fichier)
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Dans une implémentation réelle, il faudrait uploader le fichier sur un serveur
      // et envoyer l'URL du fichier uploadé
      this.socket.send(
        JSON.stringify({
          type: "message",
          message: {
            ...message,
            url: "https://example.com/files/" + file.name, // URL fictive
          },
        }),
      )
    } else {
      // Mode local : simuler la réception d'une réponse
      this.simulateResponse(message)
    }
  }

  // Insertion d'un emoji
  insertEmoji() {
    // Liste d'emojis populaires
    const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "😎", "🙏", "😘", "🤔"]

    // Sélectionner un emoji aléatoire
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]

    // Insérer l'emoji dans le champ de saisie
    this.messageInput.value += emoji
    this.messageInput.focus()
  }

  // Démarrage de l'enregistrement audio
  startRecording() {
    // Vérifier si l'API MediaRecorder est supportée
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert("Votre navigateur ne supporte pas l'enregistrement audio")
      return
    }

    // Demander l'accès au microphone
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Afficher la modal d'enregistrement
        this.audioRecorderModal.classList.remove("hidden")

        // Créer le MediaRecorder
        this.mediaRecorder = new MediaRecorder(stream)
        this.audioChunks = []

        // Écouter les données audio
        this.mediaRecorder.addEventListener("dataavailable", (event) => {
          this.audioChunks.push(event.data)
        })

        // Démarrer l'enregistrement
        this.mediaRecorder.start()
        this.recordingStartTime = Date.now()

        // Mettre à jour le temps d'enregistrement
        this.updateRecordingTime()

        // Démarrer l'intervalle pour mettre à jour le temps
        this.recordingInterval = setInterval(() => {
          this.updateRecordingTime()
        }, 1000)
      })
      .catch((error) => {
        console.error("Erreur lors de l'accès au microphone:", error)
        alert("Impossible d'accéder au microphone")
      })
  }

  // Mise à jour du temps d'enregistrement
  updateRecordingTime() {
    const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
      .toString()
      .padStart(2, "0")
    const seconds = (elapsed % 60).toString().padStart(2, "0")
    this.recordingTime.textContent = `${minutes}:${seconds}`
  }

  // Arrêt de l'enregistrement audio
  stopRecording() {
    if (!this.mediaRecorder) return

    // Arrêter l'enregistrement
    this.mediaRecorder.stop()

    // Arrêter l'intervalle
    clearInterval(this.recordingInterval)

    // Arrêter les pistes audio
    this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())

    // Traiter l'audio enregistré
    this.mediaRecorder.addEventListener("stop", () => {
      // Créer un blob audio
      const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })

      // Créer un objet URL pour le blob
      const audioUrl = URL.createObjectURL(audioBlob)

      // Créer le message
      const message = {
        id: Date.now().toString(),
        senderId: this.currentUser.id,
        receiverId: this.activeConversation,
        type: "audio",
        url: audioUrl,
        timestamp: Date.now(),
        status: "sent",
      }

      // Ajouter le message à la conversation
      this.addMessageToConversation(message)

      // Cacher la modal d'enregistrement
      this.audioRecorderModal.classList.add("hidden")

      // Réinitialiser les variables
      this.mediaRecorder = null
      this.audioChunks = []

      // Envoyer le message via WebSocket (en mode réel, il faudrait uploader le fichier)
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // Dans une implémentation réelle, il faudrait uploader le fichier sur un serveur
        // et envoyer l'URL du fichier uploadé
        this.socket.send(
          JSON.stringify({
            type: "message",
            message: {
              ...message,
              url: "https://example.com/audio/" + Date.now() + ".webm", // URL fictive
            },
          }),
        )
      } else {
        // Mode local : simuler la réception d'une réponse
        this.simulateResponse(message)
      }
    })
  }

  // Annulation de l'enregistrement audio
  cancelRecording() {
    if (!this.mediaRecorder) return

    // Arrêter l'enregistrement
    this.mediaRecorder.stop()

    // Arrêter l'intervalle
    clearInterval(this.recordingInterval)

    // Arrêter les pistes audio
    this.mediaRecorder.stream.getTracks().forEach((track) => track.stop())

    // Cacher la modal d'enregistrement
    this.audioRecorderModal.classList.add("hidden")

    // Réinitialiser les variables
    this.mediaRecorder = null
    this.audioChunks = []
  }

  // Lecture d'un fichier audio
  playAudio(url) {
    const audio = new Audio(url)
    audio.play()
  }

  // Affichage de la modal de synchronisation des contacts
  showContactSyncModal() {
    this.contactSyncModal.classList.remove("hidden")
  }

  // Masquage de la modal de synchronisation des contacts
  hideContactSyncModal() {
    this.contactSyncModal.classList.add("hidden")
  }

  // Synchronisation des contacts
  syncContacts() {
    // Simuler la synchronisation des contacts
    const loadingContacts = [
      {
        id: "sync1",
        name: "Marie Dupont",
        phoneNumber: "+33678901234",
        avatar: "M",
        status: "hors ligne",
      },
      {
        id: "sync2",
        name: "Pierre Martin",
        phoneNumber: "+33789012345",
        avatar: "P",
        status: "hors ligne",
      },
      {
        id: "sync3",
        name: "Julie Bernard",
        phoneNumber: "+33890123456",
        avatar: "J",
        status: "hors ligne",
      },
      {
        id: "sync4",
        name: "Groupe Amis",
        phoneNumber: "group2",
        avatar: "A",
        status: "groupe",
        isGroup: true,
        members: ["sync1", "sync2", "sync3"],
      },
    ]

    // Ajouter les nouveaux contacts
    loadingContacts.forEach((contact) => {
      if (!this.contacts.some((c) => c.phoneNumber === contact.phoneNumber)) {
        this.contacts.push(contact)
      }
    })

    // Sauvegarder les contacts
    localStorage.setItem("whatsapp_contacts", JSON.stringify(this.contacts))

    // Mettre à jour l'affichage
    this.renderContacts()

    // Cacher la modal
    this.hideContactSyncModal()
  }

  // Affichage de la boîte de dialogue d'ajout de contact
  showAddContactDialog() {
    const name = prompt("Nom du contact:")
    if (!name) return

    const phoneNumber = prompt("Numéro de téléphone:")
    if (!phoneNumber) return

    // Créer le contact
    const contact = {
      id: "contact_" + Date.now(),
      name: name,
      phoneNumber: phoneNumber,
      avatar: name.charAt(0).toUpperCase(),
      status: "hors ligne",
    }

    // Ajouter le contact
    this.contacts.push(contact)

    // Sauvegarder les contacts
    localStorage.setItem("whatsapp_contacts", JSON.stringify(this.contacts))

    // Mettre à jour l'affichage
    this.renderContacts()
  }

  // Navigation vers une section
  navigateToSection(section) {
    // Mettre à jour les éléments actifs
    document.querySelectorAll(".sidebar-item").forEach((item) => {
      item.classList.toggle("active", item.getAttribute("data-section") === section)
    })

    // Gérer la navigation
    switch (section) {
      case "chats":
        // Déjà dans la vue des chats
        break
      case "status":
        alert('Fonctionnalité "Statuts" à venir')
        break
      case "calls":
        alert('Fonctionnalité "Appels" à venir')
        break
      case "groups":
        alert('Fonctionnalité "Groupes" à venir')
        break
      case "settings":
        alert('Fonctionnalité "Paramètres" à venir')
        break
    }
  }

  // Démarrage d'un appel
  startCall(type) {
    if (!this.activeConversation) return

    const contact = this.contacts.find((c) => c.id === this.activeConversation)
    if (!contact) return

    // Vérifier si l'API MediaDevices est supportée
    if (!navigator.mediaDevices) {
      alert("Votre navigateur ne supporte pas les appels")
      return
    }

    // Demander l'accès à la caméra et au microphone
    const constraints = {
      audio: true,
      video: type === "video",
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // Stocker le flux local
        this.localStream = stream

        // Initialiser l'appel
        this.callType = type
        this.callContact = contact

        // Afficher la modal d'appel
        this.showCallModal()

        // Envoyer une demande d'appel via WebSocket
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(
            JSON.stringify({
              type: "call_request",
              callType: type,
              from: this.currentUser.id,
              to: contact.id,
            }),
          )
        } else {
          // Mode local : simuler un appel
          this.simulateCall()
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'accès à la caméra/microphone:", error)
        alert("Impossible d'accéder à la caméra/microphone")
      })
  }

  // Affichage de la modal d'appel
  showCallModal() {
    this.callModal.classList.remove("hidden")
    this.callContactName.textContent = this.callContact.name
    this.callAvatar.innerHTML = `<span class="text-white text-4xl font-bold">${this.callContact.avatar}</span>`
    this.callStatus.textContent = "Appel en cours..."
  }

  // Masquage de la modal d'appel
  hideCallModal() {
    this.callModal.classList.add("hidden")
  }

  // Simulation d'un appel (mode local)
  simulateCall() {
    // Simuler un délai avant de répondre
    setTimeout(() => {
      // 50% de chance que l'appel soit accepté
      if (Math.random() > 0.5) {
        this.callStatus.textContent = "Appel connecté"
        this.callActive = true

        // Simuler un appel de 10 secondes
        setTimeout(() => {
          this.endCall()
        }, 10000)
      } else {
        this.callStatus.textContent = "Appel refusé"

        // Fermer la modal après 2 secondes
        setTimeout(() => {
          this.endCall()
        }, 2000)
      }
    }, 2000)
  }

  // Gestion d'un appel entrant
  handleIncomingCall(data) {
    // Vérifier si l'appel est pour l'utilisateur actuel
    if (data.to !== this.currentUser.id) return

    // Récupérer le contact
    const contact = this.contacts.find((c) => c.id === data.from)
    if (!contact) return

    // Demander à l'utilisateur s'il veut accepter l'appel
    const accept = confirm(`Appel ${data.callType} entrant de ${contact.name}. Accepter ?`)

    if (accept) {
      // Demander l'accès à la caméra et au microphone
      const constraints = {
        audio: true,
        video: data.callType === "video",
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          // Stocker le flux local
          this.localStream = stream

          // Initialiser l'appel
          this.callType = data.callType
          this.callContact = contact
          this.callActive = true

          // Afficher la modal d'appel
          this.showCallModal()
          this.callStatus.textContent = "Appel connecté"

          // Envoyer une réponse via WebSocket
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
              JSON.stringify({
                type: "call_accepted",
                from: this.currentUser.id,
                to: data.from,
              }),
            )
          }
        })
        .catch((error) => {
          console.error("Erreur lors de l'accès à la caméra/microphone:", error)
          alert("Impossible d'accéder à la caméra/microphone")

          // Refuser l'appel
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
              JSON.stringify({
                type: "call_rejected",
                from: this.currentUser.id,
                to: data.from,
              }),
            )
          }
        })
    } else {
      // Refuser l'appel
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            type: "call_rejected",
            from: this.currentUser.id,
            to: data.from,
          }),
        )
      }
    }
  }

  // Gestion d'un appel accepté
  handleCallAccepted(data) {
    // Vérifier si l'appel est pour l'utilisateur actuel
    if (data.to !== this.currentUser.id) return

    this.callActive = true
    this.callStatus.textContent = "Appel connecté"
  }

  // Gestion d'un appel refusé
  handleCallRejected(data) {
    // Vérifier si l'appel est pour l'utilisateur actuel
    if (data.to !== this.currentUser.id) return

    this.callStatus.textContent = "Appel refusé"

    // Fermer la modal après 2 secondes
    setTimeout(() => {
      this.endCall()
    }, 2000)
  }

  // Gestion de la fin d'un appel
  handleCallEnded() {
    this.endCall()
  }

  // Fin d'un appel
  endCall() {
    // Arrêter les flux
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop())
      this.remoteStream = null
    }

    // Fermer les connexions WebRTC
    Object.values(this.peerConnections).forEach((pc) => {
      pc.close()
    })
    this.peerConnections = {}

    // Réinitialiser les variables
    this.callActive = false
    this.callType = null
    this.callContact = null

    // Cacher la modal d'appel
    this.hideCallModal()

    // Envoyer un signal de fin d'appel via WebSocket
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "call_ended",
          from: this.currentUser.id,
        }),
      )
    }
  }

  // Gestion des candidats ICE (WebRTC)
  handleIceCandidate(data) {
    // Implémentation WebRTC pour les appels réels
    // Cette partie nécessiterait une implémentation complète de WebRTC
    console.log("ICE candidate reçu:", data)
  }

  // Gestion de la description de session (WebRTC)
  handleSessionDescription(data) {
    // Implémentation WebRTC pour les appels réels
    // Cette partie nécessiterait une implémentation complète de WebRTC
    console.log("Session description reçue:", data)
  }

  // Déconnexion
  logout() {
    // Confirmer la déconnexion
    if (!confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) return

    // Fermer la connexion WebSocket
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    // Supprimer les données utilisateur
    localStorage.removeItem("whatsapp_user")

    // Réinitialiser l'état
    this.currentUser = null
    this.activeConversation = null

    // Afficher l'écran d'authentification
    this.showAuthScreen()
  }
}

// Initialisation de l'application
const app = new WhatsAppClone()
