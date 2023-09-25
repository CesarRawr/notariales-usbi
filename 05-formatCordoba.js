import fs from "node:fs";

const finalJson = fs.readFileSync("./data/cordoba/semifinal.json", "utf8");
const cordoba = JSON.parse(finalJson);

///////////////////////////////////////
// Revisar foja de los rangos de años
///////////////////////////////////////
// Las fojas mas grandes serán utilizadas para los rangos o files en ica atom
const fojasAltasCordoba = cordoba.map((item) => {
  const fojasAltas = item.actas.reduce((acc, acta) => {
    const identifier = getActaIdentifier(acta.inicioAnio, acta.finAnio);
    const fojaAlta = getFojaAlta(acta.foja);

    // Si la propiedad no existe
    if (!acc.hasOwnProperty(identifier)) {
      return {
        ...acc,
        [item.id]: fojaAlta,
      };
    }

    // Si la propiedad ya existe y la foja actual es mayor a la que ya habia
    if (!isNaN(Number(fojaAlta)) && fojaAlta > acc[identifier]) {
      return {
        ...acc,
        [item.id]: fojaAlta,
      };
    }

    return acc;
  }, {});

  return fojasAltas;
});

let cont = 79;
// Unificar todos los items de xalapa de un año en su propio objeto
const allDataFromYears = cordoba.map((item, index) => {
  const eventDates = getActaIdentifier(item.inicioAnio, item.finAnio);
  // Buscar su foja en las fojas altas
  const extentAndMedium = fojasAltasCordoba.find((fojaAlta) => {
    const [key, value] = Object.entries(fojaAlta).flat();
    return key === item.id;
  });

  const parent = {
    legacyId: cont + 1,
    qubitParentSlug: "protocolos-notariales",
    identifier: item.id,
    title: item.nombre,
    levelOfDescription: "Unidad documental compuesta",
    eventDates,
    extentAndMedium: extentAndMedium[item.id],
    language: "es",
    culture: "es",
    parentId: "",
    scopeAndContent: "",
    appraisal: "",
    generalNote: "",
    subjectAccessPoints: "",
    placeAccessPoints: "",
    nameAccessPoints: "",
    descriptionStatus: "",
    levelOfDetail: "",
    eventTypes: "",
    eventStartDates: "",
    eventEndDates: "",
    eventActors: "",
  };

  const children = item.actas.map((acta) => formatActa(acta, parent.legacyId));
  cont++;

  return [parent, ...children];
});

// Convirtiendo las actas a un json
const formated = JSON.stringify(allDataFromYears.flat(), null, 2);
fs.writeFileSync('./data/cordoba/finalC.json', formated);

//////////////////////////////////
//  Misc
//////////////////////////////////
/* Obtener numero de acta */
function getActaIdentifier(startYear, endYear) {
  return startYear === endYear || endYear === 0
    ? startYear.toString()
    : `${startYear}-${endYear}`;
}

/* Remover duplicados */
function removeDuplicated(array) {
  return [...new Set(array)];
}

// Orgena un array de numeros string.
function orderList(array) {
  return array.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

// Función que regresa la foja mas alta en el string foja
function getFojaAlta(foja) {
  const filter1 = keepNumbers(foja);
  const noSlash = filter1.split("-");
  const onlyNumbers = noSlash.filter(
    (char) => !isNaN(Number(char)) && char !== ""
  );

  const highest = getHighNumber(onlyNumbers);
  if (!highest) {
    return foja;
  }

  return highest;
}

// Función usada para obtener el numero mas grande de en un array.
function getHighNumber(array) {
  return array.reduce((acc, numStr) => {
    const num = Number(numStr);
    if (num > acc) {
      return num;
    }

    return acc;
  }, 0);
}

// Funcion usada para limpiar las fojas de las letras y simbolos. Pero manteniendo los guiones y numeros
function keepNumbers(str) {
  return str.replace(/[a-zA-Z\.,_ ]/g, "-");
}

function formatActa(acta, parentId) {
  const subjectAccessPoints = acta.tematico.join(" | ").toUpperCase();
  const placeAccessPoints = acta.geografico.join(" | ").toUpperCase();
  const nameAccessPoints = acta.onomastico.join(" | ").toUpperCase();

  return {
    legacyId: "",
    qubitParentSlug: "",
    parentId,
    identifier: acta.id,
    title: "",
    levelOfDescription: "Unidad documental simple",
    extentAndMedium: acta.foja,
    scopeAndContent: acta.contenido,
    appraisal: "Documentación en conservación permanente.",
    language: "es",
    generalNote: acta.observaciones,
    subjectAccessPoints,
    placeAccessPoints,
    nameAccessPoints,
    descriptionStatus: "Borrador",
    levelOfDetail: "Parcial",
    eventDates: acta.fecha,
    eventTypes: "Creación",
    eventStartDates: acta.inicioAnio,
    eventEndDates: acta.finAnio,
    eventActors: acta.creador,
    culture: "es",
  };
}
