import fs from 'fs';
import natural from 'natural';

const tokenizer = new natural.WordTokenizer('spanish');
const xalapa = JSON.parse(fs.readFileSync('./data/xalapa.json', 'utf8'));

const lessThan100Words = xalapa.filter((acta) => {
	return countWords(acta.alcanceContenido) <= 100;
});

const moreThan100Words = xalapa.filter((acta) => {
	return countWords(acta.alcanceContenido) > 100;
});

console.log(xalapa.length);
console.log(lessThan100Words.length);

(async () => {
	let cont = 0;
	let finishedData = [];
	const clearedData = removeBlackListData(moreThan100Words);
	console.log('Sin blacklist');
	console.log(clearedData.length);

	fetchAllData(clearedData, cont, finishedData);
})();

async function fetchAllData(arr, cont, finishedData) {
	const prompt = "Necesito un titulo para el siguiente texto, ignora precios y años: ";
	for (let acta of arr) {
		try {
			const time = generateRandomTime();
			await sleep(time);

			console.log('Vuelta: ' + cont);
			const response = await getChatResponse(prompt + acta.alcanceContenido);
			finishedData.push({
				acta: {
					codigoRef: acta.codigoRef,
					alcanceContenido: acta.alcanceContenido,
				},
				gpt: response,
			});

			cont++;
		} catch (e) {
			console.log(e);
			console.log('--------Reintentando de nuevo--------');

			// Guardando nueva información en la blacklist
			const blacklist = getBlackList();
			const allFinishedData = [...blacklist, ...finishedData];
			saveBlackList(allFinishedData);

			// eliminando del array actual los items en la blacklist
			const blacklistRemoved = removeBlackListData(arr);
			console.log('Nuevo tamaño del array faltante');
			console.log(blacklistRemoved.length);
			return fetchAllData(blacklistRemoved, cont, []);
		}
	}

	// Guardando nueva información en la blacklist
	const blacklist = getBlackList();
	const allFinishedData = [...blacklist, ...finishedData];
	saveBlackList(allFinishedData);
	return;
}

function saveBlackList(arr) {
	// Convirtiendo las actas a un json
	const formated = JSON.stringify(arr, null, 2);
	fs.writeFileSync('./data/gptest/blacklist.json', formated);
}

// Se remueven los de la lista negra
function removeBlackListData(arr) {
	const blacklist = getBlackList();
	return arr.filter((item) => {
		for (let data of blacklist) {
			if (data.acta.codigoRef === item.codigoRef) {
				return false;
			}
		}

		return true;
	});
}

/* Misc */
// Generate fetchData time
function generateRandomTime() {
  return Math.floor(Math.random() * 3001) + 2000;
}

function getBlackList() {
	const blacklist = JSON.parse(fs.readFileSync('./data/gptest/blacklist.json', 'utf8'));
	console.log('blacklist');
	console.log(blacklist.length);
	return blacklist;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function countWords(text) {
    const tokens = tokenizer.tokenize(text);
    return tokens.length;
}

async function getChatResponse(prompt) {
	const url = "https://api.openai.com/v1/chat/completions";
	const apiKey = "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";

	return fetch(url, {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  Authorization: `Bearer ${apiKey}`,
	},
	body: JSON.stringify({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "user", 
				content: prompt,
			}
		],
	  	max_tokens: 100,
	  	temperature: 0.7,
	  	n: 1,
	}),
	})
    .then((response) => response.json())
    .then((data) => {
      return {
      	created: data.created,
      	usage: data.usage,
      	choices: data.choices[0].message.content
      };
    });
}
