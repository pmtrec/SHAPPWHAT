import { router } from "../router";

export function renderInscription() {
  const element = document.createElement("div");

  element.innerHTML = `
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-bold text-center text-green-600 mb-6">Créer un compte WhatsApp</h2>

      <div class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Nom complet</label>
          <input type="text" id="name" name="name" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required>
        </div>

        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
          <input type="tel" id="phone" name="phone" placeholder="+243000000000" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input type="password" id="password" name="password" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
          <input type="password" id="confirmPassword" name="confirmPassword" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" required>
        </div>

        <button class="w-full bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition duration-300">
          Créer un compte
        </button>
      </div>

      <p id="btnReconnecter" class="text-sm text-center text-gray-500 mt-6">Vous avez déjà un compte ? <a href="#" class="text-green-600 hover:underline">Connectez-vous</a></p>
    </div>
  </div>
  `;

  // Bouton pour se reconnecter
  const btnReconnecter = element.querySelector("#btnReconnecter");
  btnReconnecter.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#app").innerHTML = "";
    router("/login");
  });

  // 📦 Zone de message
  const msgBox = document.createElement("div");
  msgBox.className = "text-sm mt-4 text-center font-semibold";
  element.querySelector(".space-y-4").appendChild(msgBox);

  // Bouton de création de compte
  const btnCreate = element.querySelector("button");
  btnCreate.addEventListener("click", async () => {
    const name = element.querySelector("#name").value.trim();
    const phone = element.querySelector("#phone").value.trim();
    const password = element.querySelector("#password").value;
    const confirmPassword = element.querySelector("#confirmPassword").value;

    msgBox.textContent = "";
    msgBox.classList.remove("text-red-500", "text-green-600");

    if (!name || !phone || !password || !confirmPassword) {
      msgBox.textContent = "⚠️ Tous les champs sont requis.";
      msgBox.classList.add("text-red-500");
      return;
    }

    if (password !== confirmPassword) {
      msgBox.textContent = "❌ Les mots de passe ne correspondent pas.";
      msgBox.classList.add("text-red-500");
      return;
    }

    try {
      const res = await fetch("https://projet-json-server-2-acqb.onrender.com/users");
      const users = await res.json();
      const phoneExists = users.find(user => user.phone === phone);

      if (phoneExists) {
        msgBox.textContent = "❌ Ce numéro est déjà utilisé.";
        msgBox.classList.add("text-red-500");
        return;
      }

      await fetch("https://projet-json-server-2-acqb.onrender.com/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      });

      msgBox.textContent = "✅ Compte créé avec succès ! Redirection...";
      msgBox.classList.add("text-green-600");

      setTimeout(() => {
        document.querySelector("#app").innerHTML = "";
        router("/login");
      }, 1500);

    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      msgBox.textContent = "❌ Une erreur est survenue. Veuillez réessayer.";
      msgBox.classList.add("text-red-500");
    }
  });

  return element;
}
