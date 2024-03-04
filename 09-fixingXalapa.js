import fs from "node:fs";

const xalapaOldJson = JSON.parse(
	fs.readFileSync(`./data/xalapa/finalX.fixed.json`, "utf8"),
);

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
			[xalapaProtocol.legacyId]: [
				xalapaProtocol,
			],
		};
	}

	// instert protocol on its group if its not parent
	return {
		...acc,
		[xalapaProtocol.parentId]: [
			...acc[xalapaProtocol.parentId],
			xalapaProtocol
		],
	}
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
	}
});

// Adding fixed protocols to its respective father
const groupedProtocolsMerged = {
	...xalapaGrouped,
	"9": [
		...xalapaGrouped["9"],
		...fixedProtocols,
	]
};

console.log(groupedProtocolsMerged["9"]);

// Misc
function getFoja(fixMetaData) {
	if (!fixMetaData.hasOwnProperty("folio2")) {
		return `${fixMetaData.folio1}`;
	}

	return `${fixMetaData.folio1} - ${fixMetaData.folio2}`;
}
