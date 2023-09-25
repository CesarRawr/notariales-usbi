const PDFDocument = require('pdfkit');
const sizeOf = require('image-size');
const fs = require('fs');
let total = 0;

const getImageSize = (path) => {
	const dimensions = sizeOf(`./images/${path}`);
	console.log(dimensions.width, dimensions.height);
}

const actas = JSON.parse(fs.readFileSync('./data/actas.json', 'utf8'));
for (let i = 0; i < actas.length; i++) {
	if (!!actas[i].images.length) {
		const doc = new PDFDocument({ margin: 0 });
		const pdfName = actas[i].images[0].split('-')[0];

		doc.pipe(fs.createWriteStream(`./pdfs/${pdfName}.pdf`));
		actas[i].images.forEach((imgPath, index) => {
			const { height, width } = sizeOf(`./images/${imgPath}`);
			if (index === 0) {
				doc.image(`./images/${imgPath}`, { fit: [height, width] });
				return;
			}

			doc.addPage({ margin: 0 });
			doc.image(`./images/${imgPath}`, { fit: [height, width] });
		});

		doc.end();
		total++;
	}
}

console.log(`Se han creado ${total} pdfs`);
