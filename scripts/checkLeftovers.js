import mysql from "mysql";
import fs from 'fs';

const actas = JSON.parse(fs.readFileSync('./data/actas.json', 'utf8'));
const connection = mysql.createConnection({
	host: '192.168.56.102',
  	user: 'test',
  	password: 'ADmn75185.',
  	database: 'atom',
});

connection.connect();

// Parent id from orizaba
// Seteando el id del documento orizaba
let totalOrizaba = 0;
let totalXalapa = 0;

let allActas = actas.map((acta) => {
  // Setteando id del objeto Orizaba si es que pertenecen a orizaba
  if (acta.campus === "ORIZABA") {
    acta.parentId = 1153;
    totalOrizaba++;
  }

  if (acta.campus === "XALAPA") {
    totalXalapa++;
  }

  return acta;
});

//Xalapa
// 719 Es el id del documento de xalapa
let query = 'select io.id, io.identifier, ioi.title from information_object as io, information_object_i18n as ioi where ioi.id=io.id and parent_id = 719';
connection.query(query, (error, results, fields) => {
  if (error) throw error;

  const actasOrizaba = allActas.filter((acta) => acta.campus === "ORIZABA"); 
  const actasXalapa = allActas.filter((acta) => acta.campus === "XALAPA");

  // Strings de los identificadores
  const identifiersArr = results.map((result) => result.identifier);console.log(identifiersArr);
  // Obtener las actas que estan en los rangos de ica atom
  const fueraDeRangoXalapa = actasXalapa.filter((acta) => {
    let exist = true;
    
    // Comparando todos los identificadores en ica  atom para ver si existe el acta
    for (let identifier of identifiersArr) {
      const actaIdentifier = getActaIdentifier(acta.inicioAnio, acta.finAnio);
      if (identifier.replace(" ", "") === actaIdentifier.replace(" ", "")) {
        exist = false;
        break;
      }
    }

    return exist;
  });

  /*console.log(fueraDeRangoXalapa);
  const formated = JSON.stringify(fueraDeRangoXalapa, null, 2);
  fs.writeFileSync('./data/sobrantesXalapa.json', formated);
  console.log('Rangos sobrantes guardados con éxito');
  return;*/

  const onlyIdentifiers = fueraDeRangoXalapa.map((acta) => getActaIdentifier(acta.inicioAnio, acta.finAnio));
  let duplicatesRemoved = onlyIdentifiers.filter((element, index) => {
    return onlyIdentifiers.indexOf(element) === index;
  });

  console.log("Lista de años que no están en ica atom: ");
  for (let year of duplicatesRemoved) {
    console.log("· " + year);
  }
});

connection.end();

/* Misc */

function getActaIdentifier(startYear, endYear) {
  return ((startYear === endYear) || (endYear === 0)) ? startYear.toString(): `${startYear}–${endYear}`;
}

// Obtener los años de inicio y fin de un identificador
// Un identificador tiene el siguiente formato: yyyy-yyyy (añoinicio-añofin)
function getYearsFromIdentifier(identifier) {
  const yearsArr = identifier.split("–");
  console.log(yearsArr);
  return yearsArr.length < 2 ? {
    inicio: parseInt(yearsArr[0], 10),
  }: {
    inicio: parseInt(yearsArr[0], 10),
    fin: parseInt(yearsArr[1], 10),
  };
}

function compareIdentifierActa(identifier, acta) {
  let isMatch = false;
  const identifierLength = Object.values(identifier).length;
  const actaLength = Object.values(acta).length;

  if (identifierLength === actaLength) {
    if (identifierLength === 1) {
      isMatch = identifier.inicio === acta.inicio ? true: false;
    }

    if (identifierLength === 2) {
      isMatch = identifier.inicio === acta.inicio && identifier.fin === acta.fin ? true: false;
    }
  }

  return isMatch;
}
