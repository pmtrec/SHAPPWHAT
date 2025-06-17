#!/bin/bash

echo "🚀 Démarrage du serveur WhatsApp Clone..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install json-server ws
fi

# Vérifier si db.json existe
if [ ! -f "db.json" ]; then
    echo "📄 Création de la base de données initiale..."
    cat > db.json << 'EOF'
{
  "users": [],
  "contacts": [],
  "conversations": [],
  "messages": [],
  "groups": [],
  "statuses": [],
  "calls": [],
  "communities": [],
  "businessCatalogs": []
}
EOF
fi

echo "🔌 Démarrage du serveur JSON + WebSocket..."
echo "📡 API REST disponible sur: http://localhost:3001"
echo "🔌 WebSocket disponible sur: ws://localhost:3001/ws"
echo "📊 Base de données: db.json"
echo ""
echo "Pour arrêter le serveur, appuyez sur Ctrl+C"
echo ""

# Démarrer le serveur
node server/json-server-websocket.js
