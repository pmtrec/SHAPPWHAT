export const affichageNouveauContact = `
<main class="w-full min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
  <div class="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 space-y-6">
    
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-green-600">➕ Nouveau Contact</h2>
      <button 
        id="backButton" 
        class="text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
        aria-label="Retour au menu"
      >
        ← Retour
      </button>
    </div>

    <form id="contactForm" class="space-y-6">
      <!-- Champ nom -->
      <div>
        <label for="contact-name" class="block text-sm font-medium text-gray-700 mb-2">
          Nom complet <span class="text-red-500">*</span>
        </label>
        <input 
          type="text"
          id="contact-name"
          required
          placeholder="Entrez le nom complet"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <!-- Champ téléphone -->
      <div>
        <label for="contact-phone" class="block text-sm font-medium text-gray-700 mb-2">
          Numéro de téléphone <span class="text-red-500">*</span>
        </label>
        <input 
          type="tel"
          id="contact-phone"
          required
          placeholder="+221 XX XXX XX XX"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <!-- Champ email -->
      <div>
        <label for="contact-email" class="block text-sm font-medium text-gray-700 mb-2">
          Email (optionnel)
        </label>
        <input 
          type="email"
          id="contact-email"
          placeholder="exemple@email.com"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <!-- Champ statut -->
      <div>
        <label for="contact-status" class="block text-sm font-medium text-gray-700 mb-2">
          Statut (optionnel)
        </label>
        <input 
          type="text"
          id="contact-status"
          placeholder="Disponible, Occupé, etc."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-4 pt-6 border-t">
        <button 
          id="cancelButton" 
          type="button" 
          class="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
        >
          Annuler
        </button>
        <button 
          id="saveButton" 
          type="submit" 
          class="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
        >
          Sauvegarder
        </button>
      </div>
    </form>
  </div>
</main>
`;
