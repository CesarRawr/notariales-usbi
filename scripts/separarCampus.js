import fs from 'fs';

const corrected = JSON.parse(fs.readFileSync('./data/finalData.json', 'utf8'));
const orizaba = corrected.filter((item) => item.campus === "ORIZABA");

// Convirtiendo las actas a un json
const formated = JSON.stringify(orizaba, null, 2);
fs.writeFileSync('./data/orizaba.json', formated);

const xal = corrected.filter((item) => item.campus === "XALAPA");

// Convirtiendo las actas a un json
const formated2 = JSON.stringify(xal, null, 2);
fs.writeFileSync('./data/xalapa.json', formated2);
