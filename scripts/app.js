import fs from "fs";
import pkg from 'stopword';
import { removeStopwords, spa } from 'stopword';

function palabrasMasRepetidas(arr) {
  let diccionario = {};
  arr.forEach(cadena => {
    let palabras = cadena.split(" ");
    palabras.forEach(palabra => {
      if (palabra in diccionario) {
        diccionario[palabra] += 1;
      } else {
        diccionario[palabra] = 1;
      }
    });
  });

  // Ordena el diccionario por frecuencia de palabras
  let palabrasOrdenadas = Object.entries(diccionario).sort((a, b) => b[1] - a[1]);
  return palabrasOrdenadas;
}

/* Remover duplicados */
export function removeDuplicated(array) {
  return [...new Set(array)];
}

export function clearStopWords(data) {
  return data.map((item, i) => {
    const cleanString = item.toLowerCase().replace(/[^a-zA-Záéíóúñ\s]/g, '');

    const filteredText = removeStopwords(cleanString.split(' '), spa);
    return filteredText.join(' ');
  });
}

function main () {
  const actas = JSON.parse(fs.readFileSync('./data/finalData.json', 'utf8'));
  const contenidos = actas.map((acta) => {
    return acta.alcanceContenido;
  });

  // Lista de temas
  const nameAccessPoints = actas.map((acta) => {
    const names = acta.paMateria.split('|');
    const noSpaces = names.map((str) => str.trim());
    return noSpaces;
  });

  const listaMaterias = removeDuplicated(nameAccessPoints.flat());

  const formated2 = JSON.stringify(listaMaterias.sort(), null, 2);
  fs.writeFileSync('./data/temas.json', formated2);

  // Stop words removidas de los textos
  const cleared = clearStopWords(contenidos);

  const resultados = palabrasMasRepetidas(cleared);
  const mayorATres = resultados.filter((char) => char[0].length > 3);


  // Convirtiendo las actas a un json
  const formated = JSON.stringify(mayorATres, null, 2);
  fs.writeFileSync('./data/mayorATres.json', formated);
}
