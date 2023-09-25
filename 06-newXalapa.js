/* Formating new xalapa protocols */
/* 
  
*/

import fs from "node:fs";
const plainText = fs.readFileSync(
  "./data/xalapa-new/01-plain-new-xalapa.txt",
  "utf8",
);

const basePath = "./data/xalapa-new/";

/* Parsing plain text to an array */
const mainArray = plainText
  .split("\r\n")
  .filter((str) => str.trim().length > 0);

// Se obtienen los indices de las secciones de protocolos
const protocoloIndexes = mainArray
  .map((str, index) => {
    const isProtocoloSubtitle = str.split(" ")[0].includes("Protocolo");

    // Si es un subtitulo, devolver el subtitulo y su index
    if (isProtocoloSubtitle) {
      return {
        name: str,
        index,
      };
    }
    // Limpiar items vacíos
  })
  .filter((x) => Boolean(x));

// Set ranges to protocol title
const protocolsWithRages = protocoloIndexes.map((protocol, index, array) => {
  // Getting last index from protocol
  const until = Boolean(array[index + 1])
    ? array[index + 1].index
    : mainArray.length;

  return {
    ...protocol,
    until,
  };
});

/* Ahora debemos agrupar los protocolos de acuerdo a su subtitulo */
const groupedStrings = protocolsWithRages.reduce((grouped, actual) => {
  const protocols = mainArray.slice(actual.index + 1, actual.until);
  return [
    ...grouped,
    {
      title: actual.name,
      protocols,
    },
  ];
}, []);

// First json save to watch if theresnt wrong data
function firstSave() {
  const json = JSON.stringify(groupedStrings, null, 2);
  fs.writeFileSync("./data/xalapa-new/02-testingGroupedStrings.json", json);
}


const groupedProtocols = groupedStrings.map(({ title, protocols }) => {
  // Setting index of the start of protocols
  const indexedProtocols = protocols
    .map((protocolString, index) => {
      const idNumber = parseInt(protocolString.split(". ")[0]);
      if (!isNaN(idNumber)) {
        return {
          id: idNumber,
          from: index,
        };
      }
    })
    .filter((x) => Boolean(x));

  // Setting the last index of protocols
  const finalIndexed = indexedProtocols.map((protocol, index, array) => {
    // Getting last index from protocol
    const until = Boolean(array[index + 1])
      ? array[index + 1].from
      : protocols.length;

    return {
      ...protocol,
      until,
    };
  });

  // Group protocols by last index obtained
  const groupedNewProtocols = finalIndexed.reduce((grouped, actual) => {
    const slicedProtocols = protocols.slice(actual.from, actual.until);
    return [...grouped, slicedProtocols];
  }, []);

  return {
    title,
    protocols: groupedNewProtocols,
  };
});

// First json save to watch if theresnt wrong data
function secondSave() {
  const json = JSON.stringify(groupedProtocols, null, 2);
  fs.writeFileSync("./data/xalapa-new/03-testingGroupedProtocols.json", json);
}

// adding observations to protocols that they need
function addingObservations() {
  const groupedProtocolsJson = fs.readFileSync(
    "./data/xalapa-new/03-testingGroupedProtocols.json",
    "utf8",
  );

  // Parsing file getted
  const groupedProtocolsObj = JSON.parse(groupedProtocolsJson);

  // Adding Observations
  const protocolsWithEmptyObservations = groupedProtocolsObj.map((item) => {
    const protocols = item.protocols.map((protocol) => {
      // looking if there are observations.
      const thereAreObservations = protocol.some((protocolStr) =>
        protocolStr.includes("Observaciones:"),
      );
      // If there isnt an observation and protocol size is less than 3, we'll add empty observations.
      if (protocol.length < 4 && !thereAreObservations) {
        return [...protocol, "[Sin Observaciones]"];
      }

      return protocol;
    });

    return {
      ...item,
      protocols,
    };
  });

  const json = JSON.stringify(protocolsWithEmptyObservations, null, 2);
  fs.writeFileSync("./data/xalapa-new/03-testingGroupedProtocols.json", json);
}

function addingNoAuthor() {
  const groupedProtocolsJson = fs.readFileSync(
    "./data/xalapa-new/03-testingGroupedProtocols.json",
    "utf8",
  );

  // Parsing file getted
  const groupedProtocolsObj = JSON.parse(groupedProtocolsJson);

  // Adding Observations
  const protocolsWithEmptyAuthors = groupedProtocolsObj.map((item) => {
    const protocols = item.protocols.map((protocol) => {
      // looking if there are observations.
      const thereAreObservations = protocol.some((protocolStr) =>
        protocolStr.includes("Observaciones:"),
      );

      // If there is an observation and protocol size is  3, we'll add empty author.
      if (protocol.length === 3 && thereAreObservations) {
        return [
          protocol[0],
          "[Sin creador]",
          protocol[1],
          protocol[2]
        ];
      }

      return protocol;
    });

    return {
      ...item,
      protocols,
    };
  });

  const json = JSON.stringify(protocolsWithEmptyAuthors, null, 2);
  fs.writeFileSync("./data/xalapa-new/03-testingGroupedProtocols.json", json);
}

