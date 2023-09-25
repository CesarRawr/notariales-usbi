import fs from "node:fs";

const one = JSON.parse(fs.readFileSync("./data/cordoba/cordoba_17/final.json"));
const two = JSON.parse(
  fs.readFileSync("./data/cordoba/cordoba_18/I/final.json")
);
const three = JSON.parse(
  fs.readFileSync("./data/cordoba/cordoba_18/II/final.json")
);
const four = JSON.parse(
  fs.readFileSync("./data/cordoba/cordoba_18/III/final.json")
);

const all = [...one, ...two, ...three, ...four];

// Obtener las divisiones de las actas a partir de donde se vayan a repartir
const [before, willChange, after] = all.reduce(
  (acc, curr) => {
    const [key, value] = Object.entries(curr).flat();
    const keyID = parseInt(key.split("*")[0]);
    if (keyID < 42) {
      return [[...acc[0], curr], acc[1], acc[2]];
    }

    if (keyID === 42) {
      return [acc[0], [...acc[1], curr], acc[2]];
    }

    return [acc[0], acc[1], [...acc[2], curr]];
  },
  [[], [], []]
);

// Dividir las actas a renombrar de las que no
const divided = willChange
  .map((item) => {
    const [key, values] = Object.entries(item).flat();
    const [old42, new43] = values.reduce(
      (acc, curr) => {
        const idNumber = parseInt(curr.id.split("_")[2]);
        if (idNumber < 1115) {
          return [[...acc[0], curr], acc[1]];
        }

        return [acc[0], [...acc[1], curr]];
      },
      [[], []]
    );

    return [
      {
        [key]: old42,
      },
      {
        "043 * Protocolo 1707 Tomo II": new43,
      },
    ];
  })
  .flat();

// Cambiar los ids de las actas numero 43 porque dicen 42
const [original42, renamed43] = divided.map((acta) => {
  if (Object.keys(acta)[0] === "042 * Protocolo 1707") return acta;
  const [key, values] = Object.entries(acta).flat();
  const new43Values = values.map((item) => {
    const id = item.id.split("_")[2];
    return {
      ...item,
      id: `PC_043_${id}`,
    };
  });

  return {
    [key]: new43Values,
  };
});

// Actualizar los ids de las actas
const renamedActas = after.map((acta) => {
  const [key, actas] = Object.entries(acta).flat();
  const [id, name] = key.split(" * ");
  const numberID = parseInt(id);
  const newID = (numberID + 1).toString().padStart(3, "0");
  // Cambiar ids de todas las actas
  const newActas = actas.map((item) => {
    const uniqueID = item.id.split("_")[2];
    return {
      ...item,
      id: `PC_${newID}_${uniqueID}`,
    };
  });

  const actasName = newID + " * " + name;
  return {
    [actasName]: newActas,
  };
});

// Concatenación de las actas
const remasteredActas = [...before, original42, renamed43, ...renamedActas];

// Normalizar los ids de las actas. Porque se repiten en el siglo 17 y 18.
let idCounter = 1;
const semifinal = remasteredActas.map((item) => {
  const [key, actas] = Object.entries(item).flat();
  const keyID = key.split(" * ")[0];
  const newActasIDs = actas.map((acta) => {
    const newID = idCounter.toString().padStart(5, "0");
    idCounter++;

    return {
      ...acta,
      id: `PC_${keyID}_${newID}`,
    };
  });

  return {
    [key]: newActasIDs,
  };
});

// Agregar año de inicio y año de fin
const semifinalC = semifinal.map((actas) => {
  const [key, values] = Object.entries(actas).flat();
  const years = key.split("Protocolo ")[1];
  const splitedYears = years.includes("–")
    ? years.split("–")
    : years.includes(",")
    ? years.split(",")
    : years.split(" Tomo II").filter((year) => year !== "");
  const formatedYears = splitedYears.map((year) => parseInt(year.trim()));

  const inicioAnio = formatedYears[0];
  const finAnio = formatedYears[formatedYears.length-1];
  const newValues = values.map(item => {
    return {
      ...item,
      inicioAnio,
      finAnio,
    }
  });

  const [id, nombre] = key.split(" * ");
  return {
    id,
    nombre,
    inicioAnio,
    finAnio,
    actas: newValues,
  }
});

const jsonData = JSON.stringify(semifinalC, null, 2);
fs.writeFileSync("./data/cordoba/semifinal.json", jsonData);
