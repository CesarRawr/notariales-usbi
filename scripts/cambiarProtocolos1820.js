import fs from 'fs';

const corrected = JSON.parse(fs.readFileSync('./data/finalData.json', 'utf8'));
const look1820 = corrected.map((item) => {
	return item.inicioAnio === 1820 && item.finAnio != 1821 ? item: undefined;
}).filter((x) => !!x);

console.log(look1820);
