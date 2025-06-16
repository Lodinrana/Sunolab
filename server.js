const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Nuova gestione per la root
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
  <html>
  <head>
    <title>Sunolab API</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; }
      code { background: #f4f4f4; padding: 10px; display: block; }
    </style>
  </head>
  <body>
    <h1>🎵 Sunolab Music Analysis API</h1>
    <p>Use POST <strong>/api/analyze</strong> to analyze music tracks</p>
    
    <h3>Example request:</h3>
    <code>
    curl -X POST ${process.env.RENDER_EXTERNAL_URL || 'https://sunolab.onrender.com'}/api/analyze \\<br>
      -H "Content-Type: application/json" \\<br>
      -d '{"audioUrl":"https://example.com/audio.mp3"}'
    </code>
    
    <h3>Response format:</h3>
    <pre>
{
  "bpm": 128,
  "key": "G Major",
  "genre": "Progressive Trance",
  "mood": {
    "positiveEnergy": 0.85,
    "calmness": 0.45,
    "happiness": 0.78
  },
  "sunoPrompt": "A Progressive Trance track in G Major at 128 BPM"
}
    </pre>
  </body>
  </html>`);
});

// Endpoint di analisi
app.post('/api/analyze', async (req, res) => {
  let audioUrl;
  
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

  try {
    const cyaniteResponse = await fetch('https://api.cyanite.ai/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CYANITE_API_KEY}`
      },
      body: JSON.stringify({
        query: `
          mutation AnalyzeTrack($input: AnalyzeTrackInput!) {
            analyzeTrack(input: $input) {
              analysisStatus
              analysisResult {
                id
                bpm
                key {
                  name
                }
                genre {
                  name
                }
                mood {
                  positiveEnergy
                  calmness
                  happiness
                }
              }
            }
          }
        `,
        variables: {
          input: {
            audioFileUrl: audioUrl,
            analysisTypes: ["KEY", "BPM", "GENRE", "MOOD"]
          }
        }
      })
    });

    const cyaniteData = await cyaniteResponse.json();
    
    if (cyaniteData.errors) {
      throw new Error(`Cyanite API error: ${cyaniteData.errors[0].message}`);
    }

    const analysis = cyaniteData.data.analyzeTrack.analysisResult;
    
    const result = {
      bpm: analysis.bpm,
      key: analysis.key.name,
      genre: analysis.genre.name,
      mood: {
        positiveEnergy: analysis.mood.positiveEnergy,
        calmness: analysis.mood.calmness,
        happiness: analysis.mood.happiness
      },
      sunoPrompt: `A ${analysis.genre.name} track in ${analysis.key.name} at ${analysis.bpm} BPM`
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Cyanite analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT
