const sql = require("msnodesqlv8");
const fs = require('fs');

const connectionString = "server=.;Database=BDNOTARIALES;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";
const query = "SELECT * FROM ImagenesActa";

// Convertir cada imagen a jpg y guardarla en una carpeta
sql.query(connectionString, query, (err, rows) => {
    for (let i = 0; i < rows.length; i++) {
        const imageData = rows[i];
        const decodedImage = new Buffer(imageData.Imagen, 'base64');

        fs.writeFileSync(__dirname + `/images/${imageData.IdActa}-${imageData.IdImagen}${imageData.Extension}`, decodedImage);
    }
});
