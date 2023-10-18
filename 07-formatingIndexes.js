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

  return {
    tematicos: xalapaTematicos,
    geograficos: xalapaGeograficos,
    onomasticos: xalapaOnomasticos,
  };
}

function formatOrizabaIndexes() {
  const orizabaTematicos = getIndexStrings(orizabaFiles, "subjectAccessPoints");
  const orizabaGeograficos = getIndexStrings(orizabaFiles, "placeAccessPoints");
  const orizabaOnomasticos = getIndexStrings(orizabaFiles, "nameAccessPoints");

  return {
    tematicos: orizabaTematicos,
    geograficos: orizabaGeograficos,
    onomasticos: orizabaOnomasticos,
  };
}

function formatCordobaIndexes() {
  const cordobaTematicos = getIndexStrings(cordobaFiles, "subjectAccessPoints");
  const cordobaGeograficos = getIndexStrings(cordobaFiles, "placeAccessPoints");
  const cordobaOnomasticos = getIndexStrings(cordobaFiles, "nameAccessPoints");

  return {
    tematicos: cordobaTematicos,
    geograficos: cordobaGeograficos,
    onomasticos: cordobaOnomasticos,
  };
}

function countProcotolIndexes() {
  const xalapaIndexes = formatXalapaIndexes();
  const orizabaIndexes = formatOrizabaIndexes();
  const cordobaIndexes = formatCordobaIndexes();

  const geograficos = removedDuplicatedStrings([
    ...xalapaIndexes.geograficos,
    ...orizabaIndexes.geograficos,
    ...cordobaIndexes.geograficos,
  ]);

  const tematicos = removedDuplicatedStrings([
    ...xalapaIndexes.tematicos,
    ...orizabaIndexes.tematicos,
    ...cordobaIndexes.tematicos,
  ]);

  const onomasticos = removedDuplicatedStrings([
    ...xalapaIndexes.onomasticos,
    ...orizabaIndexes.onomasticos,
    ...cordobaIndexes.onomasticos,
  ]);

  const nearStrings = tematicos.map((str, index, arr) => {
    const restOfStrings = arr.slice(index + 1, arr.length);
    const matches = restOfStrings.filter((nextStr) => {
      const matchMeter = distance(str, nextStr);
      return matchMeter > 0 && matchMeter < 3;
    });

    return matches.length > 0
      ? {
          word: str,
          matches,
        }
      : undefined;
  }).filter(x => Boolean(x));

  console.log(nearStrings);
}

countProcotolIndexes();

// Misc
function getIndexStrings(files, attName) {
  const tematicos = files.map((file) => {
    return file[attName].split(" | ");
  });

  const flatedTemaIndexes = tematicos
    .flat()
    .filter((str) => Boolean(str.length));

  const removedDuplicated = removedDuplicatedStrings(flatedTemaIndexes);
  return removedDuplicated;
}

function removedDuplicatedStrings(strArr) {
  return [...new Set(strArr)].sort();
}
