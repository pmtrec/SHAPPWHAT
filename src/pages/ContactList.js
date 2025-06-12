
export function generateContactListHTML(contacts) {
  return contacts.map((contact) => `
    <div class="px-4 py-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-700 border-b border-gray-600">
      <img
        src="${contact.avatar || '/placeholder.svg?height=50&width=50'}"
        alt="${contact.name}"
        class="w-12 h-12 rounded-full object-cover"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="text-white font-medium text-sm truncate">${contact.name}</h3>
          <span class="text-gray-400 text-xs">${contact.lastMessageTime || '00:00'}</span>
        </div>
        <div class="flex items-center justify-between mt-1">
          <p class="text-gray-400 text-sm truncate">${contact.lastMessage || '...'}</p>
          ${
            contact.unreadCount > 0
              ? `<div class="flex items-center space-x-1">
                  <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span class="bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">${contact.unreadCount}</span>
                </div>`
              : ""
          }
        </div>
      </div>
    </div>
  `).join('');
}
