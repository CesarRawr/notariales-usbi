import fs from "fs";
import {clearStopWords, removeDuplicated} from "./app.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const Nodehun = require('nodehun');
const affix = fs.readFileSync('./dictionary/Spanish.aff');
const dictionary = fs.readFileSync('./dictionary/Spanish.dic');
const nodehun = new Nodehun(affix, dictionary);

const actas = JSON.parse(fs.readFileSync('./data/preUploadXalapa.json', 'utf8'));
(async () => {
	const sanitizedWords = actas.map((acta) => {
		const title = removeSpecialCharsAndNumbers(acta.title).split(" ");
		const content = removeSpecialCharsAndNumbers(acta.scopeAndContent).split(" ");
		const allWords = [...title, ...content];

		const capitalizedRemoved = allWords.filter((word) => !isCapitalized(word));
		const clearedData = clearStopWords(capitalizedRemoved).filter((word) => !!word.length);

		return clearedData;
	});

	const duplicatedRemoved = removeDuplicated(sanitizedWords.flat());
	const checkedWords = duplicatedRemoved.filter((word) => {
		return !nodehun.spellSync(word);
	});

	const formated = JSON.stringify(checkedWords, null, 2);
	fs.writeFileSync('./dictionary/misspellings.json', formated);
})();

function removeSpecialCharsAndNumbers(string) {
	return string.replace(/[^a-zA-ZáéíóúüÁÉÍÓÚÜñÑ ]/g, "");
}

function isCapitalized(word) {
  return word.charAt(0) === word.charAt(0).toUpperCase();
}
