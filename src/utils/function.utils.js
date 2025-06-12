
export function showAppMessage(message, type = 'info') {
  const messageContainer = document.createElement("div");
  messageContainer.className = `fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
  
  const styles = {
    info: "bg-blue-500 text-white",
    success: "bg-green-500 text-white", 
    warning: "bg-yellow-500 text-black",
    error: "bg-red-500 text-white"
  };
  
  messageContainer.className += ` ${styles[type] || styles.info}`;
  messageContainer.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">${message}</span>
      <button class="ml-3 text-lg hover:opacity-70">×</button>
    </div>
  `;
  
  // Gestion du clic sur le bouton de fermeture
  messageContainer.querySelector('button').onclick = () => {
    messageContainer.remove();
  };
  
  document.body.appendChild(messageContainer);
  
  // Animation d'entrée
  setTimeout(() => {
    messageContainer.style.transform = "translateX(0)";
  }, 10);
  
  // Suppression automatique après 3 secondes
  setTimeout(() => {
    messageContainer.style.transform = "translateX(full)";
    setTimeout(() => {
      messageContainer.remove();
    }, 300);
  }, 3000);
}

export function showAppConfirm(message, onConfirm, onCancel) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]";
  
  const modal = document.createElement("div");
  modal.className = "bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-2xl";
  
  modal.innerHTML = `
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Confirmation</h3>
    <p class="text-gray-600 mb-6">${message}</p>
    <div class="flex space-x-3 justify-end">
      <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
        Annuler
      </button>
      <button id="confirm-btn" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
        Confirmer
      </button>
    </div>
  `;
  
  // Gestion des événements
  modal.querySelector('#cancel-btn').onclick = () => {
    overlay.remove();
    onCancel?.();
  };
  
  modal.querySelector('#confirm-btn').onclick = () => {
    overlay.remove();
    onConfirm?.();
  };
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  return overlay;
}
