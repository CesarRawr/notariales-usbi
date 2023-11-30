// Formatear Orizaba
import fs from "node:fs";
.
const orizaba = JSON.parse(
  fs.readFileSync("./data/orizaba/base.json", "utf8")
);
const orizabaDirectory = JSON.parse(
  fs.readFileSync("./data/orizaba/directory.json", "utf8")
);

// Unidades documentales compuestas
const parents = orizabaDirectory.filter((acta) => acta.foja !== "");

// indexar los datos del diccionario de orizaba
const orizabaIndexed = parents.reduce((acc, parent) => {
  const children = orizabaDirectory.filter(
    (acta) => acta.titulo === parent.titulo && acta.foja === ""
  );

  const newParent = {
    ...parent,
    children,
  }

  return [
    ...acc,
    newParent
  ];
}, []);

// Pasar indexación anterior a las actas
const actasIndexadas = orizabaIndexed.map((indexed) => {
  // Acta padre
  const parent = orizaba.find((acta) => indexed.id === acta.codigoRef);
  // Actas hijas
  const children = indexed.children.map((child) => {
    const newChild = orizaba.find((acta) => acta.codigoRef === child.id);
    return newChild;
  })

  return {
    ...parent,
    titulo: indexed.titulo,
    fojaAlta: indexed.foja,
    inicioAnio: indexed.FechaInicio,
    finAnio: indexed.FechaFinal,
    children,
  }
});

// Aquellos padres que no tangan hijos pero tampoco un @ deben ser sus propios hijos
const restructuredActas = actasIndexadas.map((item) => {
  if (!item.titulo.includes("@") && item.children.length === 0) {
    const childItem = {...item};
    delete childItem.children;
    delete childItem.fojaAlta;

    item.volumenSoporte = item.fojaAlta;
    delete item.fojaAlta;
    return {
      ...item,
      children: [childItem],
    };
  }

  item.volumenSoporte = item.fojaAlta;
  delete item.fojaAlta;
  return item;
})

// Agregar nuevos ids a las actas y padres
let childIdentifierNumber = 1;
const actasIndexadasWithNewIDS = restructuredActas.map((acta, index) => {
  const parentID = (index+1).toString().padStart(3, "0");
  const newChildren = acta.children.map((child) => {
    const childIDNumber = childIdentifierNumber.toString().padStart(5, "0");
    const childIdentifier = `EO_${parentID}_${childIDNumber}`;
    childIdentifierNumber += 1;
    return {
      ...child,
      codigoRef: childIdentifier,
    }
  });

  return {
    ...acta,
    codigoRef: parentID,
    children: newChildren,
  }
});

// Darle la estructura de atom a los archivos de orizaba.
let cont = 135;
const formatedData = actasIndexadasWithNewIDS.map((item) => {
  ++cont;
  const parent = formatParent(item, cont);
  const children = item.children.map((acta) => formatChild(acta, cont));
  return [parent, ...children];
}).flat();

const structuredData = JSON.stringify(formatedData, null, 2);
fs.writeFileSync("./data/orizaba/finalO.json", structuredData);

function getActaIdentifier(startYear, endYear) {
  return startYear === endYear || endYear === 0
    ? startYear.toString()
    : `${startYear}-${endYear}`;
}

function formatParent(item, uniqueID) {
  const eventDates = getActaIdentifier(item.inicioAnio, item.finAnio);
  return {
    legacyId: uniqueID,
    qubitParentSlug: "protocolos-notariales",
    identifier: item.codigoRef,
    title: item.titulo.replace("@", ""),
    levelOfDescription: "Unidad documental compuesta",
    eventDates,
    extentAndMedium: item.volumenSoporte,
    language: "es",
    culture: "es",
    parentId: "",
    scopeAndContent: "",
    appraisal: "",
    generalNote: "",
    subjectAccessPoints: "",
    placeAccessPoints: "",
    nameAccessPoints: "",
    descriptionStatus: "",
    levelOfDetail: "",
    eventTypes: "",
    eventStartDates: "",
    eventEndDates: "",
    eventActors: "",
  };
}

function formatChild(acta, parentId) {
  return {
    legacyId: "",
    qubitParentSlug: "",
    parentId,
    identifier: acta.codigoRef,
    title: "",
    levelOfDescription: "Unidad documental simple",
    extentAndMedium: acta.volumenSoporte,
    scopeAndContent: acta.alcanceContenido,
    appraisal: "Documentación en conservación permanente.",
    language: "es",
    generalNote: acta.notas,
    subjectAccessPoints: acta.paMateria,
    placeAccessPoints: acta.paLugar,
    nameAccessPoints: acta.paAutoridad,
    descriptionStatus: "Borrador",
    levelOfDetail: "Parcial",
    eventDates: acta.fecha,
    eventTypes: "Creación",
    eventStartDates: acta.inicioAnio,
    eventEndDates: acta.finAnio,
    eventActors: acta.nombreProductor,
    culture: "es",
  };
}

