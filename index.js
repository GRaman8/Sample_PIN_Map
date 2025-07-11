require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT

// Serve static files from Frontend directory
app.use('/Frontend', express.static(path.join(__dirname, 'Frontend')));
app.use('/Geojson_Data', express.static(path.join(__dirname, 'Geojson_Data')));
app.use('/Logic', express.static(path.join(__dirname, 'Logic')));

app.get(['/','/gismap'], (req, res) => {
    res.redirect("/Frontend/Main_Page.html");
});

// Serve sub-HTML pages for the buttons
app.get('/1860/farmdata', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', '1860', 'Farm_Data.html'));
});

app.get('/1860/racepop', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', '1860', 'Race_Population.html'));
});

// Year 2022 State level route
app.get('/2022/state/farmdata', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', '2022','State', 'Farm_Data.html'));
});

app.get('/2022/state/racepop', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', '2022','State', 'Race_Population.html'));
});

// Year 2022 County Level route
app.get('/2022/county/farmdata', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', '2022','County', 'Farm_Data.html'));
});

app.get('/2022/county/racepop', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', '2022','County', 'Race_Population.html'));
});

app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal Server Error', details: err });
});

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));