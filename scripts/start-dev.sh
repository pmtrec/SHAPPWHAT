#!/bin/bash

# Démarrer JSON Server en arrière-plan
echo "🚀 Démarrage de JSON Server..."
npm run json-server &

# Attendre que JSON Server démarre
sleep 3

# Démarrer Next.js
echo "🚀 Démarrage de Next.js..."
npm run dev
