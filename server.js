// Serveur WebSocket pour WhatsApp Clone
const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const path = require("path")

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)))

// Route principale
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

// Stockage des utilisateurs connectés
const connectedUsers = new Map()

// Gestion des connexions WebSocket
wss.on("connection", (ws) => {
  console.log("Nouvelle connexion WebSocket")

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message)
      handleWebSocketMessage(ws, data)
    } catch (error) {
      console.error("Erreur de parsing du message:", error)
    }
  })

  ws.on("close", () => {
    // Supprimer l'utilisateur de la liste des connectés
    for (const [userId, userData] of connectedUsers.entries()) {
      if (userData.ws === ws) {
        connectedUsers.delete(userId)
        console.log(`Utilisateur ${userId} déconnecté`)

        // Notifier les autres utilisateurs
        broadcastUserList()
        break
      }
    }
  })

  ws.on("error", (error) => {
    console.error("Erreur WebSocket:", error)
  })
})

// Gestion des messages WebSocket
function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case "user_connected":
      handleUserConnected(ws, data.user)
      break
    case "message":
      handleMessage(data.message)
      break
    case "call_request":
      handleCallRequest(data)
      break
    case "call_accepted":
      handleCallResponse(data)
      break
    case "call_rejected":
      handleCallResponse(data)
      break
    case "call_ended":
      handleCallEnded(data)
      break
    case "ice_candidate":
      handleIceCandidate(data)
      break
    case "session_description":
      handleSessionDescription(data)
      break
    default:
      console.log("Type de message non géré:", data.type)
  }
}

// Gestion de la connexion d'un utilisateur
function handleUserConnected(ws, user) {
  // Ajouter l'utilisateur à la liste des connectés
  connectedUsers.set(user.id, {
    ...user,
    ws: ws,
    lastSeen: Date.now(),
  })

  console.log(`Utilisateur ${user.name} (${user.id}) connecté`)

  // Envoyer la liste des utilisateurs connectés
  broadcastUserList()
}

// Diffusion de la liste des utilisateurs
function broadcastUserList() {
  const userList = Array.from(connectedUsers.values()).map((userData) => ({
    id: userData.id,
    name: userData.name,
    phoneNumber: userData.phoneNumber,
    avatar: userData.avatar,
    status: "en ligne",
  }))

  const message = JSON.stringify({
    type: "user_list",
    users: userList,
  })

  // Envoyer à tous les utilisateurs connectés
  connectedUsers.forEach((userData) => {
    if (userData.ws.readyState === WebSocket.OPEN) {
      userData.ws.send(message)
    }
  })
}

// Gestion des messages
function handleMessage(message) {
  console.log("Message reçu:", message)

  // Trouver le destinataire
  const recipient = connectedUsers.get(message.receiverId)

  if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
    // Envoyer le message au destinataire
    recipient.ws.send(
      JSON.stringify({
        type: "message",
        message: message,
      }),
    )

    // Confirmer la livraison à l'expéditeur
    const sender = connectedUsers.get(message.senderId)
    if (sender && sender.ws.readyState === WebSocket.OPEN) {
      // Mettre à jour le statut du message
      const updatedMessage = { ...message, status: "delivered" }
      sender.ws.send(
        JSON.stringify({
          type: "message_status",
          message: updatedMessage,
        }),
      )
    }
  } else {
    console.log(`Destinataire ${message.receiverId} non trouvé ou déconnecté`)
  }
}

// Gestion des demandes d'appel
function handleCallRequest(data) {
  console.log("Demande d'appel:", data)

  const recipient = connectedUsers.get(data.to)

  if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
    recipient.ws.send(JSON.stringify(data))
  }
}

// Gestion des réponses d'appel
function handleCallResponse(data) {
  console.log("Réponse d'appel:", data)

  const recipient = connectedUsers.get(data.to)

  if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
    recipient.ws.send(JSON.stringify(data))
  }
}

// Gestion de la fin d'appel
function handleCallEnded(data) {
  console.log("Fin d'appel:", data)

  // Notifier tous les participants
  connectedUsers.forEach((userData) => {
    if (userData.ws.readyState === WebSocket.OPEN) {
      userData.ws.send(
        JSON.stringify({
          type: "call_ended",
          from: data.from,
        }),
      )
    }
  })
}

// Gestion des candidats ICE (WebRTC)
function handleIceCandidate(data) {
  const recipient = connectedUsers.get(data.to)

  if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
    recipient.ws.send(JSON.stringify(data))
  }
}

// Gestion des descriptions de session (WebRTC)
function handleSessionDescription(data) {
  const recipient = connectedUsers.get(data.to)

  if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
    recipient.ws.send(JSON.stringify(data))
  }
}

// Nettoyage périodique des connexions fermées
setInterval(() => {
  const now = Date.now()
  const timeout = 30000 // 30 secondes

  for (const [userId, userData] of connectedUsers.entries()) {
    if (userData.ws.readyState !== WebSocket.OPEN || now - userData.lastSeen > timeout) {
      connectedUsers.delete(userId)
      console.log(`Utilisateur ${userId} supprimé (connexion fermée ou timeout)`)
    }
  }

  // Mettre à jour la liste des utilisateurs
  if (connectedUsers.size > 0) {
    broadcastUserList()
  }
}, 10000) // Vérifier toutes les 10 secondes

// Démarrage du serveur
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Serveur WhatsApp Clone démarré sur le port ${PORT}`)
  console.log(`Accédez à l'application sur http://localhost:${PORT}`)
})

// Gestion de l'arrêt propre du serveur
process.on("SIGINT", () => {
  console.log("\nArrêt du serveur...")

  // Fermer toutes les connexions WebSocket
  wss.clients.forEach((ws) => {
    ws.close()
  })

  server.close(() => {
    console.log("Serveur arrêté")
    process.exit(0)
  })
})
