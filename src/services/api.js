export async function getContacts() {
  const res = await fetch("https://projet-json-server-2-acqb.onrender.com/contacts");
  if (!res.ok) {
    throw new Error("Erreur lors du chargement des contacts");
  }
  return res.json();
}
