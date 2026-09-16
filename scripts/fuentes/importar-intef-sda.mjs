import { readFile, writeFile } from "node:fs/promises";

const RESOURCES_URL = new URL(
  "../../data/resources.json",
  import.meta.url
);

const PENDING_URL = new URL(
  "../../data/pendientes.json",
  import.meta.url
);

const COLLECTION_PAGE = "https://intef.es/recursos-educativos/";

const candidates = [
  {
    id: "intef-robotica-micro-maqueen",
    titulo: "Robótica con micro:Maqueen",
    descripcion:
      "Material formativo de robótica educativa con micro:bit y el robot micro:Maqueen. Incluye retos de control remoto, baile, detección de obstáculos, luces y seguimiento de líneas.",
    url: "https://formacion.intef.es/aulaenabierto/mod/book/tool/print/index.php?id=5123",
    coleccion: "Aula en Abierto",
    etapas: ["primaria", "secundaria"],
    edadMin: 8,
    edadMax: 16,
    hardware: ["microbit", "otros"],
    tags: [
      "micro:bit",
      "micro:Maqueen",
      "MakeCode",
      "Python",
      "sensores",
      "siguelíneas"
    ],
    tipo: "guia-docente",
    licencia: "Consultar las condiciones en el recurso oficial"
  },
  {
    id: "intef-aprendiendo-con-robots",
    titulo:
      "Aprendiendo con robots: Cómo funcionan tus sentidos y los de las máquinas",
    descripcion:
      "Situación de aprendizaje que relaciona los sentidos humanos con sensores y sistemas robóticos mediante retos de programación y robótica.",
    url: "https://descargas.intef.es/recursos_educativos/ODES_SGOA/Codigo_Escuela/Aprendiendo_con_robots/",
    coleccion: "Código Escuela 4.0",
    etapas: ["primaria"],
    edadMin: 10,
    edadMax: 12,
    hardware: ["scratch", "otros"],
    tags: [
      "robótica",
      "sensores",
      "sentidos",
      "programación por bloques",
      "ciencias"
    ],
    tipo: "situacion-aprendizaje",
    licencia: "CC BY-SA 4.0"
  },
  {
    id: "intef-te-presento-robotic",
    titulo: "Te presento a RoboTIC",
    descripcion:
      "Situación de aprendizaje desenchufada para resolver problemas cotidianos mediante pensamiento computacional y crear cooperativamente un cuento digital.",
    url: "https://descargas.intef.es/recursos_educativos/ODES_SGOA/Primaria/Te_presento_a_RoboTIC.VF/index.html",
    coleccion: "Situaciones de aprendizaje",
    etapas: ["primaria"],
    edadMin: 6,
    edadMax: 8,
    hardware: ["sin-dispositivo"],
    tags: [
      "pensamiento computacional",
      "programación desenchufada",
      "algoritmos",
      "cuento digital",
      "emociones"
    ],
    tipo: "situacion-aprendizaje",
    licencia: "CC BY-SA 4.0"
  },
  {
    id: "intef-galaxia-desafio",
    titulo: "Galaxia Desafío",
    descripcion:
      "Situación de aprendizaje para Infantil que desarrolla pensamiento computacional mediante una aventura espacial, CodyFeet, secuencias y robots de suelo.",
    url: "https://descargas.intef.es/recursos_educativos/ODES_SGOA/Codigo_Escuela/Galaxia_desafio/index.html",
    coleccion: "Código Escuela 4.0",
    etapas: ["infantil"],
    edadMin: 4,
    edadMax: 5,
    hardware: ["sin-dispositivo", "otros"],
    tags: [
      "CodyFeet",
      "robot de suelo",
      "pensamiento computacional",
      "secuencias",
      "espacio"
    ],
    tipo: "situacion-aprendizaje",
    licencia: "CC BY-SA 4.0"
  },
  {
    id: "intef-historia-violeta",
    titulo: "Una historia violeta",
    descripcion:
      "Situación de aprendizaje de Infantil sobre igualdad y mujeres relevantes mediante secuencias lógicas, programación gráfica y actividades con robots de suelo.",
    url: "https://descargas.intef.es/recursos_educativos/ODES_SGOA/Codigo_Escuela/Una_historia_violeta/index.html",
    coleccion: "Código Escuela 4.0",
    etapas: ["infantil"],
    edadMin: 5,
    edadMax: 5,
    hardware: ["otros"],
    tags: [
      "robot de suelo",
      "programación gráfica",
      "secuencias",
      "igualdad",
      "mujeres STEM"
    ],
    tipo: "situacion-aprendizaje",
    licencia: "CC BY-SA 4.0"
  },
  {
    id: "intef-codigo-ada",
    titulo: "Descifrando el código con Ada",
    descripcion:
      "Situación de aprendizaje sobre Ada Lovelace que trabaja descomposición, patrones, abstracción, algoritmos y creación de un proyecto con Scratch.",
    url: "https://descargas.intef.es/recursos_educativos/ODES_SGOA/Codigo_Escuela/Descifrando_codigo_Ada_2_ciclo/index.html",
    coleccion: "Código Escuela 4.0",
    etapas: ["primaria"],
    edadMin: 8,
    edadMax: 10,
    hardware: ["scratch"],
    tags: [
      "Ada Lovelace",
      "Scratch",
      "algoritmos",
      "abstracción",
      "pensamiento computacional"
    ],
    tipo: "situacion-aprendizaje",
    licencia: "CC BY-SA 4.0"
  },
  {
    id: "intef-nos-vamos-espacio",
    titulo: "¿Nos vamos al espacio?",
    descripcion:
      "Situación de aprendizaje de 4.º de Primaria con misiones sobre el universo, construcción y programación de un satélite y aplicación del pensamiento computacional.",
    url: "https://descargas.intef.es/recursos_educativos/ODES_SGOA/Codigo_Escuela/Nos_vamos_al_espacio/index.html",
    coleccion: "Código Escuela 4.0",
    etapas: ["primaria"],
    edadMin: 9,
    edadMax: 10,
    hardware: ["scratch", "otros"],
    tags: [
      "programación",
      "robótica",
      "satélites",
      "espacio",
      "Scratch"
    ],
    tipo: "situacion-aprendizaje",
    licencia: "CC BY 4.0"
  },
  {
    id: "intef-fisica-scratch",
    titulo: "Explorando la física con Scratch",
    descripcion:
      "Situación de aprendizaje para 5.º y 6.º de Primaria que utiliza Scratch para investigar masa, volumen, densidad y otros conceptos de física.",
    url: "https://descargas.intef.es/recursos_educativos/ODES_SGOA/Codigo_Escuela/Explorando_fisica_con_Scratch/index.html",
    coleccion: "Código Escuela 4.0",
    etapas: ["primaria"],
    edadMin: 10,
    edadMax: 12,
    hardware: ["scratch"],
    tags: [
      "Scratch",
      "física",
      "densidad",
      "programación por bloques",
      "pensamiento computacional"
    ],
    tipo: "situacion-aprendizaje",
    licencia: "CC BY 4.0"
  }
].map(item => ({
  fuenteId: "intef-sda",
  fuente: "Recursos educativos INTEF",
  entidad:
    "Instituto Nacional de Tecnologías Educativas y de Formación del Profesorado",
  paginaColeccion: COLLECTION_PAGE,
  idiomas: ["es"],
  revisado: false,
  ...item
}));

async function readList(url) {
  try {
    const data = JSON.parse(await readFile(url, "utf8"));

    if (!Array.isArray(data)) {
      throw new Error(`${url.pathname} no contiene una lista`);
    }

    return data;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function normaliseUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";

    return url.href.replace(/\/$/, "");
  } catch {
    return String(value).trim();
  }
}

const published = await readList(RESOURCES_URL);
const pending = await readList(PENDING_URL);

const knownUrls = new Set(
  [...published, ...pending].map(item =>
    normaliseUrl(item.url)
  )
);

const knownIds = new Set(
  [...published, ...pending].map(item => item.id)
);

const newCandidates = candidates.filter(item => {
  return (
    !knownIds.has(item.id) &&
    !knownUrls.has(normaliseUrl(item.url))
  );
});

const result = [
  ...pending,
  ...newCandidates
];

await writeFile(
  PENDING_URL,
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8"
);

console.log(
  `INTEF: ${newCandidates.length} candidatos nuevos de ${candidates.length} recursos verificados.`
);
