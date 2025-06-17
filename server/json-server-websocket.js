const jsonServer = require("json-server")
const WebSocket = require("ws")
const http = require("http")
const url = require("url")
const fs = require("fs")
const path = require("path")

// Créer l'application json-server
const app = jsonServer.create()
const router = jsonServer.router("db.json")
const middlewares = jsonServer.defaults()

// Utiliser les middlewares par défaut
app.use(middlewares)

// Middleware pour CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With")

  if (req.method === "OPTIONS") {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Middleware personnalisé pour les messages en temps réel
app.use(jsonServer.bodyParser)
app.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/messages") {
    // Intercepter les nouveaux messages pour les diffuser via WebSocket
    const originalSend = res.send
    res.send = function (data) {
      // Diffuser le message via WebSocket
      if (wss && req.body) {
        broadcastMessage({
          type: "new-message",
          data: JSON.parse(data),
        })
      }
      originalSend.call(this, data)
    }
  }
  next()
})

// Utiliser le router json-server
app.use(router)

// Créer le serveur HTTP
const server = http.createServer(app)

// Créer le serveur WebSocket
const wss = new WebSocket.Server({
  server,
  path: "/ws",
  verifyClient: (info) => {
    const query = url.parse(info.req.url, true).query
    return query.userId // Vérifier que l'utilisateur a un ID
  },
})

// Stocker les connexions actives
const clients = new Map()

// Fonction pour lire la base de données
function readDB() {
  try {
    const data = fs.readFileSync("db.json", "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Erreur lecture DB:", error)
    return {}
  }
}

// Fonction pour écrire dans la base de données
function writeDB(data) {
  try {
    fs.writeFileSync("db.json", JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("Erreur écriture DB:", error)
    return false
  }
}

// Gestion des connexions WebSocket
wss.on("connection", (ws, req) => {
  const query = url.parse(req.url, true).query
  const userId = query.userId

  console.log(`🟢 Utilisateur ${userId} connecté`)

  // Stocker la connexion
  clients.set(userId, {
    ws,
    userId,
    lastSeen: new Date().toISOString(),
  })

  // Mettre à jour le statut en ligne dans la DB
  updateUserOnlineStatus(userId, true)

  // Envoyer la liste des utilisateurs en ligne
  broadcastOnlineUsers()

  // Notifier les autres utilisateurs
  broadcast(
    {
      type: "user-online",
      data: { userId, timestamp: new Date().toISOString() },
    },
    userId,
  )

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data)
      console.log(`📨 Message de ${userId}:`, message.type)

      switch (message.type) {
        case "chat-message":
          handleChatMessage(message, userId)
          break
        case "call-offer":
          handleCallOffer(message, userId)
          break
        case "call-answer":
          handleCallAnswer(message, userId)
          break
        case "ice-candidate":
          handleIceCandidate(message, userId)
          break
        case "call-end":
          handleCallEnd(message, userId)
          break
        case "message-read":
          handleMessageRead(message, userId)
          break
        case "typing":
          handleTyping(message, userId)
          break
        case "ping":
          ws.send(JSON.stringify({ type: "pong" }))
          break
        default:
          console.log("❓ Type de message non géré:", message.type)
      }
    } catch (error) {
      console.error("❌ Erreur parsing message:", error)
    }
  })

  ws.on("close", () => {
    console.log(`🔴 Utilisateur ${userId} déconnecté`)

    // Mettre à jour le statut hors ligne dans la DB
    updateUserOnlineStatus(userId, false)

    clients.delete(userId)

    // Notifier les autres utilisateurs
    broadcast(
      {
        type: "user-offline",
        data: { userId, timestamp: new Date().toISOString() },
      },
      userId,
    )

    broadcastOnlineUsers()
  })

  ws.on("error", (error) => {
    console.error(`❌ Erreur WebSocket pour ${userId}:`, error)
  })
})

// Gestionnaires de messages
function handleChatMessage(message, fromUserId) {
  const db = readDB()

  // Créer le message dans la base de données
  const newMessage = {
    id: Date.now().toString(),
    conversationId: message.conversationId,
    senderId: fromUserId,
    content: message.content,
    type: message.messageType || "text",
    timestamp: new Date().toISOString(),
    status: "sent",
    isEncrypted: true,
  }

  // Ajouter à la base de données
  if (!db.messages) db.messages = []
  db.messages.push(newMessage)

  // Mettre à jour la conversation
  if (db.conversations) {
    const conversation = db.conversations.find((c) => c.id === message.conversationId)
    if (conversation) {
      conversation.lastMessage = newMessage.content
      conversation.lastMessageTime = newMessage.timestamp
      conversation.unreadCount = (conversation.unreadCount || 0) + 1
    }
  }

  writeDB(db)

  // Diffuser le message via WebSocket
  const targetUserId = message.to
  const targetClient = clients.get(targetUserId)

  if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
    targetClient.ws.send(
      JSON.stringify({
        type: "chat-message",
        data: newMessage,
      }),
    )
    console.log(`✅ Message envoyé de ${fromUserId} à ${targetUserId}`)
  } else {
    console.log(`⚠️ Utilisateur ${targetUserId} non connecté`)
  }
}

