import fs from 'fs';

const corrected = JSON.parse(fs.readFileSync('./data/finalData.json', 'utf8'));
const titulos = JSON.parse(fs.readFileSync('./data/gptest/blacklist.json', 'utf8'));

const orizaba = corrected.filter((item) => item.campus === "ORIZABA");
const xalapa = corrected.filter((item) => item.campus === "XALAPA");

// Listas
const listaOriginal = corrected.map((item) => {
  return getActaIdentifier(item.inicioAnio, item.finAnio);
}).filter((x) => !!x);

const listaXalapa = corrected.map((item) => {
  return item.campus === 'XALAPA' ? getActaIdentifier(item.inicioAnio, item.finAnio): undefined;
}).filter((x) => !!x);

const listaOrizaba = corrected.map((item) => {
  return item.campus === 'ORIZABA' ? getActaIdentifier(item.inicioAnio, item.finAnio): undefined;
}).filter((x) => !!x);

// Tests
const listaOrizabaFiltrada = orderList(removeDuplicated(listaOrizaba));

// Obtener lista de titulos de los documentos de orizaba
const listaDeTitulos = listaOrizabaFiltrada.map((lista) => {
  // 
  const allOfYear = orizaba.map((item) => {
    if (getActaIdentifier(item.inicioAnio, item.finAnio) === lista) {
      return item.titulo;
    }
  }).filter((x) => !!x);

  if (!allOfYear.length) console.log(lista);

  return removeDuplicated(allOfYear); 
});

///////////////////////////////////////
// Revisar foja de los rangos de años
///////////////////////////////////////
// Las fojas mas grandes serán utilizadas para los rangos o files en ica atom
const fojasAltasXalapa = xalapa.reduce((acc, acta) => {
  const identifier = getActaIdentifier(acta.inicioAnio, acta.finAnio);
  const fojaAlta = getFojaAlta(acta.volumenSoporte);

  // Si la propiedad no existe
  if (!acc.hasOwnProperty(identifier)) {
    return {
      ...acc,
      [`${identifier}`]: fojaAlta,
    };
  }

  // Si la propiedad ya existe y la foja actual es mayor a la que ya habia
  if (!isNaN(Number(fojaAlta)) && fojaAlta > acc[identifier]) {
    return {
      ...acc,
      [`${identifier}`]: fojaAlta,
    };
  }

  return acc;
}, {});

let cont = 0;
// Unificar todos los items de xalapa de un año en su propio objeto
const listaXalapaFiltrada = orderList(removeDuplicated(listaXalapa));
const allDataFromYears = listaXalapaFiltrada.map((yearIdentifier, index) => {
  const parent = {
    legacyId: index+1,
    qubitParentSlug: 'protocolos-notariales',
    identifier: yearIdentifier,
    title: `Protocolo ${yearIdentifier}`,
    levelOfDescription: 'Unidad documental compuesta',
    eventDates: yearIdentifier,
    extentAndMedium: fojasAltasXalapa[yearIdentifier],
    language: 'es',
    culture: 'es',
    parentId: '',
    scopeAndContent: '',
    appraisal: '',
    generalNote: '',
    subjectAccessPoints: '',
    placeAccessPoints: '',
    nameAccessPoints: '',
    descriptionStatus: '',
    levelOfDetail: "",
    eventTypes: "",
    eventStartDates: '',
    eventEndDates: '',
    eventActors: '',
  }

  const dataByYear = xalapa.filter((acta) => {
    return getActaIdentifier(acta.inicioAnio, acta.finAnio) === yearIdentifier;
  });

  const children = dataByYear.map((acta) => formatActa(acta, parent.legacyId));
  cont += children.length;

  return [parent, ...children]
});

// Agregar las rutas de los pdf a las actas
const pdfNames = await getPdfNames();
const xalapaWithPdfs = allDataFromYears.flat().map((acta) => {
  const pdf = pdfNames.filter((name) => acta.identifier+".pdf" === name);
  if (!!pdf.length) {
    return {
      ...acta,
      digitalObjectPath: `/home/cesar/digital-objects/pdfs/${pdf[0]}`,
    }
  }

  return {
      ...acta,
      digitalObjectPath: ``,
    };
});

const finalXalapa = xalapaWithPdfs.map((acta) => {
  const actaTitle = titulos.filter((titulo) => {
    return titulo.acta.codigoRef === acta.identifier;
  })[0];

  const newTitle = !!actaTitle ? actaTitle.gpt.choices: acta.title;
  
  return {
    ...acta,
    title:  newTitle,
  }
});

// Convirtiendo las actas a un json
const formated = JSON.stringify(finalXalapa, null, 2);
fs.writeFileSync('./data/preUploadXalapa.json', formated);

//////////////////////////////////
//  Misc
//////////////////////////////////
/* Obtener numero de acta */
function getActaIdentifier(startYear, endYear) {
  return ((startYear === endYear) || (endYear === 0)) ? startYear.toString(): `${startYear}-${endYear}`;
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
  const noSlash = filter1.split('-');
  const onlyNumbers = noSlash.filter((char)  => !isNaN(Number(char)) && char !== '');

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

async function getPdfNames() {
  const folderPath = './pdfs';

  try {
    const files = await fs.promises.readdir(folderPath);
    return files;
  } catch (err) {
    console.error(err);
  }
}

function formatActa(acta, parentId) {
  return {
    legacyId: '',
    qubitParentSlug: '',
    parentId,
    identifier: acta.codigoRef,
    title: acta.titulo,
    levelOfDescription: "Unidad documental simple",
    extentAndMedium: acta.volumenSoporte,
    scopeAndContent: acta.alcanceContenido,
    appraisal: "Documentación en conservación permanente.",
    language: "es",
    generalNote: acta.notas,
    subjectAccessPoints: acta.paMateria,
    placeAccessPoints: acta.paLugar,
    nameAccessPoints: acta.paAutoridad,
    descriptionStatus: "Borrador",
    levelOfDetail: "Parcial",
    eventDates: acta.fecha,
    eventTypes: "Creación",
    eventStartDates: acta.inicioAnio,
    eventEndDates: acta.finAnio,
    eventActors: acta.nombreProductor,
    culture: "es",
  }
}
