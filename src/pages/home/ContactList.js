// ContactList.js
export function renderContactList(contacts) {
  const container = document.createElement("div");
  container.className = "bg-gray-900 overflow-y-auto";
  
  contacts.forEach((contact, index) => {
    const card = document.createElement("div");
    card.className = `
      px-4 py-3 flex items-center space-x-3 cursor-pointer 
      hover:bg-gray-800 active:bg-gray-750 transition-colors duration-150
      border-b border-gray-700 relative group
    `;
    
    // Animation d'entrée
    card.style.animation = `slideInLeft 0.3s ease-out ${index * 0.05}s both`;
    
    // Indicateur de statut en ligne
    const onlineStatus = contact.isOnline ? 
      '<div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>' : '';
    
    // Formatage de l'heure
    const formatTime = (time) => {
      if (!time) return '';
      const now = new Date();
      const messageTime = new Date(time);
      const diffDays = Math.floor((now - messageTime) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return messageTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Hier';
      } else if (diffDays < 7) {
        return messageTime.toLocaleDateString('fr-FR', { weekday: 'short' });
      } else {
        return messageTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      }
    };
    
    // Indicateur de type de message
    const getMessageIcon = (contact) => {
      if (contact.lastMessageType === 'image') return '📷';
      if (contact.lastMessageType === 'voice') return '🎤';
      if (contact.lastMessageType === 'video') return '📹';
      if (contact.lastMessageType === 'document') return '📄';
      return '';
    };
    
    // Indicateur de statut de message (lu/non lu)
    const messageStatus = contact.lastMessageSent ? 
      `<span class="text-blue-400 text-xs ml-1">${contact.lastMessageRead ? '✓✓' : '✓'}</span>` : '';
    
    card.innerHTML = `
      <div class="relative">
        <img
          src="${contact.avatar || '/api/placeholder/50/50'}"
          alt="${contact.name}"
          class="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-600 transition-all duration-200"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiM0Qjk3MzYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMFYyMkgxOFYyMEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+'"
        />
        ${onlineStatus}
      </div>
      
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center space-x-2">
            <h3 class="text-white font-medium text-base truncate max-w-32">${contact.name}</h3>
            ${contact.isVerified ? '<span class="text-blue-400 text-xs">✓</span>' : ''}
            ${contact.isMuted ? '<span class="text-gray-500 text-xs">🔇</span>' : ''}
          </div>
          <div class="flex items-center space-x-1">
            <span class="text-gray-400 text-xs font-medium">${formatTime(contact.lastMessageTime)}</span>
            ${contact.isPinned ? '<span class="text-gray-400 text-xs">📌</span>' : ''}
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-1 flex-1 min-w-0">
            <span class="text-xs">${getMessageIcon(contact)}</span>
            <p class="text-gray-400 text-sm truncate flex-1">
              ${contact.isTyping ? 
                '<span class="text-green-400 italic">en train d\'écrire...</span>' : 
                (contact.lastMessage || 'Aucun message')
              }
            </p>
            ${messageStatus}
          </div>
          
          <div class="flex items-center space-x-2 ml-2">
            ${contact.unreadCount > 0 ? `
              <div class="flex items-center">
                <span class="bg-green-500 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[20px] text-center">
                  ${contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                </span>
              </div>
            ` : ''}
            
            ${contact.lastMessageType === 'voice' && !contact.isPlayed ? 
              '<span class="w-2 h-2 bg-green-500 rounded-full"></span>' : ''
            }
          </div>
        </div>
      </div>
      
      <!-- Menu contextuel (apparaît au hover) -->
      <div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button class="text-gray-400 hover:text-white p-1 rounded">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>
    `;
    
    // Événements
    card.addEventListener('click', () => {
      // Retirer la sélection précédente
      document.querySelectorAll('.contact-selected').forEach(el => {
        el.classList.remove('contact-selected', 'bg-gray-800');
      });
      
      // Sélectionner le contact actuel
      card.classList.add('contact-selected', 'bg-gray-800');
      
      // Dispatchers un événement personnalisé
      const event = new CustomEvent('contactSelected', {
        detail: { contact, element: card }
      });
      container.dispatchEvent(event);
    });
    
    // Long press pour menu contextuel
    let pressTimer;
    card.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => {
        showContextMenu(contact, card);
      }, 500);
    });
    
    card.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
    });
    
    card.addEventListener('mouseleave', () => {
      clearTimeout(pressTimer);
    });
    
    container.appendChild(card);
  });
  
  // Ajouter les styles d'animation
  if (!document.querySelector('#contact-list-styles')) {
    const style = document.createElement('style');
    style.id = 'contact-list-styles';
    style.textContent = `
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .contact-selected {
        background-color: #374151 !important;
        border-left: 3px solid #10b981;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .typing-indicator {
        animation: pulse 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
  }
  
  return container;
}

