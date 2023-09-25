import fs from 'fs';
const actas = JSON.parse(fs.readFileSync('./data/preUploadXalapaErrors.json', 'utf8'));

const newActas = actas.map((acta) => {
	return {
		...acta,
		title: "",
		descriptionStatus: "",
		levelOfDetail: "",
	}
});

const correctedExtentAndMedium = newActas.map((acta) => {
	const extentAndMedium = String(acta.extentAndMedium).split("-").map((foja) => foja.trim()).join(" - ");
	return {
		...acta,
		extentAndMedium,
	}
});

// Convirtiendo las actas a un json
const formated = JSON.stringify(correctedExtentAndMedium, null, 2);
fs.writeFileSync('./data/preUploadXalapa.json', formated);
