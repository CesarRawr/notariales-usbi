import sql from 'msnodesqlv8';
import fs from 'fs';

const getData = async (query, callback) => {
	const connectionString = "server=.;Database=BDNOTARIALES;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";
	return sql.query(connectionString, query, (err, rows) => {
		callback(rows);
	});
}

const connectionString = "server=.;Database=BDNOTARIALES;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";
const queryActas = "select IdActa, Tipo, FolioFoja, Fecha, Numero, Anio, Anio2, IdLugar, IdCampus, Resumen, Observaciones from Actas";
const data = await sql.query(connectionString, queryActas);

console.log(data);

/*
// Extraer todas las actas en la base de datos
(() => {
	let resultA = "Actas";

	// obtener todas las actas
	const queryActas = "select IdActa, Tipo, FolioFoja, Fecha, Numero, Anio, Anio2, IdLugar, IdCampus, Resumen, Observaciones from Actas";
	getData(queryActas, (rows) => {
		const res = rows.map((item) => {
			return {
				codigoRef: item.IdActa,
				titulo: null,
				fecha: item.Fecha,
				nivelDesc: "item",
				volumenSoporte: item.FolioFoja,
				alcanceContenido: item.Resumen,
				notas: item.Observaciones,
				nombreProductor: item.IdCampus === 1 ? "xalapa": "orizaba",
				inicioAnio: item.Anio,
				finAnio: item.Anio2,
			};
		});
		resultA = res;
	});

	setTimeout(() => {
		for (let i = 0; i < resultA.length; i++) {
			// Obteniendo onomasticos
			const queryOnomasticos = `select o.Descripcion from Actas as a, ActasOnomasticos as ao, Onomasticos as o WHERE a.IdActa = ao.IdActa AND o.IdOnomastico = ao.IdOnomastico AND a.IdActa = '${resultA[i].codigoRef}'`;
			getData(queryOnomasticos, (rowsO) => {
				resultA[i].paAutoridad = rowsO.map((rowO) => rowO.Descripcion);
			});

			const queryGeograficos = `select g.Descripcion from Actas as a, ActasGeograficos as ag, Geograficos as g WHERE a.IdActa = ag.IdActa AND g.IdGeografico = ag.IdGeografico AND a.IdActa = '${resultA[i].codigoRef}'`;
			getData(queryGeograficos, (rowsG) => {
				resultA[i].paLugar = rowsG.map((rowG) => rowG.Descripcion);
			});

			// Obteniendo tematicos
			const queryTematicos = `select t.Descripcion from Actas as a, ActasTemas as at, Temas as t WHERE a.IdActa = at.IdActa AND t.IdTema = at.IdTema AND a.IdActa = '${resultA[i].codigoRef}'`;
			getData(queryTematicos, (rowsT) => {
				resultA[i].paMateria = rowsT.map((rowT) => rowT.Descripcion);
			});
		}

		setTimeout(() => {
			const data = JSON.stringify(resultA, null, 2);
			fs.writeFileSync('./data/actas.json', data);
		}, 50000);
	}, 3000);
})();
*/
