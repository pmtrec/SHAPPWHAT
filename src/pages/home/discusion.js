export function renderDiscussion(contact = { name: "خیر جیات ❤️ 👑", avatar: "🐕" }) {
  // Container principal de la page de discussion avec theme sombre
  const container = document.createElement("div");
  container.classList.add("w-full", "flex", "flex-col", "h-full", "bg-gray-800");

  // Header avec le nom du contact et avatar (theme sombre)
  const header = document.createElement("div");
  header.classList.add("flex", "items-center", "p-3", "bg-gray-900", "text-white", "border-b", "border-gray-700");
  header.innerHTML = `
    <div class="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold mr-3 hover:scale-110 transition-transform duration-200">
      ${contact.avatar}
    </div>
    <div class="flex-1">
      <div class="font-semibold text-white">${contact.name}</div>
      <div class="text-xs text-gray-400">en ligne</div>
    </div>
    <div class="flex gap-2">
      <button class="p-2 hover:bg-gray-800 rounded-full text-gray-300 hover:text-white transition-colors duration-200">🔍</button>
      <button class="p-2 hover:bg-gray-800 rounded-full text-gray-300 hover:text-white transition-colors duration-200">⋮</button>
    </div>`;
  container.appendChild(header);

  // Zone des messages avec fond sombre
  const messages = document.createElement("div");
  messages.classList.add("flex-1", "p-4", "overflow-y-auto", "bg-gray-800");
  // Pattern subtil pour le fond sombre
  messages.style.backgroundImage = "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0iIzM3NDE1MSIvPgo8L3N2Zz4K')";
  messages.style.backgroundSize = "20px 20px";

  // Messages d'exemple basés sur l'image
  const messagesData = [
    { sender: "contact", text: "Hana kon tawoul fofou", time: "14:45", type: "text" },
    { sender: "me", text: "Sh fi de", time: "14:45", type: "text" },
    { sender: "me", text: "Da khin", time: "14:45", type: "text" },
    { sender: "contact", text: "", time: "14:46", type: "audio", duration: "0:09" },
    { sender: "me", text: "", time: "14:46", type: "audio", duration: "0:06" },
    { sender: "contact", text: "Boy", time: "15:12", type: "text" },
    { sender: "me", text: "Fils", time: "15:11", type: "text" },
    { sender: "me", text: "Agne gua", time: "15:12", type: "text" },
    { sender: "contact", text: "Non non", time: "15:13", type: "text" },
    { sender: "contact", text: "", time: "15:17", type: "audio", duration: "0:06" },
    { sender: "contact", text: "Wa ok d'accord", time: "15:18", type: "text" },
    { sender: "me", text: "https://shappwhat.vercel.app/", time: "16:21", type: "link" },
    { sender: "me", text: "Fille", time: "19:33", type: "text" }
  ];

  messagesData.forEach(msg => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("mb-2", "flex");
    
    if (msg.sender === "me") {
      messageDiv.classList.add("justify-end");
    } else {
      messageDiv.classList.add("justify-start");
    }

    let messageContent = "";
    
    if (msg.type === "audio") {
      const bgColor = msg.sender === "me" ? "bg-green-600" : "bg-gray-700";
      const textColor = msg.sender === "me" ? "text-white" : "text-white";
      messageContent = `
        <div class="${bgColor} rounded-lg p-2 max-w-xs shadow-lg flex items-center gap-2 hover:scale-105 transition-transform duration-200">
          <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <span class="text-white text-xs">${contact.avatar}</span>
          </div>
          <button class="text-green-400 hover:text-green-300">▶</button>
          <div class="flex-1 h-2 bg-gray-500 rounded-full relative overflow-hidden">
            <div class="h-full bg-green-500 rounded-full animate-pulse" style="width: 30%"></div>
          </div>
          <span class="text-xs text-gray-300">${msg.duration}</span>
          <span class="text-xs text-gray-400 ml-2">${msg.time}</span>
          ${msg.sender === "me" ? '<span class="text-green-400 text-xs">✓✓</span>' : ''}
        </div>`;
    } else if (msg.type === "link") {
      messageContent = `
        <div class="bg-green-600 rounded-lg p-3 max-w-sm shadow-lg hover:scale-105 transition-transform duration-200">
          <div class="bg-gray-700 rounded p-2 mb-2">
            <div class="text-sm font-semibold text-white">shappwhat.vercel.app</div>
            <div class="text-xs text-blue-400">${msg.text}</div>
            <div class="text-xs text-gray-400 mt-1">shappwhat.vercel.app</div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-300">${msg.time}</span>
            <span class="text-green-400 text-xs">✓✓</span>
          </div>
        </div>`;
    } else {
      const bgColor = msg.sender === "me" ? "bg-green-600" : "bg-gray-700";
      const textColor = "text-white";
      messageContent = `
        <div class="${bgColor} rounded-lg p-2 max-w-xs shadow-lg hover:scale-105 transition-transform duration-200">
          <div class="text-sm ${textColor}">${msg.text}</div>
          <div class="flex justify-end items-center gap-1 mt-1">
            <span class="text-xs text-gray-300">${msg.time}</span>
            ${msg.sender === "me" ? '<span class="text-green-400 text-xs">✓✓</span>' : ''}
          </div>
        </div>`;
    }

    messageDiv.innerHTML = messageContent;
    messages.appendChild(messageDiv);
  });

  container.appendChild(messages);

  // Formulaire d'envoi de messages (style sombre)
  const form = document.createElement("form");
  form.classList.add("flex", "items-center", "p-3", "bg-gray-900", "gap-2", "border-t", "border-gray-700");

  form.innerHTML = `
    <button type="button" class="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-all duration-200">😊</button>
    <button type="button" class="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-all duration-200">📎</button>
    <input 
      name="message" 
      placeholder="Entrez un message" 
      class="flex-1 p-2 border border-gray-600 rounded-full bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-gray-500 transition-all duration-200" 
      required
    />
    <button type="button" class="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-all duration-200">🎤</button>`;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const messageText = form.message.value.trim();

    if (messageText) {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("mb-2", "flex", "justify-end");
      
      const currentTime = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      messageDiv.innerHTML = `
        <div class="bg-green-600 rounded-lg p-2 max-w-xs shadow-lg hover:scale-105 transition-transform duration-200 animate-pulse">
          <div class="text-sm text-white">${messageText}</div>
          <div class="flex justify-end items-center gap-1 mt-1">
            <span class="text-xs text-gray-300">${currentTime}</span>
            <span class="text-green-400 text-xs">✓✓</span>
          </div>
        </div>`;

      messages.appendChild(messageDiv);
      form.reset();

      // Animation d'envoi
      setTimeout(() => {
        messageDiv.querySelector('.animate-pulse').classList.remove('animate-pulse');
      }, 1000);

      // Fait défiler jusqu'en bas automatiquement
      messages.scrollTop = messages.scrollHeight;
    }
  });

  container.appendChild(form);

  return container;
}