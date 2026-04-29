fetch('http://localhost:3001/login')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Error:', e.message));
