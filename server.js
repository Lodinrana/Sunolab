const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint principale
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>Sunolab - Analisi Musicale</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          background-color: #f8f9fa;
          color: #333;
        }
        h1 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }
        code {
          background: #2c3e50;
          color: #ecf0f1;
          padding: 15px;
          display: block;
          border-radius: 5px;
          margin: 15px 0;
          font-family: 'Courier New', monospace;
        }
        .success {
          color: #27ae60;
          font-weight: bold;
        }
        .error {
          color: #e74c3c;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>🎵 Sunolab Music Analysis API</h1>
      <p>Servizio attivo e connesso alle API di Cyanite</p>
      
      <h3>Per analizzare un brano musicale:</h3>
      <code>
      curl -X POST ${process.env.RENDER_EXTERNAL_URL || 'https://sunolab.onrender.com'}/api/analyze \<br>
        -H "Content-Type: application/json" \<br>
        -d '{"audioUrl":"https://example.com/tua-traccia.mp3"}'
      </code>
      
      <h3>Formato della risposta:</h3>
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
      
      <p class="success">Stato: API operative</p>
    </body>
    </html>
  `);
});

// Endpoint di analisi con Cyanite
app.post('/api/analyze', async (req, res) => {
  let audioUrl;
  
  // Gestione flessibile degli input
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      audioUrl = parsed.audioUrl || parsed;
    } catch {
      audioUrl = req.body;
    }
  } else if (typeof req.body === 'object') {
    audioUrl = req.body.audioUrl || req.body.url || req.body.link;
  }

  // Verifica presenza URL audio
  if (!audioUrl) {
    return res.status(400).json({ 
      error: 'Parametro audioUrl mancante',
      suggestion: 'Invia un JSON con {"audioUrl": "https://..."}'
    });
  }

  try {
    console.log(`Richiesta analisi per: ${audioUrl}`);
    
    // Chiamata alle API di Cyanite
    const response = await fetch('https://api.cyanite.ai/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CYANITE_JWT}`
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

    const data = await response.json();
    
    // Gestione errori Cyanite
    if (data.errors) {
      const cyaniteError = data.errors[0].message;
      console.error(`Errore Cyanite: ${cyaniteError}`);
      return res.status(500).json({
        error: "Errore nell'analisi musicale",
        details: cyaniteError,
        suggestion: 'Verifica che la URL sia pubblica e accessibile'
      });
    }
    
    // Estrazione risultati
    const analysis = data.data.analyzeTrack.analysisResult;
    
    // Formattazione risposta
    const result = {
      bpm: analysis.bpm,
      key: analysis.key.name,
      genre: analysis.genre.name,
      mood: {
        positiveEnergy: analysis.mood.positiveEnergy,
        calmness: analysis.mood.calmness,
        happiness: analysis.mood.happiness
      },
      sunoPrompt: `Una traccia ${analysis.genre.name} in ${analysis.key.name} a ${analysis.bpm} BPM`
    };

    console.log(`Analisi completata per: ${audioUrl}`);
    res.status(200).json(result);

  } catch (error) {
    console.error("Errore durante l'analisi:", error);
    res.status(500).json({
      error: "Errore interno del server",
      details: error.message,
      suggestion: 'Controlla i log del server per maggiori dettagli'
    });
  }
});

// Endpoint di controllo dello stato
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Sunolab Music Analysis',
    cyanite: process.env.CYANITE_JWT ? 'connected' : 'not configured',
    uptime: process.uptime()
  });
});

// Avvio server
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
  console.log(`Endpoint principale: http://localhost:${PORT}`);
  console.log(`Endpoint analisi: http://localhost:${PORT}/api/analyze`);
});
