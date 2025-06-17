# WhatsApp Clone

Une application de messagerie complète inspirée de WhatsApp, développée en **HTML**, **Tailwind CSS** et **JavaScript vanilla**.

## 🚀 Fonctionnalités

### ✅ **Authentification**
- Connexion par numéro de téléphone
- Vérification par code SMS (simulé)
- Gestion des sessions utilisateur

### 💬 **Messagerie temps réel**
- Messages texte instantanés
- Envoi d'images et documents
- Messages vocaux avec enregistrement
- Indicateurs de statut (envoyé, livré, lu)
- Emojis et formatage du texte

### 📞 **Appels audio et vidéo**
- Appels vocaux en temps réel
- Appels vidéo avec WebRTC
- Interface d'appel intuitive
- Gestion des appels entrants/sortants

### 👥 **Gestion des contacts**
- Synchronisation des contacts
- Ajout manuel de contacts
- Statuts en ligne/hors ligne
- Recherche de contacts

### 🎨 **Interface utilisateur**
- Design fidèle à WhatsApp
- Thème sombre authentique
- Interface responsive
- Animations fluides

## 🛠️ Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation des dépendances
\`\`\`bash
npm install
\`\`\`

### Démarrage du serveur
\`\`\`bash
npm start
\`\`\`

### Mode développement
\`\`\`bash
npm run dev
\`\`\`

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Architecture

### Frontend (100% Vanilla)
- **HTML5** - Structure sémantique
- **Tailwind CSS** - Styling moderne
- **JavaScript ES6+** - Logique applicative

### Backend
- **Node.js** - Serveur HTTP
- **Express** - Framework web
- **WebSocket** - Communication temps réel

### APIs utilisées
- **WebSocket API** - Messagerie temps réel
- **MediaDevices API** - Accès caméra/microphone
- **MediaRecorder API** - Enregistrement audio
- **Notification API** - Notifications navigateur
- **File API** - Upload de fichiers
- **LocalStorage API** - Persistance des données
- **WebRTC API** - Appels vocaux/vidéo

## 🚀 Déploiement

### Déploiement local
1. Cloner le projet
2. Installer les dépendances : `npm install`
3. Démarrer le serveur : `npm start`
4. Ouvrir `http://localhost:3000`

### Déploiement sur serveur
1. Configurer les variables d'environnement
2. Installer les dépendances de production
3. Démarrer avec PM2 ou similaire
4. Configurer un reverse proxy (Nginx)

### Variables d'environnement
\`\`\`bash
PORT=3000                    # Port du serveur
NODE_ENV=production         # Environnement
\`\`\`

## 📱 Utilisation

### 1. **Inscription/Connexion**
- Entrer votre nom et numéro de téléphone
- Saisir le code de vérification affiché
- Synchroniser vos contacts (optionnel)

### 2. **Messagerie**
- Sélectionner un contact dans la liste
- Taper votre message et appuyer sur Entrée
- Utiliser les boutons pour envoyer des fichiers ou enregistrer de l'audio

### 3. **Appels**
- Cliquer sur l'icône téléphone ou vidéo
- Accepter/refuser les appels entrants
- Utiliser les contrôles pendant l'appel

### 4. **Contacts**
- Synchroniser automatiquement vos contacts
- Ajouter manuellement de nouveaux contacts
- Rechercher dans votre liste de contacts

## 🔧 Fonctionnalités techniques

### Communication temps réel
- WebSocket pour la messagerie instantanée
- Gestion automatique des reconnexions
- Synchronisation multi-appareils

### Gestion des médias
- Upload et prévisualisation d'images
- Enregistrement audio avec MediaRecorder
- Support des documents (PDF, DOC, etc.)

### Appels WebRTC
- Négociation automatique des connexions
- Support audio et vidéo
- Gestion des candidats ICE

### Persistance des données
- LocalStorage pour les conversations
- Sauvegarde automatique des contacts
- Gestion des sessions utilisateur

## 🐛 Dépannage

### Problèmes courants

**WebSocket ne se connecte pas**
- Vérifier que le serveur est démarré
- Contrôler les paramètres de firewall
- Vérifier l'URL de connexion

**Microphone/Caméra non accessible**
- Autoriser l'accès dans le navigateur
- Vérifier les permissions système
- Utiliser HTTPS en production

**Messages non reçus**
- Vérifier la connexion WebSocket
- Contrôler les logs du serveur
- Rafraîchir la page si nécessaire

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- WhatsApp pour l'inspiration du design
- La communauté open source pour les outils utilisés
- Tous les contributeurs du projet

---

**Note**: Cette application est un clone éducatif de WhatsApp et n'est pas affiliée à Meta/Facebook.
