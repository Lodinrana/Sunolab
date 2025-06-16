const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Aggiungi questo middleware per il debug (opzionale ma utile)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body received:', req.body);
  next();
});

// MODIFICA QUI SOTTO - QUESTA È LA PARTE CHE DEVI SOVRASCRIVERE
app.post('/api/analyze', (req, res) => {
  let audioUrl;
  
  // Gestione di entrambi i casi: JSON object o stringa pura
  if (typeof req.body === 'string') {
    audioUrl = req.body;
  } else {
    audioUrl = req.body.audioUrl;
  }

  if (!audioUrl) {
    return res.status(400).json({ error: 'audioUrl is required' });
  }

  const result = {
    genre: 'Progressive Trance',
    mood: 'Uplifting, emotional',
    structure: 'Intro, verse, breakdown, build-up, drop, outro',
    style: 'Spacious pads, female vocals, emotional melodies',
    sunoPrompt: 'uplifting trance, emotional female vocal, energetic drop, progressive structure'
  };

  res.status(200).json(result);
});
// FINE DELLA MODIFICA

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
