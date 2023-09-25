import sql from 'mssql';
import fs from 'fs';

// Obtener fecha con formato
const getFechaFormat = (fecha) => {
	let newFecha = fecha.toISOString().split('T');
	newFecha = newFecha[0].split('-');
	newFecha = newFecha.reverse();

	return newFecha.join('/');
}

const getIndiceFormat = (indices) => indices.join(' | ');

// Buscar nombre del lugar por id
const getLugar = (id, lugares) => {
	return lugares.recordsets[0].filter((lugar) => {
		return lugar.IdLugar === id;
	})[0].Descripcion;
}

const getYearRange = (start, end) => start === end ? start: `${start}-${end}`;

try {
    // Conexión con la base de datos
    await sql.connect('Server=D08A,1433;Database=BDNOTARIALES;User Id=admin;Password=Password12;trustServerCertificate= true');
    
    let query = `select IdActa, Tipo, FolioFoja, Fecha, Numero, Anio, Anio2, IdLugar, IdCampus, Resumen, Observaciones from Actas`;
    let actas = await sql.query(query);
    let lugares = await sql.query('select * from Lugares');

    // Dando formato a las actas
    actas = actas.recordsets[0].map((acta) => {
    	return {
			codigoRef: acta.IdActa,
			titulo: acta.IdCampus === 2 ? `${getYearRange(acta.Anio, acta.Anio2)}, Expediente ${acta.Numero}`: "",
			fecha: getFechaFormat(acta.Fecha),
			nivelDesc: "item",
			volumenSoporte: acta.FolioFoja,
			alcanceContenido: acta.Resumen,
			notas: acta.Observaciones,
			nombreProductor: getLugar(acta.IdLugar, lugares),
			campus: acta.IdCampus === 1 ? "XALAPA": "ORIZABA",
			inicioAnio: acta.Anio,
			finAnio: acta.Anio2,
		};
    });

    const data = await Promise.all(
    	// Obteniendo los indices de cada acta
    	actas.map(async (acta) => {
	    	query = `select o.Descripcion from Actas as a, ActasOnomasticos as ao, Onomasticos as o WHERE a.IdActa = ao.IdActa AND o.IdOnomastico = ao.IdOnomastico AND a.IdActa = '${acta.codigoRef}'`;
	    	const onomastico = await sql.query(query);
	    	const autoridades = onomastico.recordsets[0].map((row) => row.Descripcion);
	    	acta.paAutoridad = getIndiceFormat(autoridades);

	    	query = `select g.Descripcion from Actas as a, ActasGeograficos as ag, Geograficos as g WHERE a.IdActa = ag.IdActa AND g.IdGeografico = ag.IdGeografico AND a.IdActa = '${acta.codigoRef}'`;
	    	const geografico = await sql.query(query);
	    	const lugares = geografico.recordsets[0].map((row) => row.Descripcion);
    		acta.paLugar = getIndiceFormat(lugares);

	    	query = `select t.Descripcion from Actas as a, ActasTemas as at, Temas as t WHERE a.IdActa = at.IdActa AND t.IdTema = at.IdTema AND a.IdActa = '${acta.codigoRef}'`;
	    	const tematico = await sql.query(query);
	    	const materias = tematico.recordsets[0].map((row) => row.Descripcion);
	    	acta.paMateria = getIndiceFormat(materias);

	    	return acta;
	    })
    );

    // Convirtiendo las actas a un json
	const formated = JSON.stringify(data, null, 2);
	fs.writeFileSync('./data/actas.json', formated);

    console.log("Se han guardado todos los registros con exito");
} catch (err) {
    console.log(err);
}
