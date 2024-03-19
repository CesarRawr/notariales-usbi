import fs from "node:fs";
import levenshtein from "fastest-levenshtein";

const xalapaOldJson = JSON.parse(
	fs.readFileSync(`./data/xalapa/finalX.fixed.json`, "utf8"),
);

// The real order of the protocols
const xalapaFixJson = JSON.parse(
	fs.readFileSync(`./data/xalapa/xalapa-fix.json`, "utf8"),
);

console.log(xalapaOldJson.length);
console.log(xalapaFixJson.length);

// removed wrong protocols
const removedWrongProtocols = xalapaOldJson.filter(
	(xalapaProtocol) =>
		!xalapaFixJson.some((toFix) => toFix.id === xalapaProtocol.identifier),
);

/* Grouping xalapa protocols */
const xalapaGrouped = removedWrongProtocols.reduce((acc, xalapaProtocol) => {
	// if the parent doesnt exist, create it
	if (
		xalapaProtocol.legacyId !== "" &&
		!acc.hasOwnProperty(xalapaProtocol.title)
	) {
		return {
			...acc,
			[xalapaProtocol.legacyId]: [xalapaProtocol],
		};
	}

	// instert protocol on its group if its not parent
	return {
		...acc,
		[xalapaProtocol.parentId]: [
			...acc[xalapaProtocol.parentId],
			xalapaProtocol,
		],
	};
}, {});

// fixing xalapa protocols, replacing wrong data
const fixedProtocols = xalapaFixJson.map((fixMetaData) => {
	const protocolToFix = xalapaOldJson.find(
		(xalapaProtocol) => fixMetaData.id === xalapaProtocol.identifier,
	);

	const extentAndMedium = getFoja(fixMetaData);
	return {
		...protocolToFix,
		parentId: 9,
		eventStartDates: fixMetaData.inicio,
		eventEndDates: fixMetaData.fin,
		eventDates: fixMetaData.fecha,
		extentAndMedium,
	};
});

// Adding fixed protocols to its respective father
const groupedProtocolsMerged = {
	...xalapaGrouped,
	9: [...xalapaGrouped["9"], ...fixedProtocols],
};

// Ordering fixed protocols by foja
const sortedFixedProtocols1663 = groupedProtocolsMerged[9].sort(
	function (actualProtocol, nextProtocol) {
		return (
			getLastFoja(actualProtocol.extentAndMedium) -
			getLastFoja(nextProtocol.extentAndMedium)
		);
	},
);

const groupedProtocolsFixed = {
	...xalapaGrouped,
	9: [...sortedFixedProtocols1663],
};

save(groupedProtocolsFixed);

//////////
// Misc //
//////////
function save(toSave) {
	const fixedXalapaJSON = JSON.stringify(toSave, null, 2);
	fs.writeFileSync("./fixed.test.json", fixedXalapaJSON);
}

// get right foja from protocols
function getFoja(fixMetaData) {
	if (!fixMetaData.hasOwnProperty("folio2")) {
		return `${fixMetaData.folio1}`;
	}

	return `${fixMetaData.folio1} - ${fixMetaData.folio2}`;
}

// Parse date from format dd/mm/yyyy to Date object
function getLastFoja(foja) {
	const fojas = foja.split(" - ").map(keepNumbers);
	return fojas.length > 1 ? fojas[1] : fojas[0];
}

// Funcion usada para limpiar las fojas de las letras y simbolos. Pero manteniendo los guiones y numeros
function keepNumbers(str) {
	return Number(str.replace(/[a-zA-Z\.,_ ]/g, ""));
}
