// script to find duplicated protocols in xalapa
import fs from "node:fs";
import levenshtein from "fastest-levenshtein";

const xalapaProtocolsUpdated = JSON.parse(
	fs.readFileSync(`./data/xalapa/xalapaBothID.fixed.json`, "utf8"),
);

xalapaProtocolsUpdated.forEach((protocol, index, array) => {
	array[index].status = "reviewed";
	const similarContent = array
		.map((item, subindex) => {
			if (
				!item.hasOwnProperty("status") &&
				getSimilarPCString(
					protocol.scopeAndContent,
					item.scopeAndContent,
				) > 90
			) {
				return {
					id: item.identifier,
					index: subindex,
				};
			}

			return undefined;
		})
		.filter((x) => x !== undefined);

	if (similarContent.length === 0) return;

	similarContent.forEach((indexes) => {
		array[indexes.index].status = "reviewed";
	});

	const duplicateds = similarContent.map((indexes) => indexes.id);
	const finalDictionary = {
		original: protocol.identifier,
		duplicateds,
	};

	const duplicatedList = read();
	const addedNewEntry = [...duplicatedList, finalDictionary];
	write(addedNewEntry);
});

/////////////
// MISC
////////////

function getSimilarPCString(cadena1, cadena2) {
	const distanciaLevenshtein = levenshtein.distance(cadena1, cadena2);
	const longitudMaxima = Math.max(cadena1.length, cadena2.length);
	const similitud = 1 - distanciaLevenshtein / longitudMaxima;
	return similitud * 100; // Convertir a porcentaje
}

function read() {
	return JSON.parse(
		fs.readFileSync("./data/xalapa/xalapaDuplicados.json", "utf8"),
	);
}

function write(newData) {
	const dataCreatedJSON = JSON.stringify(newData, null, 2);
	fs.writeFileSync(
		"./data/xalapa/xalapaDuplicados.json",
		dataCreatedJSON,
	);
}
