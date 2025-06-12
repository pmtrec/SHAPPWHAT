import { router } from "../router";
import { showAppConfirm, showAppMessage } from "../utils/function.utils";

const MENU_OPTIONS = [
  { label: "Nouveau groupe", action: "new-group", icon: "👥" },
  { label: "Nouveau contact", action: "new-contact", icon: "👤" },
  { label: "Nouvelle communauté", action: "new-community", icon: "👥" },
  { label: "Statut", action: "status", icon: "🟢" },
  { label: "Déconnexion", action: "logout", isDanger: true, icon: "🚪" },
];

function createMenuCard() {
  const container = document.createElement("div");
  container.className = " bg-white h-full flex flex-col";
  
  // Header avec titre et bouton retour
  const header = createHeader();
  
  // Search bar
  const searchSection = createSearchSection();
  
  // Menu options
  const menuSection = createMenuSection();
  
  container.append(header, searchSection, menuSection);

  return container;

}

function createHeader() {
  const header = document.createElement("div");
  header.className = "flex items-center bg-green-500 text-white px-4 py-3 shadow-md";
  
  const backButton = document.createElement("button");
  backButton.innerHTML = "←";
  backButton.className = "text-2xl mr-4 p-1 hover:bg-green-600 rounded-full transition-colors";
  backButton.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMenu();
  });
  
  const title = document.createElement("h1");
  title.textContent = "Nouvelle discussion";
  title.className = "text-lg font-medium";
  
  header.append(backButton, title);
  return header;
}

function createSearchSection() {
  const section = document.createElement("div");
  section.className = "px-4 py-3 bg-white border-b border-gray-200";
  
  const searchContainer = document.createElement("div");
  searchContainer.className = "relative";
  
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Rechercher un nom ou un numéro";
  searchInput.className = "w-full pl-10 pr-4 py-2 border-2 border-green-400 rounded-full bg-gray-50 text-gray-700 placeholder-gray-500 focus:outline-none focus:border-green-500";
  
  const searchIcon = document.createElement("div");
  searchIcon.innerHTML = "🔍";
  searchIcon.className = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400";
  
  searchContainer.append(searchIcon, searchInput);
  section.appendChild(searchContainer);
  return section;
}
function createMenuSection() {
  const section = document.createElement("div");
  section.className = "flex-1 bg-white";

  
  // Menu options avec icônes circulaires
  MENU_OPTIONS.forEach((opt, index) => {
    const menuItem = createMenuItem(opt);
    section.appendChild(menuItem);
    
    // Ajouter une ligne de séparation après les 3 premiers éléments
    if (index === 2) {
      const separator = document.createElement("div");
      separator.className = "px-4 py-2";
      
      const separatorText = document.createElement("p");
      separatorText.textContent = "Contacts sur WhatsApp";
      separatorText.className = "text-sm text-gray-500 font-medium";
      
      separator.appendChild(separatorText);
      section.appendChild(separator);
    }
  });
  return section;
}

function createMenuItem(option) {
  const item = document.createElement("div");
  item.className = "flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-100";
  
  // Icône circulaire
  const iconContainer = document.createElement("div");
  iconContainer.className = `w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
    option.action === 'new-group' ? 'bg-green-500' :
    option.action === 'new-contact' ? 'bg-green-500' :
    option.action === 'new-community' ? 'bg-green-500' :
    option.isDanger ? 'bg-red-500' : 'bg-gray-400'
  }`;
  
  const icon = document.createElement("span");
  icon.className = "text-white text-lg";
  icon.innerHTML = getIconForAction(option.action);
  
  iconContainer.appendChild(icon);
  
  // Texte
  const textContainer = document.createElement("div");
  textContainer.className = "flex-1";
  
  const label = document.createElement("p");
  label.textContent = option.label;
  label.className = `text-base ${option.isDanger ? 'text-red-600' : 'text-gray-900'} font-medium`;
  
  textContainer.appendChild(label);
  
  // Event listener
  item.addEventListener("click", () => handleMenuAction(option.action));
  
  item.append(iconContainer, textContainer);
  return item;
}

function getIconForAction(action) {
  const icons = {
    'new-group': '👥',
    'new-contact': '👤',
    'new-community': '👥',
    'status': '🟢',
    'logout': '🚪'
  };
  return icons[action] || '⚙️';
}

function handleMenuAction(action) {
  switch (action) {
    case "new-contact":
      router("/new-contact");
      break;
    case "new-group":
      showAppMessage("🔧 Fonctionnalité à implémenter : Nouveau groupe", "info");
      router("/home");
      break;
    case "new-community":
      showAppMessage("🔧 Fonctionnalité à implémenter : Nouvelle communauté", "info");
      router("/home");
      break;
    case "status":
      showAppMessage("🔧 Fonctionnalité à implémenter : Statut", "info");
      router("/home");
      break;
    case "logout":
      handleLogout();
      break;
    default:
      showAppMessage(`🔧 Fonctionnalité à implémenter : ${action}`, "info");
      router("/home");
  }
}

function handleLogout() {
  showAppConfirm(
    "Êtes-vous sûr de vouloir vous déconnecter ?",
    () => {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("authToken");
      document.querySelector("#app").innerHTML = "";
      showAppMessage("✅ Déconnexion réussie", "success");
      router("/login");
    },
    () => {
      showAppMessage("Déconnexion annulée", "info");
    }
  );
}

function closeMenu() {
  router("/home");
}

export function renderMenuPage() {
  const element = createMenuCard();

  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  
  
  return element;
}
