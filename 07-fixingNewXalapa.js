import fs from "node:fs";

const volumeNumber = 1;
const newXalapaJson = JSON.parse(
	fs.readFileSync(
		`./data/xalapa-new/vol-${volumeNumber}/06-AtomFormated.json`,
		"utf8",
	),
);

/*setting updated ids to new xalapa*/
let actualID = 20607;
const newXalapaFixedID = newXalapaJson.map((protocol) => {
	if (!Boolean(protocol.parentId)) {
		return protocol;
	}

	const newID = `PX-${String(protocol.parentId).padStart(3, "0")}-${String(
		actualID,
	).padStart(5, "0")}`;
	actualID++;

	return {
		...protocol,
		identifier: newID,
	}
});

/* Splitting event actors and then uppercasing it */
const newXalapaActorsFixed = newXalapaFixedID.map((protocol) => {
	if (!Boolean(protocol.parentId)) {
		return protocol;
	}

	const uppercasedEventActor = protocol.eventActors.toUpperCase();
	const splittedActor = uppercasedEventActor.split(",");

	if (splittedActor.length > 2 || splittedActor.length < 2) {
		console.log(splittedActor);
		return {
			...protocol,
			eventActors: uppercasedEventActor,
		}
	}

	return {
		...protocol,
		eventActors: splittedActor[0],
	}
});


