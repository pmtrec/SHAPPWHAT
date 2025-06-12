// src/utils/contactValidation.js
export function validateContactForm(data) {
  if (!data.name) return { isValid: false, error: "Le nom est obligatoire" };
  if (!data.phone) return { isValid: false, error: "Le numéro de téléphone est obligatoire" };

  const phoneRegex = /^(\+221|221)?[0-9]{9}$|^(\+|00)[1-9][0-9]{7,14}$/;
  if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
    return { isValid: false, error: "Format de téléphone invalide (ex: +221771234567)" };
  }

  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { isValid: false, error: "Format d'email invalide" };
    }
  }

  return { isValid: true };
}
