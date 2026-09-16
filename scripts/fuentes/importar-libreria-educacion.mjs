import { readFile, writeFile } from "node:fs/promises";

const RESOURCES_URL = new URL(
  "../../data/resources.json",
  import.meta.url
);

const PENDING_URL = new URL(
  "../../data/pendientes.json",
  import.meta.url
);

const COLLECTION_PAGE =
  "https://www.libreria.educacion.gob.es/materia/robotica-1/";

const candidates = [
  {
    id: "libreria-educacion-smart-city",
    titulo: "ODS 11: Programando una smart city",
    descripcion:
      "Proyecto colaborativo para construir una maqueta de ciudad inteligente utilizando micro:bit, Tinkercad, impresión 3D, corte láser, sensores e Internet de las cosas.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-181-ods-11-programando-una-smart-city_186910/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["bachillerato"],
    edadMin: 16,
    edadMax: 18,
    hardware: ["microbit", "otros"],
    tags: [
      "micro:bit",
      "Tinkercad",
      "impresión 3D",
      "sensores",
      "IoT",
      "ciudad inteligente"
    ],
    tipo: "experiencia-educativa"
  },
  {
    id: "libreria-educacion-robots-emociones",
    titulo: "¿Robots y emociones?",
    descripcion:
      "Proyecto interdisciplinar de iniciación a la robótica en el que el alumnado construye y programa robots para conocer y expresar mejor sus emociones.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-180-robots-y-emociones_186909/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["primaria"],
    edadMin: 6,
    edadMax: 12,
    hardware: ["otros"],
    tags: [
      "robótica educativa",
      "educación emocional",
      "programación",
      "proyecto interdisciplinar"
    ],
    tipo: "experiencia-educativa"
  },
  {
    id: "libreria-educacion-velocidad-maqueen",
    titulo: "Explorando el MRU: ¿Cuál es la velocidad del robot Maqueen?",
    descripcion:
      "Situación de aprendizaje para estudiar el movimiento rectilíneo uniforme mediante programación y experimentación con un robot Maqueen.",
    url: "https://www.libreria.educacion.gob.es/libro/situaciones-de-aprendizaje-no-3-explorando-el-mru-cual-es-la-velocidad-del-robot-maqueen_186557/",
    coleccion: "Situaciones de aprendizaje",
    etapas: ["secundaria"],
    edadMin: 12,
    edadMax: 16,
    hardware: ["microbit", "otros"],
    tags: [
      "Maqueen",
      "micro:bit",
      "movimiento rectilíneo uniforme",
      "física",
      "STEAM"
    ],
    tipo: "situacion-aprendizaje"
  },
  {
    id: "libreria-educacion-ros-and-roll",
    titulo: "ROS and Roll",
    descripcion:
      "Introducción a la robótica avanzada mediante Python, ROS, la plataforma de simulación The Construct y el robot virtual TurtleBot 2.",
    url: "https://www.libreria.educacion.gob.es/libro/situaciones-de-aprendizaje-no-10-ros-and-roll_186575/",
    coleccion: "Situaciones de aprendizaje",
    etapas: ["bachillerato"],
    edadMin: 16,
    edadMax: 18,
    hardware: ["sin-dispositivo", "otros"],
    tags: [
      "ROS",
      "Python",
      "TurtleBot",
      "simulación",
      "robótica avanzada"
    ],
    tipo: "situacion-aprendizaje"
  },
  {
    id: "libreria-educacion-arduino",
    titulo: "Arduino: tecnología y creatividad en tus manos",
    descripcion:
      "Material del Observatorio de Tecnología Educativa sobre Arduino, programación, electrónica y creación de proyectos tecnológicos y robots.",
    url: "https://www.libreria.educacion.gob.es/libro/observatorio-de-tecnologia-educativa-no-95-arduino-tecnologia-y-creatividad-en-tus-manos_183987/",
    coleccion: "Observatorio de Tecnología Educativa",
    etapas: ["secundaria", "bachillerato"],
    edadMin: 12,
    edadMax: 18,
    hardware: ["otros"],
    tags: [
      "Arduino",
      "electrónica",
      "programación",
      "sensores",
      "robótica"
    ],
    tipo: "guia-docente"
  },
  {
    id: "libreria-educacion-grupo-rock",
    titulo: "El mejor grupo de rock: Robótica y DUA en Primaria",
    descripcion:
      "Experiencia para crear instrumentos musicales con Scratch, Makey Makey y materiales reciclados aplicando los principios del Diseño Universal para el Aprendizaje.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-102-el-mejor-grupo-de-rock-robotica-y-dua-en-primaria_181639/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["primaria"],
    edadMin: 11,
    edadMax: 12,
    hardware: ["scratch", "makeymakey"],
    tags: [
      "Scratch",
      "Makey Makey",
      "música",
      "electricidad",
      "DUA"
    ],
    tipo: "experiencia-educativa"
  },
  {
    id: "libreria-educacion-mente-manos",
    titulo: "De la mente a nuestras manos: Más allá de la programación en Educación Infantil",
    descripcion:
      "Proyecto STEAM de iniciación a la programación y la robótica con robots de suelo, diseño e impresión 3D para alumnado de Infantil.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-37-de-la-mente-a-nuestras-manos-mas-alla-de-la-programacion-en-educacion-infantil_170661/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["infantil"],
    edadMin: 5,
    edadMax: 6,
    hardware: ["otros"],
    tags: [
      "robot de suelo",
      "impresión 3D",
      "programación",
      "STEAM",
      "Educación Infantil"
    ],
    tipo: "experiencia-educativa"
  },
  {
    id: "libreria-educacion-primer-robot",
    titulo: "Diseña tu primer robot",
    descripcion:
      "Proyecto para 5.º de Primaria centrado en el diseño de un robot, la programación de placas microcontroladoras y la resolución de retos.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-149-disena-tu-primer-robot-2024_184618/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["primaria"],
    edadMin: 10,
    edadMax: 11,
    hardware: ["otros"],
    tags: [
      "placas microcontroladoras",
      "diseño de robots",
      "programación",
      "Matemáticas",
      "Educación Artística"
    ],
    tipo: "experiencia-educativa"
  },
  {
    id: "libreria-educacion-mensaje-sostenible",
    titulo: "Programa un mensaje sostenible",
    descripcion:
      "Propuesta inclusiva para el tercer ciclo de Primaria que trabaja los Objetivos de Desarrollo Sostenible y la competencia digital mediante Scratch.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-148-programa-un-mensaje-sostenible-2024-compartiendo-ideas-para-un-mundo-mejor_184615/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["primaria"],
    edadMin: 10,
    edadMax: 12,
    hardware: ["scratch", "sin-dispositivo"],
    tags: [
      "Scratch",
      "ODS",
      "sostenibilidad",
      "inclusión",
      "competencia digital"
    ],
    tipo: "experiencia-educativa"
  },
  {
    id: "libreria-educacion-sentidos-artificiales",
    titulo: "Los sentidos artificiales: Una experiencia inspirada en el DUA",
    descripcion:
      "Proyecto para 1.º y 2.º de ESO en el que el alumnado estudia los sensores y diseña un sistema robótico utilizando una placa micro:bit.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-143-los-sentidos-artificiales-una-experiencia-inspirada-en-el-dua_184607/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["secundaria"],
    edadMin: 12,
    edadMax: 14,
    hardware: ["microbit", "otros"],
    tags: [
      "micro:bit",
      "sensores",
      "sistema robótico",
      "DUA",
      "aprendizaje basado en retos"
    ],
    tipo: "experiencia-educativa"
  },
  {
    id: "libreria-educacion-storytelling-robots",
    titulo: "Storytelling Robots: Creatividad, robótica y aprendizaje-servicio en Inglés",
    descripcion:
      "Experiencia de Primaria que combina robótica, creación audiovisual, lengua inglesa, trabajo colaborativo y aprendizaje-servicio.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-80-storytelling-robots-creatividad-robotica-y-aprendizaje-servicio-en-clase-de-ingles_175158/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["primaria"],
    edadMin: 6,
    edadMax: 12,
    hardware: ["otros"],
    tags: [
      "robótica educativa",
      "Inglés",
      "storytelling",
      "aprendizaje-servicio",
      "creación audiovisual"
    ],
    tipo: "experiencia-educativa"
  },
  {
    id: "libreria-educacion-robotretos",
    titulo: "RobotRetos: Aprendiendo Matemáticas a través de la Robótica",
    descripcion:
      "Buena práctica para 5.º y 6.º de Primaria que utiliza retos de robótica, gamificación y resolución de problemas para aprender Matemáticas.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-52-robotretos-aprendiendo-matematicas-a-traves-de-la-robotica-en-ed-primaria_173506/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["primaria"],
    edadMin: 10,
    edadMax: 12,
    hardware: ["otros"],
    tags: [
      "robótica educativa",
      "Matemáticas",
      "gamificación",
      "retos",
      "resolución de problemas"
    ],
    tipo: "experiencia-educativa"
  },
  {
    id: "libreria-educacion-asi-de-facil",
    titulo: "Así de fácil: Tutoriales de Robótica, Experimentos Mágicos y Televisión",
    descripcion:
      "Proyecto de Primaria en el que el alumnado crea videotutoriales sobre programación, robótica y experimentos utilizando mBot, MIO y Makey Makey.",
    url: "https://www.libreria.educacion.gob.es/libro/experiencias-educativas-inspiradoras-no-29-asi-de-facil-tutoriales-de-robotica-experimentos-magicos-y-television_180264/",
    coleccion: "Experiencias Educativas Inspiradoras",
    etapas: ["primaria"],
    edadMin: 6,
    edadMax: 12,
    hardware: ["mbot", "makeymakey", "otros"],
    tags: [
      "mBot",
      "MIO",
      "Makey Makey",
      "videotutoriales",
      "pensamiento computacional"
    ],
    tipo: "experiencia-educativa"
  }
].map(item => ({
  fuenteId: "libreria-educacion",
  fuente: "Librería de Educación",
  entidad:
    "Ministerio de Educación, Formación Profesional y Deportes",
  paginaColeccion: COLLECTION_PAGE,
  idiomas: ["es"],
  licencia:
    "Consultar las condiciones de reutilización en la ficha oficial",
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
  `Librería de Educación: ${newCandidates.length} candidatos nuevos de ${candidates.length} publicaciones verificadas.`
);
