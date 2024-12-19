const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Load matches from txt file
function loadMatches() {
    try {
        const data = fs.readFileSync('matches.txt', 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (err) {
        return [];
    }
}

// Save matches to txt file
function saveMatches(matches) {
    fs.writeFileSync('matches.txt', JSON.stringify(matches, null, 2), 'utf8');
}

// GET matches
app.get('/api/matches', (req, res) => {
    const matches = loadMatches();
    res.json(matches);
});

// POST matches (overwrite the file)
app.post('/api/matches', (req, res) => {
    const matches = req.body;
    saveMatches(matches);
    res.json({status: 'ok'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
