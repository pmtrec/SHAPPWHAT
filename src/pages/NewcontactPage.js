// src/pages/renderNewContactPage.js
import { router } from "../router";
import { saveContactToDb } from "../utils/contactService";
import { validateContactForm } from "../utils/contactValidation";
import { showAppMessage } from "../utils/function.utils";
import { affichageNouveauContact } from "./constant";

export function renderNewContactPage() {
  const element = document.createElement("div");
  element.innerHTML = affichageNouveauContact;

  // Bouton retour
  const backButton = element.querySelector("#backButton");
  backButton?.addEventListener("click", () => {
    setTimeout(() => router("/menu"), 300);
  });

  // Bouton annuler
  const cancelButton = element.querySelector("#cancelButton");
  cancelButton?.addEventListener("click", () => router("/menu"));

  // Clic à l’extérieur pour fermer
  element.addEventListener("click", (e) => {
    if (e.target === element) router("/menu");
  });

  // Touche Échap pour revenir au menu
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      router("/menu");
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);

  // Soumission du formulaire
  const contactForm = element.querySelector("#contactForm");
  const saveButton = element.querySelector("#saveButton");

  contactForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      name: element.querySelector("#contact-name")?.value.trim(),
      phone: element.querySelector("#contact-phone")?.value.trim(),
      email: element.querySelector("#contact-email")?.value.trim(),
      status: element.querySelector("#contact-status")?.value.trim()
    };

    const { isValid, error } = validateContactForm(formData);
    if (!isValid) {
      showAppMessage(`❌ ${error}`, "error");
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Sauvegarde...";
    saveButton.classList.replace("hover:bg-green-600", "opacity-50");

    try {
      const result = await saveContactToDb(formData);
      if (result.success) {
        showAppMessage("✅ Contact ajouté avec succès!", "success");
        setTimeout(() => router("/home"), 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      showAppMessage(`❌ ${err.message}`, "error");
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Sauvegarder";
      saveButton.classList.replace("opacity-50", "hover:bg-green-600");
    }
  });

  return element;
}
