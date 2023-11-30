import fs from "node:fs";

const xalapaJson = JSON.parse(
	fs.readFileSync(
		`./data/xalapa/finalX.json`,
		"utf8",
	),
);

function fixingProtocolLinks() {
	const oldXalapaFixed = xalapaJson.map((acta) => {
		if (acta.digitalObjectPath.length > 0) {
			const splitedPath = acta.digitalObjectPath.split("/");
			const oldID = splitedPath[splitedPath.length-1].split(".")[0];
			const newLink = `/home/usbi/digital-objects/pdfs/${acta.identifier}.pdf`;
			
			renamePdfs(oldID, acta.identifier);
			return {
				...acta,
				digitalObjectPath: newLink,
			}
		}

		return acta;
	});

	const fixedXalapaJSON = JSON.stringify(oldXalapaFixed);
	fs.writeFileSync("./data/xalapa/finalX.fixed.json", fixedXalapaJSON);
}

/* Misc */
function renamePdfs(oldID, newID) {
	fs.renameSync(`./pdfs/${oldID}.pdf`, `./pdfs/${newID}.pdf`);
}

