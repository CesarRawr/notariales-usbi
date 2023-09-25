import fs from 'fs';
const actas = fs.readFileSync('./data/cordova.txt', 'utf8').toString();

console.log(actas);