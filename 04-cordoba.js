import fs from "node:fs";

const basePath = "./data/cordoba_18/II";
const actasJson = fs.readFileSync(`${basePath}/objects.json`, "utf8");

const onoJson = fs.readFileSync(`${basePath}/ono.json`, "utf8");
const geoJson = fs.readFileSync(`${basePath}/geo.json`, "utf8");
const temJson = fs.readFileSync(`${basePath}/tem.json`, "utf8");

const actas = JSON.parse(actasJson);

const ono = clearIndexes(JSON.parse(onoJson));
const geo = clearIndexes(JSON.parse(geoJson));
const tem = clearIndexes(JSON.parse(temJson));

let idCounter = 0;
const fusion = Object.entries(actas).map(([key, value]) => {
  idCounter++;
  // Generar nuevo id con el numero original
  const newParentID = (idCounter).toString().padStart(3, '0');
  const newKey = `${newParentID} * ${key}`;

  // Generar nuevas actas
  const newActas = value.map((acta) => {
    // Generar id con mas ceros para el identificador nuevo
    const newActaID = (Number(acta.id)).toString().padStart(5, '0');
    
    // Obtener indices del acta
    const actaOnomastico = searchInIndexed(ono, acta.id).map((x) => x.A);
    const actaTematico = searchInIndexed(tem, acta.id).map((x) => x.A);
    const actaGeografico = searchInIndexed(geo, acta.id).map((x) => x.A);

    return {
      ...acta,
      id: `PC_${newParentID}_${newActaID}`,
      onomastico: actaOnomastico,
      tematico: actaTematico,
      geografico: actaGeografico,
    };
  });

  return {
    [newKey]: newActas,
  }
});

const dataString = JSON.stringify(fusion, null, 2);
console.log(dataString)
fs.writeFileSync(`${basePath}/final.json`, dataString);

///////////////////////
// Utils
//////////////////////
function clearIndexes(indexes) {
  return indexes.map((item) => {
    const newB = String(item["B"]).split(",").map((i) => i.trim());
    return {
      ...item,
      B: newB,
    }
  });
}

// Buscando en los indices por id de acta
function searchInIndexed(indexes, actaID) {
  return indexes.map((item) => {
    const finded = item["B"].find((i) => i === actaID);
    return {
      ...item,
      B: finded,
    };
  }).filter((i) => !!i.B);
}
