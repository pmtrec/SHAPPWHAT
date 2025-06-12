import { router } from "../router";

export function renderLogin() {
  const user = sessionStorage.getItem("user");
 if (user) {
  router("/home");
  // ✅ Retourne un élément vide pour éviter l'erreur
  return document.createElement("div");
}


  const element = document.createElement("div");
  element.className = "min-h-screen flex items-center justify-center bg-gray-100";

  const box = document.createElement("div");
  box.className = "bg-white p-8 rounded-2xl shadow-lg w-full max-w-md";

  const title = document.createElement("h2");
  title.className = "text-2xl font-bold text-center text-green-600 mb-6";
  title.textContent = "Connexion WhatsApp";

  const form = document.createElement("form");
  form.className = "space-y-4";

  
  const phoneGroup = document.createElement("div");
  const phoneLabel = document.createElement("label");
  phoneLabel.textContent = "Numéro de téléphone";
  phoneLabel.className = "block text-sm font-medium text-gray-700";
  const phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  phoneInput.required = true;
  phoneInput.placeholder = "Ex: +243 000 000 000";
  phoneInput.className = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500";
  phoneGroup.appendChild(phoneLabel);
  phoneGroup.appendChild(phoneInput);

  // Mot de passe
  const passGroup = document.createElement("div");
  const passLabel = document.createElement("label");
  passLabel.textContent = "Mot de passe";
  passLabel.className = "block text-sm font-medium text-gray-700";
  const passInput = document.createElement("input");
  passInput.type = "password";
  passInput.required = true;
  passInput.className = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500";
  passGroup.appendChild(passLabel);
  passGroup.appendChild(passInput);

  // Bouton
  const btnConnecter = document.createElement("button");
  btnConnecter.type = "submit";
  btnConnecter.textContent = "Se connecter";
  btnConnecter.className = "w-full bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition duration-300";

  // Message d’erreur
  const errorMsg = document.createElement("p");
  errorMsg.id = "errorMsg";
  errorMsg.className = "text-red-500 text-sm text-center";

  form.appendChild(phoneGroup);
  form.appendChild(passGroup);
  form.appendChild(btnConnecter);
  form.appendChild(errorMsg);

  // Lien d'inscription
  const bottomText = document.createElement("p");
  bottomText.className = "text-sm text-center text-gray-500 mt-6";
  bottomText.innerHTML = `Vous n'avez pas de compte ? <a href="#" class="text-green-600 hover:underline" id="signupLink">Inscrivez-vous</a>`;

  // Gestion du lien
  bottomText.querySelector("#signupLink").addEventListener("click", (e) => {
    e.preventDefault();
    router("/inscription");
  });

  box.appendChild(title);
  box.appendChild(form);
  box.appendChild(bottomText);
  element.appendChild(box);

  // Soumission du formulaire
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const phone = phoneInput.value.trim();
    const password = passInput.value.trim();
    errorMsg.textContent = "";

    if (!phone || !password) {
      errorMsg.textContent = "Tous les champs sont obligatoires.";
      return;
    }

    fetch("https://projet-json-server-2-acqb.onrender.com/users")
      .then(res => res.json())
      .then(users => {
        const foundUser = users.find(user =>
          user.phone === phone && user.password === password
        );

        if (foundUser) {
          sessionStorage.setItem("user", JSON.stringify(foundUser));
          document.querySelector("#app").innerHTML = "";
          router("/home");
        } else {
          errorMsg.textContent = "❌ Numéro ou mot de passe incorrect.";
        }
      })
      .catch(err => {
        console.error("Erreur serveur :", err);
        errorMsg.textContent = "Erreur de connexion au serveur.";
      });
  });

  return element;
}
