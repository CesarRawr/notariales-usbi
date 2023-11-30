import fs from "node:fs";

function fixCordobaActas() {
	const cordobaProtocols = JSON.parse(
		fs.readFileSync(`./data/cordoba/finalC.json`, "utf8"),
	);

	const fixedOrizabaActas = upperCaseActas(cordobaProtocols);
	saveActas(fixedOrizabaActas, "./data/cordoba/finacC.fixed.json");
}

fixCordobaActas();

function fixNewXalapa() {
	const volumeNumber = 3;
	const newXalapaJson = JSON.parse(
		fs.readFileSync(
			`./data/xalapa-new/vol-${volumeNumber}/06-AtomFormated.json`,
			"utf8",
		),
	);
	let actualID = 20607;
	const newXalapaIDS = addingNewID(newXalapaJson);
	const fixedActas = upperCaseActas(newXalapaIDS);

	saveActas(
		fixedActas,
		`./data/xalapa-new/vol-${volumeNumber}/07-final-${volumeNumber}.json`,
	);
}

/*setting updated ids to new xalapa*/
function addingNewID(protocols) {
	return protocols.map((protocol) => {
		if (!Boolean(protocol.parentId)) {
			return protocol;
		}

		const newID = `PX-${String(protocol.parentId).padStart(
			3,
			"0",
		)}-${String(actualID).padStart(5, "0")}`;
		actualID++;

		return {
			...protocol,
			identifier: newID,
		};
	});
}

/* Splitting event actors and then uppercasing it */
function upperCaseActas(protocols) {
	return protocols.map((protocol) => {
		if (!Boolean(protocol.parentId)) {
			return {
				...protocol,
				eventActors: "",
				actorOccupations: "",
				actorOccupationNotes: "",
			};
		}

		const uppercasedEventActor = protocol.eventActors.toUpperCase();
		const splittedActor = uppercasedEventActor
			.split(",")
			.map((str) => str.trim());

		if (
			splittedActor.length > 3 ||
			(splittedActor.length < 2 && splittedActor[0].length !== 0)
		) {
			console.log(protocol.identifier);
			console.log(splittedActor);
		}

		if (splittedActor.length > 2) {
			return {
				...protocol,
				eventActors: splittedActor[0],
				actorOccupations: splittedActor[1],
				actorOccupationNotes: splittedActor[2],
			};
		}

		if (splittedActor.length === 2) {
			return {
				...protocol,
				eventActors: splittedActor[0],
				actorOccupations: splittedActor[1],
				actorOccupationNotes: "",
			};
		}

		return {
			...protocol,
			eventActors: splittedActor[0],
			actorOccupations: "",
			actorOccupationNotes: "",
		};
	});
}

function saveActas(protocols, path) {
	const jsonStringProtocols = JSON.stringify(protocols, null, 2);
	fs.writeFileSync(path, jsonStringProtocols);
}