// Lets see which arrays are oversized strings
// Then ill complete those to 4 strings, depending on what they need
function showProtocolsWithMoreThan4Strings() {
  // Getting last json file
  const groupedProtocolsJson = fs.readFileSync(
    "./data/xalapa-new/03-testingGroupedProtocols.json",
    "utf8",
  );

  // Parsing file getted
  const groupedProtocolsObj = JSON.parse(groupedProtocolsJson);

  // Watching errors.
  groupedProtocolsObj.forEach((item) => {
    const idsWithMoreThan4Strings = item.protocols.filter(
      (strArr) => strArr.length > 4,
    );

    idsWithMoreThan4Strings.forEach((strArr) => {
      console.log(strArr[0]);
    });
  });
}

//////////////////////////////////////////////////
// 859. 1827/10/25, f. 263 - 265 vta., Xalapa
// 859 has 2 observations (fixed)
////////////////////////////////////////////////

// Showing smol protocols
function showProtocolsWithLessThan4Strings() {
  const groupedProtocolsJson = fs.readFileSync(
    "./data/xalapa-new/03-testingGroupedProtocols.json",
    "utf8",
  );

  const groupedProtocolsObj = JSON.parse(groupedProtocolsJson);

  groupedProtocolsObj.forEach((item) => {
    const idsWithLessThan4Strings = item.protocols.filter(
      (strArr) => strArr.length < 4,
    );

    // 859. 1827/10/25, f. 263 - 265 vta., Xalapa
    // 859 has 2 observations
    idsWithLessThan4Strings.forEach((strArr) => {
      console.log(strArr[0]);
    });
  });
}

// Formating each protocol with its fields
function gettingFieldsFromProtocols() {
  const groupedProtocolsJson = fs.readFileSync(
    "./data/xalapa-new/03-testingGroupedProtocols.json",
    "utf8",
  );

  const groupedProtocolsObj = JSON.parse(groupedProtocolsJson);

  const newGroupedProtocols = groupedProtocolsObj.map((item) => {
    const formatedProtocols = item.protocols.map((protocolArr) => {
      const firstStringArray = protocolArr[0]
        .split(" ")
        .filter((str) => str.trim() !== "");

      const id = firstStringArray.shift().replace(".", "");
      const lugar = firstStringArray.pop();
      const fecha = firstStringArray.shift().replace(",", "");
      const foja = firstStringArray.join(" ");

      if (fecha.length < 10 || fecha.length > 10) {
        // Wrong dates
        // 743. 1827/01/390
        // 821. 1827/059

        console.log(id, fecha);
      }

      // Rest of info
      const creador = protocolArr[1];
      const contenido = protocolArr[2];
      const observaciones = protocolArr[3];

      return {
        id,
        fecha,
        foja,
        lugar,
        creador,
        contenido,
        observaciones,
      };
    });

    return {
      ...item,
      protocols: formatedProtocols,
    };
  });

  const json = JSON.stringify(newGroupedProtocols, null, 2);
  fs.writeFileSync("./data/xalapa-new/04-formatedProtocols.json", json);
}

function gettingIndexes() {
  const temaFile = "00-indices_tema_nuevo_xalapa.json";
  const onoFile = "00-indices_ono_nuevo_xalapa.json";
  const geoFile = "00-indices_geo_nuevo_xalapa.json";

  const tematicos = JSON.parse(
    fs.readFileSync(basePath + temaFile, "utf8"),
  ).map((tema) => {
    const indices = getFormatedIndexes(tema.indices);
    return {
      ...tema,
      indices,
    };
  });

  const onomasticos = JSON.parse(
    fs.readFileSync(basePath + onoFile, "utf8"),
  ).map((tema) => {
    const indices = getFormatedIndexes(tema.indices);
    return {
      ...tema,
      indices,
    };
  });

  const geograficos = JSON.parse(
    fs.readFileSync(basePath + geoFile, "utf8"),
  ).map((tema) => {
    const indices = getFormatedIndexes(tema.indices);
    return {
      ...tema,
      indices,
    };
  });

  function getFormatedIndexes(index) {
    return String(index)
      .trim()
      .split(",")
      .map((str) => str.trim());
  }

  const groupedProtocolsJson = fs.readFileSync(
    basePath + "04-formatedProtocols.json",
    "utf8",
  );

  // Parsing file getted
  const groupedProtocolsObj = JSON.parse(groupedProtocolsJson);
  const protocolsWithIndexes = groupedProtocolsObj.map(
    ({ title, protocols }) => {
      const protocolsWTema = protocols.map((protocol) => {
        const findedTemas = tematicos
          .map((tema) => {
            const isIndexFound = tema.indices.some(
              (ind) => ind === protocol.id,
            );
            return isIndexFound ? tema.name.trim() : undefined;
          })
          .filter((name) => Boolean(name));

        const findedOnos = onomasticos
          .map((tema) => {
            const isIndexFound = tema.indices.some(
              (ind) => ind === protocol.id,
            );
            return isIndexFound ? tema.name.trim() : undefined;
          })
          .filter((name) => Boolean(name));

        const findedGeos = geograficos
          .map((tema) => {
            const isIndexFound = tema.indices.some(
              (ind) => ind === protocol.id,
            );
            return isIndexFound ? tema.name.trim() : undefined;
          })
          .filter((name) => Boolean(name));

        return {
          ...protocol,
          tematico: findedTemas,
          onomastico: findedOnos,
          geograficos: findedGeos,
        };
      });

      return {
        title,
        protocols: protocolsWTema,
      };
    },
  );

  const settedInitNFinalYears = protocolsWithIndexes.map((file) => {
    const yrsArr = file.title.replace("Protocolo", "").split(" - ");
    const { initYr, finalYr } =
      yrsArr.length < 2
        ? {
            initYr: yrsArr[0].trim(),
            finalYr: yrsArr[0].trim(),
          }
        : {
            initYr: yrsArr[0].trim(),
            finalYr: yrsArr[1].trim(),
          };

    return {
      ...file,
      startYear: initYr,
      endYear: finalYr,
    };
  });

  const json = JSON.stringify(settedInitNFinalYears, null, 2);
  fs.writeFileSync("./data/xalapa-new/05-ProtocolsWIndexes.json", json);
}

