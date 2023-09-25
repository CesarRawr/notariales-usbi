import fs from "fs";

const palabras = JSON.parse(fs.readFileSync('./data/finalData.json', 'utf8'));
const eliminarEspeciales = palabras.map((cadena) => {
	return cadena.replace(/[^a-zA-ZáéíóúüÁÉÍÓÚÜñÑ]/g, "");
});

console.log(eliminarEspeciales);

