// src/services/contactService.js
export async function saveContactToDb(contactData) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('authToken');

    const dataToSend = {
      name: contactData.name,
      phone: contactData.phone,
      email: contactData.email,
      status: contactData.status
    };

    const response = await fetch('http://localhost:3000/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(dataToSend)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Erreur HTTP: ${response.status}`);
    }

    const existingContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    existingContacts.push(result.contact);
    localStorage.setItem('contacts', JSON.stringify(existingContacts));

    return { success: true, contact: result.contact };

  } catch (error) {
    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Erreur de connexion au serveur';
    } else if (error.message.includes('409')) {
      errorMessage = 'Ce numéro de téléphone existe déjà';
    } else if (error.message.includes('401')) {
      errorMessage = 'Session expirée, veuillez vous reconnecter';
    }

    return { success: false, error: errorMessage };
  }
}
