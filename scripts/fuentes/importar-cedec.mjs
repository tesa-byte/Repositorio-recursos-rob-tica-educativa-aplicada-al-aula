import { readFile, writeFile } from "node:fs/promises";

const PENDING_URL = new URL("../../data/pendientes.json", import.meta.url);
const RESOURCES_URL = new URL("../../data/resources.json", import.meta.url);
const SOURCE_PAGE = "https://cedec.intef.es/recursos/";

// CEDEC bloquea las consultas automáticas.
// Esta selección contiene recursos comprobados en su catálogo oficial.
const catalogue = [
  [
    "dale-corriente",
    "Dale corriente",
    "Situación de aprendizaje sobre energía eléctrica, simulación de circuitos con Tinkercad, programación con Scratch y construcción de una maqueta funcional.",
    "https://descargas.intef.es/cedec/proyectoedia/tecnologia/contenidos/dale-corriente_web/index.html",
    ["secundaria"],
    12,
    14,
    ["scratch", "otros"],
    ["electricidad", "circuitos", "Tinkercad", "Scratch", "proyecto tecnológico"],
    "situacion-aprendizaje"
  ],
  [
    "operacion-digitalizacion",
    "Operación 1. Digitalización",
    "REA de Formación Profesional sobre digitalización, tecnologías habilitadoras e Internet de las cosas mediante un reto de divulgación tecnológica.",
    "https://descargas.intef.es/cedec/proyectoedia/FP/digitalizacion/contenidos/operacion_digitalizacion/index.html",
    ["fp"],
    16,
    21,
    ["otros"],
    ["digitalización", "Internet de las cosas", "IoT", "tecnologías habilitadoras"],
    "situacion-aprendizaje"
  ],
  [
    "operacion-cloud",
    "Operación 2. Cloud Computing",
    "REA de Formación Profesional sobre gestión de datos, modelos de servicios en la nube y diseño de un plan de implantación cloud.",
    "https://descargas.intef.es/cedec/proyectoedia/FP/digitalizacion/contenidos/operacion_cloud/index.html",
    ["fp"],
    16,
    21,
    ["otros"],
    ["cloud computing", "datos", "soberanía digital", "Nextcloud"],
    "situacion-aprendizaje"
  ],
  [
    "operacion-ciberseguridad",
    "Operación 3. Ciberseguridad",
    "REA de Formación Profesional para analizar riesgos, proteger datos y elaborar un plan de seguridad ante posibles ciberataques.",
    "https://descargas.intef.es/cedec/proyectoedia/FP/digitalizacion/contenidos/operacion_ciberseguridad/index.html",
    ["fp"],
    16,
    21,
    ["otros"],
    ["ciberseguridad", "protección de datos", "seguridad digital"],
    "situacion-aprendizaje"
  ],
  [
    "operacion-inteligencia-artificial",
    "Operación 4. Inteligencia Artificial",
    "REA de Formación Profesional para identificar aplicaciones de inteligencia artificial y diseñar soluciones basadas en datos de forma crítica y ética.",
    "https://descargas.intef.es/cedec/proyectoedia/FP/digitalizacion/contenidos/operacion_ia/index.html",
    ["fp"],
    16,
    21,
    ["otros"],
    ["inteligencia artificial", "datos", "ética digital"],
    "situacion-aprendizaje"
  ],
  [
    "operacion-transformacion-digital",
    "Operación 5. Transformación Digital",
    "REA de Formación Profesional para desarrollar un proyecto de transformación digital adaptado a una empresa de un sector productivo.",
    "https://descargas.intef.es/cedec/proyectoedia/FP/digitalizacion/contenidos/operacion_transformacion/index.html",
    ["fp"],
    16,
    21,
    ["otros"],
    ["transformación digital", "proyecto tecnológico", "estrategia digital"],
    "situacion-aprendizaje"
  ],
  [
    "variabilidad-software",
    "Variabilidad software y pensamiento computacional",
    "REA para trabajar abstracción, modelización de opciones y metaprogramación con Snap! mediante la creación de un laberinto configurable.",
    "https://diversolab.us.es/rea-variabilidad/",
    ["secundaria", "bachillerato", "fp"],
    12,
    21,
    ["otros"],
    ["pensamiento computacional", "programación", "Snap!", "variabilidad software"],
    "recurso-educativo",
    "https://cedec.intef.es/un-rea-para-trabajar-una-nueva-dimension-del-pensamiento-computacional-la-variabilidad/"
  ]
];

const imported = catalogue.map(([
  slug,
  titulo,
  descripcion,
  url,
  etapas,
  edadMin,
  edadMax,
  hardware,
  tags,
  tipo,
  paginaColeccion = SOURCE_PAGE
]) => ({
  id: `cedec-${slug}`,
  titulo,
  descripcion,
  fuenteId: "cedec",
  fuente: "CEDEC",
  entidad: "CEDEC-INTEF",
  url,
  paginaColeccion,
  etapas,
  edadMin,
  edadMax,
  hardware,
  idiomas: ["es"],
  tags,
  tipo,
  licencia: "CC BY-SA 4.0",
  revisado: false
}));

let pending = [];

try {
  pending = JSON.parse(await readFile(PENDING_URL, "utf8"));

  if (!Array.isArray(pending)) {
    throw new Error("data/pendientes.json no contiene una lista");
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

let published = [];

try {
  published = JSON.parse(await readFile(RESOURCES_URL, "utf8"));

  if (!Array.isArray(published)) {
    throw new Error("data/resources.json no contiene una lista");
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const otherSources = pending.filter(
  item => item.fuenteId !== "cedec"
);

const publishedIds = new Set(
  published.map(item => item.id)
);

const publishedUrls = new Set(
  published.map(item => item.url)
);

const newCandidates = imported.filter(
  item =>
    !publishedIds.has(item.id) &&
    !publishedUrls.has(item.url)
);

await writeFile(
  PENDING_URL,
  `${JSON.stringify(
    [...otherSources, ...newCandidates],
    null,
    2
  )}\n`,
  "utf8"
);

console.log(
  `Preparados ${newCandidates.length} candidatos nuevos de CEDEC (${imported.length} enlaces controlados).`
);
