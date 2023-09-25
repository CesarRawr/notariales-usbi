/*
  There are several indexes duplicated. 
  This script try to normalize those indexes and remove identical items.
*/
import fs from "node:fs";
import { distance, closest } from "fastest-levenshtein";

const cordobaFiles = JSON.parse(
  fs.readFileSync("./data/cordoba/finalC.json", "utf8"),
);
const orizabaFiles = JSON.parse(
  fs.readFileSync("./data/orizaba/finalO.json", "utf8"),
);
const xalapaFiles = JSON.parse(
  fs.readFileSync("./data/xalapa/finalX.json", "utf8"),
);

function formatXalapaIndexes() {
  const xalapaTematicos = getIndexStrings(xalapaFiles, "subjectAccessPoints");
  const xalapaGeograficos = getIndexStrings(xalapaFiles, "placeAccessPoints");
  const xalapaOnomasticos = getIndexStrings(xalapaFiles, "nameAccessPoints");

  
  fs.writeFileSync("testOnomasticos.txt", JSON.stringify(xalapaOnomasticos, null, 2));
}

function formatOrizabaIndexes() {
  const orizabaTematicos = getIndexStrings(orizabaFiles, "subjectAccessPoints");
  const orizabaGeograficos = getIndexStrings(orizabaFiles, "placeAccessPoints");
  const orizabaOnomasticos = getIndexStrings(orizabaFiles, "nameAccessPoints");

  
  fs.writeFileSync("testOnomasticos.txt", JSON.stringify(orizabaOnomasticos, null, 2));
  fs.writeFileSync("testGeograficos.txt", JSON.stringify(orizabaGeograficos, null, 2));
  fs.writeFileSync("testTematicos.txt", JSON.stringify(orizabaTematicos, null, 2));
}

function formatCordobaIndexes() {
  const cordobaTematicos = getIndexStrings(cordobaFiles, "subjectAccessPoints");
  const cordobaGeograficos = getIndexStrings(cordobaFiles, "placeAccessPoints");
  const cordobaOnomasticos = getIndexStrings(cordobaFiles, "nameAccessPoints");

  
  fs.writeFileSync("testOnomasticos.txt", JSON.stringify(cordobaOnomasticos, null, 2));
  fs.writeFileSync("testGeograficos.txt", JSON.stringify(cordobaGeograficos, null, 2));
  fs.writeFileSync("testTematicos.txt", JSON.stringify(cordobaTematicos, null, 2));
}

formatCordobaIndexes();

// Misc
function getIndexStrings(files, attName) {
  const tematicos = files.map((file) => {
    return file[attName].split(" | ");
  });

  const flatedTemaIndexes = tematicos
    .flat()
    .filter((str) => Boolean(str.length));

  const removedDuplicated = [...new Set(flatedTemaIndexes)];
  removedDuplicated.sort();
  return removedDuplicated;
}
