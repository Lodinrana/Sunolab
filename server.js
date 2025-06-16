const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint per la root
app.get('/', (req, res) => {
  res.send('Sunolab API is running. Use POST /api/analyze to analyze music.');
});

// Endpoint di analisi (versione semplificata per test)
app.post('/api/analyze', (req, res) => {
  res.status(200).json({ message: 'Analysis endpoint works!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
