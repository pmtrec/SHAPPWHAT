import { renderNotFoundPage } from "/src/pages/home/fond.js";
import { renderHome } from "/src/pages/homePage.js";
import { renderInscription } from "/src/pages/InscriptionPage.js";
import { renderLogin } from "/src/pages/LoginPage.js";
import { renderMenuPage } from "/src/pages/MenuPage.js";
import { renderNewContactPage } from "/src/pages/NewcontactPage.js";

const routes = {
  "/login": renderLogin,
  "/inscription": renderInscription,
  "/home": renderHome,
  "/menu": renderMenuPage,
  "/new-contact": renderNewContactPage,
  "/discusion": renderNotFoundPage,
};

const middleViewPaths = ["/menu", "/new-contact"];
const rightViewPaths = ["/discusion"];

export async function router(path = "/login") {
  const viewFunction = routes[path];

  if (!viewFunction) {
    document.querySelector("#app").innerHTML = `
      <p class="text-red-500 text-center">Erreur : La route "${path}" n'existe pas.</p>
    `;
    return;
  }

  try {
    const viewElement = await viewFunction();

    if (!(viewElement instanceof HTMLElement)) {
      console.error(`❌ Erreur lors du rendu de la route "${path}" : La vue retournée n’est pas un élément HTML.`, viewElement);
      document.querySelector("#app").innerHTML = `
        <p class="text-red-500 text-center">Erreur lors du rendu de la route "${path}"</p>
      `;
      return;
    }

    if (middleViewPaths.includes(path)) {
      const page = document.querySelector("#page");
      if (page) {
        page.innerHTML = "";
        page.appendChild(viewElement);
      }
    } else if (rightViewPaths.includes(path)) {
      const main = document.querySelector("#main");
      if (main) {
        main.innerHTML = "";
        main.appendChild(viewElement);
      }
    } else {
      const app = document.querySelector("#app");
      if (app) {
        app.innerHTML = "";
        app.appendChild(viewElement);
      }
    }

  } catch (error) {
    console.error(`❌ Erreur inattendue lors du rendu de la route "${path}" :`, error);
    document.querySelector("#app").innerHTML = `
      <p class="text-red-500 text-center">Erreur critique lors du rendu.</p>
    `;
  }
}
