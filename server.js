const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/analyze', (req, res) => {
  let audioUrl;
  
  // Gestione avanzata input
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      audioUrl = parsed.audioUrl || parsed;
    } catch (e) {
      audioUrl = req.body;
    }
  } else if (typeof req.body === 'object') {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
