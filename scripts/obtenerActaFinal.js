import fs from 'fs';

// Modificar los documentos corregidos
const original = JSON.parse(fs.readFileSync('./data/actas.json', 'utf8'));
const corrected = JSON.parse(fs.readFileSync('./data/corregido.json', 'utf8'));

let cont = 0;
const newData = original.map((originalItem) => {
  const newItem = corrected.filter((correctedItem) => correctedItem.codigoRef === originalItem.codigoRef);
  if (!!newItem.length) {
    cont++;
    return newItem[0];
  }

  return {
    ...originalItem,
    paAutoridad: originalItem.paAutoridad.join(' | '),
    paLugar: originalItem.paLugar.join(' | '),
    paMateria: originalItem.paMateria.join(' | '),
  };
});

console.log(newData.length);

// Convirtiendo las actas a un json
const formated = JSON.stringify(newData, null, 2);
fs.writeFileSync('./data/finalData.json', formated);
