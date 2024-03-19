import fs from "node:fs";

const groupedProtocolsFixed = JSON.parse(
	fs.readFileSync(`./fixed.test.json`, "utf8"),
);

const xalapaWithOldIds = JSON.parse(
	fs.readFileSync(`./data/.old/preUploadXalapa.json`, "utf8"),
);

const protocolsflatted = Object.values(groupedProtocolsFixed).flat();

// Part 1 from the script
function gettingIndexDictionary() {
	// Adding old identifiers
	const protocolsIndexDictionary = protocolsflatted.map((protocolFixed) => {
		const protocolWithOldID = xalapaWithOldIds.filter((oldProtocol) => {
			return (
				protocolFixed.eventDates === oldProtocol.eventDates &&
				protocolFixed.subjectAccessPoints ===
					oldProtocol.subjectAccessPoints &&
				protocolFixed.placeAccessPoints ===
					oldProtocol.placeAccessPoints &&
				protocolFixed.nameAccessPoints === oldProtocol.nameAccessPoints
			);
		});

		// finding duplicateds and empty similars
		if (protocolWithOldID.length === 0 || protocolWithOldID.length > 1) {
			const duplicatedWith = protocolWithOldID.map((copy) => {
				return copy.identifier;
			});

			return {
				type: "anormal",
				id: protocolFixed.identifier,
				similars: duplicatedWith,
			};
		}

		return {
			type: "normal",
			newID: protocolFixed.identifier,
			oldID: protocolWithOldID[0].identifier,
		};
	});

	// Separating duplicateds from no duplicateds
	const [indexes, duplicateds] = protocolsIndexDictionary.reduce(
		(acc, protocolIndex) => {
			if (protocolIndex.type === "anormal") {
				return [acc[0], [...acc[1], protocolIndex]];
			}

			return [[...acc[0], protocolIndex], acc[1]];
		},
		[[], []],
	);

	// ordering and grouping duplicateds
	const groupedDuplicateds = duplicateds.reduce((accumulated, duplicated) => {
		// Empty means, that its not found in the original protocols list.
		const id =
			duplicated.similars.join(" - ") === ""
				? "empty"
				: duplicated.similars.join(" - ");

		if (accumulated.hasOwnProperty(id)) {
			return {
				...accumulated,
				[id]: [...accumulated[id], duplicated.id],
			};
		}

		return {
			...accumulated,
			[id]: [duplicated.id],
		};
	}, {});

	const duplicatedIndexesGrouped = Object.entries(groupedDuplicateds).map(
		([key, value]) => {
			const originalIdentifiers = key.split(" - ");

			return {
				originalIdentifiers,
				newIdentifiers: value,
			};
		},
	);

	const indexedIdentifiersJSON = JSON.stringify(indexes, null, 2);
	fs.writeFileSync(
		"./data/xalapa/indexedProtocolIds.json",
		indexedIdentifiersJSON,
	);

	const duplicatedsIdentifiersJSON = JSON.stringify(
		duplicatedIndexesGrouped,
		null,
		2,
	);

	fs.writeFileSync(
		"./data/xalapa/indexedDuplicatedProtocolIds.json",
		duplicatedsIdentifiersJSON,
	);
}

const indexEquivalences = JSON.parse(
	fs.readFileSync(`./data/xalapa/indexedProtocolIds.json`, "utf8"),
);

const indexEquivalencesForDuplicated = JSON.parse(
	fs.readFileSync(`./data/xalapa/indexedDuplicatedProtocolIds.json`, "utf8"),
);

// Part 2 from the script
function indexingNewProtocolsWithOldIds() {
	const protocolsWithOldID = protocolsflatted.map((protocol) => {
		// search ids on dictionaries
		const searched = searchOldID(protocol.identifier);

		if (!Boolean(searched)) {
			return protocol;
		}

		// chaanging notes adding old id
		const generalNote =
			protocol.generalNote.length > 0
				? `${protocol.generalNote} | ${searched}`
				: searched;

		// changing dates to add the event actor
		const eventDates = `${protocol.eventDates} | ${protocol.eventActors}`;
		// adding creación to the new event date added
		const eventTypes = `${protocol.eventTypes} | ${protocol.eventTypes}`;

		return {
			...protocol,
			generalNote,
			eventDates,
			eventTypes,
			eventActors: "",
		}
	});

	
	const protocolsWithOldIDJSON = JSON.stringify(
		protocolsWithOldID,
		null,
		2,
	);
	fs.writeFileSync(
		"./data/xalapa/xalapaBothID.fixed.json",
		protocolsWithOldIDJSON,
	);
}

// Misc

// function to search the new id in the id dictionaries
function searchOldID(newID) {
	const searchInEquivalences = indexEquivalences.find(
		(equivalence) => equivalence.newID === newID,
	);

	if (Boolean(searchInEquivalences)) {
		return searchInEquivalences.oldID;
	}

	const searchInDuplicateds = indexEquivalencesForDuplicated
		.map((duplicateds) => {
			const oldIDIndex = duplicateds["newIdentifiers"]
				.map((newIDDuplicated, index) => {
					if (newIDDuplicated === newID) {
						return index;
					}

					return undefined;
				})
				.filter((x) => x !== undefined);

			return oldIDIndex.length > 0
				? duplicateds["originalIdentifiers"][oldIDIndex[0]]
				: undefined;
		})
		.filter((x) => Boolean(x));

	return searchInDuplicateds[0];
}
