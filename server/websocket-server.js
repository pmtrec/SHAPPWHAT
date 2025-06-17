const WebSocket = require("ws")
const http = require("http")
const url = require("url")

// Créer un serveur HTTP
const server = http.createServer()

// Créer un serveur WebSocket
const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    const query = url.parse(info.req.url, true).query
    return query.userId // Vérifier que l'utilisateur a un ID
  },
})

// Stocker les connexions actives
const clients = new Map()

wss.on("connection", (ws, req) => {
  const query = url.parse(req.url, true).query
  const userId = query.userId

  console.log(`Utilisateur ${userId} connecté`)

  // Stocker la connexion
  clients.set(userId, ws)

  // Envoyer la liste des utilisateurs en ligne
  broadcastOnlineUsers()

  // Notifier les autres utilisateurs
  broadcast(
    {
      type: "user-online",
      data: { userId },
    },
    userId,
  )

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data)
      console.log(`Message de ${userId}:`, message)

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
        default:
          console.log("Type de message non géré:", message.type)
      }
    } catch (error) {
      console.error("Erreur parsing message:", error)
    }
  })

  ws.on("close", () => {
    console.log(`Utilisateur ${userId} déconnecté`)
    clients.delete(userId)

    // Notifier les autres utilisateurs
    broadcast(
      {
        type: "user-offline",
        data: { userId },
      },
      userId,
    )

    broadcastOnlineUsers()
  })

  ws.on("error", (error) => {
    console.error(`Erreur WebSocket pour ${userId}:`, error)
  })
})

function handleChatMessage(message, fromUserId) {
  const targetUserId = message.to
  const targetWs = clients.get(targetUserId)

  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(
      JSON.stringify({
        type: "chat-message",
        from: fromUserId,
        data: message.data,
        timestamp: new Date().toISOString(),
      }),
    )

    console.log(`Message envoyé de ${fromUserId} à ${targetUserId}`)
  } else {
    console.log(`Utilisateur ${targetUserId} non connecté`)
  }
}

function handleCallOffer(message, fromUserId) {
  const targetUserId = message.to
  const targetWs = clients.get(targetUserId)

  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(
      JSON.stringify({
        type: "call-offer",
        from: fromUserId,
        data: {
          ...message.data,
          from: fromUserId,
        },
      }),
    )

    console.log(`Offre d'appel envoyée de ${fromUserId} à ${targetUserId}`)
  }
}

function handleCallAnswer(message, fromUserId) {
  const targetUserId = message.to
  const targetWs = clients.get(targetUserId)

  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(
      JSON.stringify({
        type: "call-answer",
        from: fromUserId,
        data: message.data,
      }),
    )

    console.log(`Réponse d'appel envoyée de ${fromUserId} à ${targetUserId}`)
  }
}

function handleIceCandidate(message, fromUserId) {
  // Diffuser le candidat ICE à tous les participants de l'appel
  broadcast(
    {
      type: "ice-candidate",
      from: fromUserId,
      data: message.data,
    },
    fromUserId,
  )
}

function handleCallEnd(message, fromUserId) {
  // Notifier la fin d'appel à tous les participants
  broadcast(
    {
      type: "call-end",
      from: fromUserId,
      data: message.data,
    },
    fromUserId,
  )
}

function handleMessageRead(message, fromUserId) {
  const targetUserId = message.to
  const targetWs = clients.get(targetUserId)

  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(
      JSON.stringify({
        type: "message-read",
        from: fromUserId,
        data: message.data,
      }),
    )
  }
}

function broadcast(message, excludeUserId = null) {
  clients.forEach((ws, userId) => {
    if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  })
}

function broadcastOnlineUsers() {
  const onlineUsers = Array.from(clients.keys())

  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "online-users",
          data: { users: onlineUsers },
        }),
      )
    }
  })
}

// Démarrer le serveur
const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`Serveur WebSocket démarré sur le port ${PORT}`)
  console.log(`WebSocket URL: ws://localhost:${PORT}`)
})

// Gestion propre de l'arrêt
process.on("SIGINT", () => {
  console.log("Arrêt du serveur...")
  wss.close(() => {
    server.close(() => {
      console.log("Serveur arrêté")
      process.exit(0)
    })
  })
})
