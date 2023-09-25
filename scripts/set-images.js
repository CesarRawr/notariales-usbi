import fs from 'fs';

// Agregar los paths de las imagenes que corresponden a cada acta
const actas = JSON.parse(fs.readFileSync('./data/actas.json', 'utf8'));
fs.readdir("./images", (err, files) => {
    if (err) { return console.log('Unable to scan directory: ' + err) }

    const actasWImgs = actas.map((acta) => {
	    const paths = files.filter((file) => file.search(acta.codigoRef) > -1);
	    acta.images = paths;
	    return acta;
    });

	const data = JSON.stringify(actasWImgs, null, 2);
	fs.writeFileSync('./data/actas.json', data);
});