function handleCallOffer(message, fromUserId) {
  const targetUserId = message.to
  const targetClient = clients.get(targetUserId)

  if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
    // Enregistrer l'appel dans la DB
    const db = readDB()
    const newCall = {
      id: Date.now().toString(),
      callerId: fromUserId,
      receiverId: targetUserId,
      type: message.data.type || "voice",
      status: "ringing",
      startTime: new Date().toISOString(),
    }

    if (!db.calls) db.calls = []
    db.calls.push(newCall)
    writeDB(db)

    targetClient.ws.send(
      JSON.stringify({
        type: "call-offer",
        from: fromUserId,
        data: {
          ...message.data,
          callId: newCall.id,
          from: fromUserId,
        },
      }),
    )

    console.log(`📞 Offre d'appel envoyée de ${fromUserId} à ${targetUserId}`)
  }
}

function handleCallAnswer(message, fromUserId) {
  const targetUserId = message.to
  const targetClient = clients.get(targetUserId)

  if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
    // Mettre à jour le statut de l'appel
    const db = readDB()
    if (db.calls && message.data.callId) {
      const call = db.calls.find((c) => c.id === message.data.callId)
      if (call) {
        call.status = message.data.accepted ? "active" : "declined"
        if (message.data.accepted) {
          call.answerTime = new Date().toISOString()
        } else {
          call.endTime = new Date().toISOString()
        }
        writeDB(db)
      }
    }

    targetClient.ws.send(
      JSON.stringify({
        type: "call-answer",
        from: fromUserId,
        data: message.data,
      }),
    )

    console.log(`📞 Réponse d'appel envoyée de ${fromUserId} à ${targetUserId}`)
  }
}

function handleIceCandidate(message, fromUserId) {
  const targetUserId = message.to
  const targetClient = clients.get(targetUserId)

  if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
    targetClient.ws.send(
      JSON.stringify({
        type: "ice-candidate",
        from: fromUserId,
        data: message.data,
      }),
    )
  }
}

function handleCallEnd(message, fromUserId) {
  // Mettre à jour l'appel dans la DB
  const db = readDB()
  if (db.calls && message.data.callId) {
    const call = db.calls.find((c) => c.id === message.data.callId)
    if (call) {
      call.status = "ended"
      call.endTime = new Date().toISOString()
      if (call.answerTime) {
        const duration = new Date(call.endTime) - new Date(call.answerTime)
        call.duration = Math.floor(duration / 1000) // en secondes
      }
      writeDB(db)
    }
  }

  // Notifier la fin d'appel
  const targetUserId = message.to
  const targetClient = clients.get(targetUserId)

  if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
    targetClient.ws.send(
      JSON.stringify({
        type: "call-end",
        from: fromUserId,
        data: message.data,
      }),
    )
  }
}

function handleMessageRead(message, fromUserId) {
  const db = readDB()

  // Marquer les messages comme lus
  if (db.messages && message.data.messageIds) {
    message.data.messageIds.forEach((messageId) => {
      const msg = db.messages.find((m) => m.id === messageId)
      if (msg) {
        msg.status = "read"
        msg.readAt = new Date().toISOString()
      }
    })
    writeDB(db)
  }

  const targetUserId = message.to
  const targetClient = clients.get(targetUserId)

  if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
    targetClient.ws.send(
      JSON.stringify({
        type: "message-read",
        from: fromUserId,
        data: message.data,
      }),
    )
  }
}

function handleTyping(message, fromUserId) {
  const targetUserId = message.to
  const targetClient = clients.get(targetUserId)

  if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
    targetClient.ws.send(
      JSON.stringify({
        type: "typing",
        from: fromUserId,
        data: message.data,
      }),
    )
  }
}

function updateUserOnlineStatus(userId, isOnline) {
  const db = readDB()

  if (!db.users) db.users = []

  let user = db.users.find((u) => u.id === userId)
  if (!user) {
    user = {
      id: userId,
      phone: userId,
      name: `User ${userId}`,
      isOnline: false,
      lastSeen: new Date().toISOString(),
    }
    db.users.push(user)
  }

  user.isOnline = isOnline
  user.lastSeen = new Date().toISOString()

  writeDB(db)
}

function broadcast(message, excludeUserId = null) {
  clients.forEach((client, userId) => {
    if (userId !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
    }
  })
}

function broadcastMessage(message) {
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
    }
  })
}

function broadcastOnlineUsers() {
  const onlineUsers = Array.from(clients.keys())

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: "online-users",
          data: { users: onlineUsers },
        }),
      )
    }
  })
}

// Ping périodique pour maintenir les connexions
setInterval(() => {
  clients.forEach((client, userId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ type: "ping" }))
    } else {
      clients.delete(userId)
    }
  })
}, 30000) // Toutes les 30 secondes

// Démarrer le serveur
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 Serveur JSON + WebSocket démarré sur le port ${PORT}`)
  console.log(`📡 API REST: http://localhost:${PORT}`)
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`)
  console.log(`📊 Base de données: db.json`)
})

// Gestion propre de l'arrêt
process.on("SIGINT", () => {
  console.log("\n🛑 Arrêt du serveur...")

  // Notifier tous les clients de la déconnexion
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: "server-shutdown",
          message: "Le serveur va redémarrer",
        }),
      )
      client.ws.close()
    }
  })

  wss.close(() => {
    server.close(() => {
      console.log("✅ Serveur arrêté proprement")
      process.exit(0)
    })
  })
})

module.exports = { app, server, wss }
