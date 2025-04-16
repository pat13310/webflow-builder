const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.all('/webflow/webhook', (req, res) => {
  console.log('Webhook reçu:', {
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  
  res.json({
    success: true,
    message: 'Webhook reçu avec succès',
    timestamp: new Date().toISOString(),
    data: {
      method: req.method,
      body: req.body,
      query: req.query
    }
  });
});

app.listen(port, () => {
  console.log(`Serveur webhook démarré sur http://localhost:${port}`);
});
