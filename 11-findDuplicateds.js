// script to find duplicated protocols in xalapa
import fs from "node:fs";
import levenshtein from "fastest-levenshtein";

const xalapaProtocolsUpdated = JSON.parse(
	fs.readFileSync(`./data/xalapa/xalapaBothID.fixed.json`, "utf8"),
);

function creatingDictionary(argument) {
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

		const duplicatedList = read("./data/xalapa/xalapaDuplicados.json");
		const addedNewEntry = [...duplicatedList, finalDictionary];
		write(addedNewEntry, "./data/xalapa/xalapaDuplicados.json");
	});
}

// Add content to dictionary, its better to compare
function addingContent() {
	const dictionary = read("./data/xalapa/xalapaDuplicados.json");
	const protocolsXalapa = read("./data/xalapa/xalapaBothID.fixed.json");

	const dictionaryWithMetaData = dictionary.map((entry) => {
		const protocolOriginal = protocolsXalapa.find((protocolXalapa) => {
			return protocolXalapa.identifier === entry.original;
		});

		const duplicatedProtocols = entry.duplicateds.map((duplicatedID) => {
			const duplicatedProtocol = protocolsXalapa.find(
				(protocolXalapa) => {
					return protocolXalapa.identifier === duplicatedID;
				},
			);

			const oldIDArray = duplicatedProtocol.generalNote.split(" | ");
			const oldID = oldIDArray.length > 1 ? oldIDArray[1] : oldIDArray[0];

			return {
				id: duplicatedID,
				oldID,
				foja: duplicatedProtocol.extentAndMedium,
				fecha: duplicatedProtocol.eventDates,
				content: duplicatedProtocol.scopeAndContent,
			};
		});

		const oldIDArray = protocolOriginal.generalNote.split(" | ");
		const oldID = oldIDArray.length > 1 ? oldIDArray[1] : oldIDArray[0];
		return {
			original: {
				id: protocolOriginal.identifier,
				oldID,
				foja: protocolOriginal.extentAndMedium,
				fecha: protocolOriginal.eventDates,
				content: protocolOriginal.scopeAndContent,
			},
			duplicated: duplicatedProtocols,
		};
	});

	write(
		dictionaryWithMetaData,
		"./data/xalapa/xalapaDuplicadosMetaData.json",
	);
}

function addingObservations() {
	const duplicateds = read("./data/xalapa/xalapaDuplicadosMetaData.json");
	const protocolsXalapa = read("./data/xalapa/xalapaBothID.fixed.json");

	const metadataAdded = duplicateds.map((entry) => {
		const { original, duplicated } = entry;
		const newOriginal =
			JSON.stringify(original) === "{}"
				? original
				: searchActa(original);

		const newDuplicated = duplicated.map((metaData) => {
			const newData =
				JSON.stringify(metaData) === "{}"
					? metaData
					: searchActa(metaData);

			return newData;
		});

		return {
			original: newOriginal,
			duplicated: newDuplicated
		}
	});

	write(metadataAdded, "./data/xalapa/xalapaDuplicadosMetaData.json")

	function searchActa(data) {
		const searchedActa = protocolsXalapa.find((acta) => {
			return acta.identifier === data.id;
		});

		return {
			...data,
			observaciones: searchedActa.generalNote,
			pdf: searchedActa.digitalObjectPath,
		};
	}
}

addingObservations();

/////////////
// MISC
////////////

function getSimilarPCString(cadena1, cadena2) {
	const distanciaLevenshtein = levenshtein.distance(cadena1, cadena2);
	const longitudMaxima = Math.max(cadena1.length, cadena2.length);
	const similitud = 1 - distanciaLevenshtein / longitudMaxima;
	return similitud * 100; // Convertir a porcentaje
}

function read(path) {
	return JSON.parse(fs.readFileSync(path, "utf8"));
}

function write(newData, path) {
	const dataCreatedJSON = JSON.stringify(newData, null, 2);
	fs.writeFileSync(path, dataCreatedJSON);
}
