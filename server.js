// SOSTITUISCI TUTTO IL CONTENUTO DI server.js CON:
const express = require('express');
const app = express();

// Importante: Servi i file statici
app.use(express.static('public'));

// Rotta principale che serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// La tua API esistente
app.post('/', (req, res) => {
    // ... mantieni il tuo codice API qui ...
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
