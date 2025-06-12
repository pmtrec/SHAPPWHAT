fetch('https://projet-json-server-2-acqb.onrender.com/messages')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Messages reçus :', data);
  })
  .catch(err => {
    console.error('❌ Erreur GET :', err);
  });
