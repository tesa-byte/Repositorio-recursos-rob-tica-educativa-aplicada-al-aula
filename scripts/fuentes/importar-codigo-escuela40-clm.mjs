import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const API_URL = "https://recursoscodigoescuela40.onrender.com/api/data";
const SOURCE_PAGE = "https://recursoscodigoescuela40.onrender.com/";
const RESOURCES_URL = new URL("../../data/resources.json", import.meta.url);

const value = (item, ...keys) => {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) {
      return String(item[key]);
    }
  }
  return "";
};

function cleanText(text) {
  return String(text)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalise(text) {
  return cleanText(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function agesFor(item) {
  const ageText = value(item, "Edad");
  const range = ageText.match(/(\d+)\s*[-–]\s*(\d+)/);

  if (range) {
    return [Number(range[1]), Number(range[2])];
  }

  const plus = ageText.match(/(\d+)\s*\+/);

  if (plus) {
    return [Number(plus[1]), 21];
  }

  const context = normalise(
    `${value(item, "Etapa educativa", "Etapa")} ${value(item, "Nivel")}`
  );

  if (context.includes("infantil")) return [3, 5];
  if (context.includes("primer ciclo")) return [6, 8];
  if (context.includes("segundo ciclo")) return [8, 10];
  if (context.includes("tercer ciclo")) return [10, 12];
  if (context.includes("bachillerato")) return [16, 18];
  if (context.includes("secundaria") || context.includes("eso")) return [12, 16];
  if (context.includes("primaria")) return [6, 12];

  return [3, 18];
}

function stagesFor(item, edadMin, edadMax) {
  const context = normalise(
    `${value(item, "Etapa educativa", "Etapa")} ${value(item, "Nivel")}`
  );

  const stages = [];

  if (context.includes("infantil")) stages.push("infantil");

  if (
    context.includes("primaria") ||
    context.includes("primer ciclo") ||
    context.includes("segundo ciclo") ||
    context.includes("tercer ciclo")
  ) {
    stages.push("primaria");
  }

  if (context.includes("secundaria") || context.includes("eso")) {
    stages.push("secundaria");
  }

  if (context.includes("bachillerato")) {
    stages.push("bachillerato");
  }

  if (!stages.length) {
    if (edadMin <= 5) stages.push("infantil");
    if (edadMin <= 12 && edadMax >= 6) stages.push("primaria");
    if (edadMin <= 16 && edadMax >= 12) stages.push("secundaria");
    if (edadMax >= 16) stages.push("bachillerato");
  }

  return [...new Set(stages)];
}

function hardwareFor(item) {
  const text = normalise(
    value(
      item,
      "Modalidad/Tecnologia",
      "Modalidad/Tecnología",
      "Dispositivo"
    )
  );

  const hardware = [];

  if (
    text.includes("bluebot") ||
    text.includes("blue-bot") ||
    text.includes("bee-bot")
  ) {
    hardware.push("beebot");
  }

  if (text.includes("mbot")) hardware.push("mbot");

  if (text.includes("microbit") || text.includes("micro:bit")) {
    hardware.push("microbit");
  }

  if (text.includes("mtiny")) hardware.push("mtiny");
  if (text.includes("lego")) hardware.push("lego");
  if (text.includes("makey")) hardware.push("makeymakey");
  if (text.includes("scratch")) hardware.push("scratch");

  if (
    text.includes("tinkercad") ||
    text.includes("python") ||
    text.includes("audacity") ||
    text.includes("desconectada") ||
    text.includes("codyfeet") ||
    text === "0"
  ) {
    hardware.push("sin-dispositivo");
  }

  return hardware.length ? [...new Set(hardware)] : ["otros"];
}

function makeId(url, title) {
  const hash = createHash("sha256")
    .update(url || title)
    .digest("hex")
    .slice(0, 12);

  return `codigo-escuela40-clm-${hash}`;
}

function convert(item) {
  const titulo = cleanText(
    value(item, "Título", "Titulo", "T�tulo", "Tï¿½tulo")
  );

  const descripcion = cleanText(
    value(
      item,
      "Descripción",
      "Descripcion",
      "Descripci�n",
      "Transcripcion",
      "Transcripción"
    )
  );

  const url = value(
    item,
    "Enlace web",
    "Enlace",
    "Enlaceweb"
  ).trim();

  const [edadMin, edadMax] = agesFor(item);
  const coleccion = cleanText(value(item, "Fuente"));

  const etiquetas = value(item, "Etiquetas")
    .split(",")
    .map(cleanText)
    .filter(Boolean);

  const modalidad = cleanText(
    value(
      item,
      "Modalidad/Tecnologia",
      "Modalidad/Tecnología",
      "Dispositivo"
    )
  );

  return {
    id: makeId(url, titulo),
    titulo,
    descripcion:
      descripcion ||
      "Recurso educativo de Código Escuela 4.0 de Castilla-La Mancha.",
    fuenteId: "codigo-escuela40-clm",
    fuente: "Código Escuela 4.0 CLM",
    entidad:
      "Consejería de Educación, Cultura y Deportes de Castilla-La Mancha",
    url,
    paginaColeccion: SOURCE_PAGE,
    coleccion,
    etapas: stagesFor(item, edadMin, edadMax),
    edadMin,
    edadMax,
    hardware: hardwareFor(item),
    idiomas: ["es"],
    tags: [
      ...new Set(
        [coleccion, modalidad, ...etiquetas].filter(Boolean)
      )
    ],
    tipo: "recurso-educativo",
    licencia: "Consultar las condiciones en el recurso original",
    revisado: true
  };
}

const response = await fetch(API_URL, {
  headers: {
    Accept: "application/json",
    "User-Agent": "repositorio-robotica-educativa/1.0"
  }
});

if (!response.ok) {
  throw new Error(
    `Código Escuela 4.0 CLM respondió con HTTP ${response.status}`
  );
}

const data = await response.json();

if (!Array.isArray(data) || data.length < 100) {
  throw new Error(
    `La API devolvió una cantidad inesperada: ${
      Array.isArray(data) ? data.length : "formato no válido"
    }`
  );
}

const imported = data.map(convert).filter(item => {
  try {
    const parsed = new URL(item.url);

    return (
      item.titulo &&
      ["http:", "https:"].includes(parsed.protocol)
    );
  } catch {
    return false;
  }
});

const uniqueImported = [
  ...new Map(
    imported.map(item => [item.url, item])
  ).values()
];

let current = [];

try {
  current = JSON.parse(
    await readFile(RESOURCES_URL, "utf8")
  );

  if (!Array.isArray(current)) {
    throw new Error(
      "data/resources.json no contiene una lista"
    );
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const otherSources = current.filter(
  item => item.fuenteId !== "codigo-escuela40-clm"
);

const existingUrls = new Set(
  otherSources.map(item => item.url)
);

const newResources = uniqueImported.filter(
  item => !existingUrls.has(item.url)
);

const result = [
  ...otherSources,
  ...newResources
];

await writeFile(
  RESOURCES_URL,
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8"
);

console.log(
  `Código Escuela 4.0 CLM: ${newResources.length} recursos añadidos; catálogo total: ${result.length}.`
);
