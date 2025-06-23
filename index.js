const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from Frontend directory
app.use('/Frontend', express.static(path.join(__dirname, 'Frontend')));
app.use('/Geojson_Data', express.static(path.join(__dirname, 'Geojson_Data')));
app.use('/Logic', express.static(path.join(__dirname, 'Logic')));

app.get(['/','/gismap'], (req, res) => {
    res.redirect("/Frontend/Main_Page.html");
});

// Serve sub-HTML pages for the buttons
app.get('/farmdata', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'Farm_Data.html'));
});

app.get('/racepop', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'Race_Population.html'));
});


app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal Server Error', details: err });
});

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));