function getFojasAltas() {
  const groupedProtocolsJson = fs.readFileSync(
    basePath + "05-ProtocolsWIndexes.json",
    "utf8",
  );

  // Parsing file getted
  const newXalapa = JSON.parse(groupedProtocolsJson);

  return newXalapa.map((item) => {
    const fojasAltas = item.protocols.reduce((acc, acta) => {
      const identifier = getActaIdentifier(item.startYear, item.endYear);
      const fojaAlta = getFojaAlta(acta.foja);

      // Si la propiedad no existe
      if (!acc.hasOwnProperty(identifier)) {
        return {
          ...acc,
          [identifier]: fojaAlta,
        };
      }

      // Si la propiedad ya existe y la foja actual es mayor a la que ya habia
      if (!isNaN(Number(fojaAlta)) && fojaAlta > acc[identifier]) {
        return {
          ...acc,
          [identifier]: fojaAlta,
        };
      }

      return acc;
    }, {});

    return fojasAltas;
  });
}

const fojasAltas = getFojasAltas();

let parentID = 92;
// Now we have to reformat our data to ica atom field structure.
function excelAtomFormat() {
  const groupedProtocolsJson = fs.readFileSync(
    basePath + "05-ProtocolsWIndexes.json",
    "utf8",
  );

  // Parsing file getted
  const groupedProtocolsObj = JSON.parse(groupedProtocolsJson);
  const formatedProtocolsToAtom = groupedProtocolsObj.map(
    ({ title, protocols, startYear, endYear }) => {
      const identifier = String(parentID + 1).padStart(3, "0");
      const eventDates = getActaIdentifier(startYear, endYear);
      const [extentAndMedium] = fojasAltas
        .map((fojaAlta) => {
          if (fojaAlta.hasOwnProperty(eventDates)) {
            return fojaAlta[eventDates];
          }
        })
        .filter((x) => Boolean(x));

      const parent = {
        legacyId: parentID + 1,
        qubitParentSlug: "protocolos-notariales",
        identifier,
        title,
        levelOfDescription: "Unidad documental compuesta",
        eventDates,
        extentAndMedium,
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

      const formatedProtocols = protocols.map((acta) => {
        return formatActa(acta, parentID+1, startYear, endYear);
      });

      parentID++;

      return [parent, ...formatedProtocols];
    },
  ).flat();

  const json = JSON.stringify(formatedProtocolsToAtom, null, 2);
  fs.writeFileSync("./data/xalapa-new/06-AtomFormated.json", json);
}

excelAtomFormat();

// Misc
/* Obtener numero de acta */
function getActaIdentifier(startYear, endYear) {
  return startYear === endYear || endYear === 0
    ? startYear.toString()
    : `${startYear}-${endYear}`;
}

// Función que regresa la foja mas alta en el string foja
function getFojaAlta(foja) {
  const filter1 = keepNumbers(foja);
  const noSlash = filter1.split("-");
  const onlyNumbers = noSlash.filter(
    (char) => !isNaN(Number(char)) && char !== "",
  );

  const highest = getHighNumber(onlyNumbers);
  if (!highest) {
    return foja;
  }

  return highest;
}

// Funcion usada para limpiar las fojas de las letras y simbolos. Pero manteniendo los guiones y numeros
function keepNumbers(str) {
  return str.replace(/[a-zA-Z\.,_ ]/g, "-");
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

function formatActa(acta, parentId, eventStartDates, eventEndDates) {
  const subjectAccessPoints = acta.tematico.join(" | ").toUpperCase();
  const placeAccessPoints = acta.geograficos.join(" | ").toUpperCase();
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
    descriptionStatus: "Terminado",
    levelOfDetail: "Parcial",
    eventDates: acta.fecha,
    eventTypes: "Creación",
    eventStartDates,
    eventEndDates,
    eventActors: acta.creador,
    culture: "es",
  };
}
