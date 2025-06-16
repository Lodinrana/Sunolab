const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint per la root
app.get('/', (req, res) => {
  res.send(`
    <h1>Sunolab API</h1>
    <p>Use POST /api/analyze to analyze music</p>
    <p>Example request:</p>
    <pre>
curl -X POST ${process.env.RENDER_EXTERNAL_URL || 'https://YOUR_URL.onrender.com'}/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"audioUrl":"https://example.com/audio.mp3"}'
    </pre>
  `);
});

app.post('/api/analyze', async (req, res) => {
  // ... il resto del codice invariato ...
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
