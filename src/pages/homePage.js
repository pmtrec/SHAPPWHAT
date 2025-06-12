
import { router } from "../router";
import { getContacts } from "../services/api";
import { renderContactList } from "./home/ContactList";
import {
  ChatIcon,
  StatusIcon,
  NewsletterIcon,
  CommunityIcon,
  SettingsIcon,
  NewChatIcon,
  MenuIcon,
  SearchIcon,
  ArchiveIcon,
  LockIcon
} from "./home/icone";
export async function renderHome() {
  const contacts = await getContacts();

const contactListElement = renderContactList(contacts);
  const element = document.createElement("div");
  element.innerHTML = `
    <div class="bg-gray-900 h-screen overflow-hidden font-sans">
      <div class="flex h-full">
        <!-- Sidebar -->
        <div class="h-full w-20 bg-gray-900 flex flex-col justify-between items-center py-4 border-r-2 border-gray-700">
          <div class="flex flex-col space-y-6 items-center">
            <div class="relative cursor-pointer hover:scale-110 transition-transform duration-200">
              ${ChatIcon}
              <span class="absolute -top-2 -right-2 bg-green-500 text-xs text-white rounded-full px-2 font-bold animate-pulse">
                85
              </span>
            </div>
            <div class="relative cursor-pointer hover:scale-110 transition-transform duration-200">
              ${StatusIcon}
              <span class="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
            </div>
            <div class="relative cursor-pointer hover:scale-110 transition-transform duration-200">
              ${NewsletterIcon}
              <span class="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
            </div>
            <div class="cursor-pointer hover:scale-110 transition-transform duration-200">
              ${CommunityIcon}
            </div>
          </div>

          <div class="flex flex-col items-center space-y-6">
            <div class="w-10 h-[2px] bg-gray-500"></div>
            <div class="cursor-pointer hover:scale-110 transition-transform duration-200">
              ${SettingsIcon}
            </div>
            <img
              src="/placeholder.svg?height=40&width=40"
              alt="avatar"
              class="w-10 h-10 rounded-full border-2 border-gray-700 cursor-pointer hover:border-green-500 transition-colors duration-200"
            />
          </div>
        </div>

        <!-- Chat List -->
        <div id="page" class=" flex flex-col ">
          <div class="bg-gray-900 p-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="full flex items-center justify-center">
              
              </div>
              <h1 class="text-white text-xl font-medium">WhatsApp</h1>
            </div>
            <div class="flex items-center space-x-8 text-gray-300">
            <button id="NewChatIco" class="cursor-pointer">
              ${NewChatIcon}
                 </button>
              <button id="a" " class="cursor-pointer">
                ${MenuIcon}
              </button>
            </div>
          </div>

          <div class="p-3 bg-gray-900">
            <div class="relative">
              ${SearchIcon}
              <input
                type="text"
                placeholder="Rechercher ou démarrer une discussion"
                class="w-full bg-gray-600 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:bg-gray-500"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div class="px-10 py-3 flex items-center space-x-3 text-gray-300 border-gray-600 cursor-pointer hover:bg-gray-700">
              ${ArchiveIcon}
              <span class="text-sm">Archivées</span>
            </div>
            <div id="contact-list-placeholder"></div>

          </div>
      </div>

        <!-- Main Content -->
        <div id="main" class="flex-1 bg-gray-800 flex items-center justify-center">
          <div class="text-center max-w-md">
            <h2 class="text-2xl font-light text-white mb-4">WhatsApp Web</h2>
            <p class="text-gray-300 text-sm leading-relaxed mb-2">
              Envoyez et recevez des messages sans avoir à garder votre téléphone connecté.
            </p>
            <p class="text-gray-300 text-sm leading-relaxed mb-8">
              Utilisez WhatsApp sur un maximum de 4 appareils et 1 téléphone, simultanément.
            </p>
            <div class="flex items-center justify-center text-gray-400 text-xs">
              ${LockIcon}
              <span>Vos messages personnels sont chiffrés de bout en bout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  const placeholder = element.querySelector("#contact-list-placeholder");
   if (placeholder) {
  placeholder.replaceWith(contactListElement);
   }


  const NewChatIco = element.querySelector("#NewChatIco");
  if (NewChatIco) {
    NewChatIco.addEventListener("click", () => {
  
      router("/menu");
    });
  }
    const N = element.querySelector("#a");
  if (N) {
    N.addEventListener("click", () => {
  
      router("/discusion");
    });
  }

  return element;
}
