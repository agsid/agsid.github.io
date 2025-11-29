const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// PUT endpoint to update content.json
app.put('/content.json', (req, res) => {
    const data = req.body;
    fs.writeFileSync(path.join(__dirname, 'content.json'), JSON.stringify(data, null, 2));
    res.json({ status: 'success' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
