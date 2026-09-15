import { readFile, writeFile } from "node:fs/promises";

const SOURCE_URL = "https://www.sciencebuddies.org/blog/robotics-lessons";
const PENDING_URL = new URL("../../data/pendientes.json", import.meta.url);
const ALLOWED_PATHS = [
  "/stem-activities/",
  "/teacher-resources/lesson-plans/",
  "/science-fair-projects/project-ideas/"
];

function decodeEntities(value) {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;|&#8211;/gi, "–")
    .replace(/&mdash;|&#8212;/gi, "—")
    .replace(/&trade;|&#8482;/gi, "™")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function textOnly(html) {
  return decodeEntities(html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function articleSection(html) {
  const lower = html.toLowerCase();
  const startNeedle = "lesson plans and activities to introduce students to robotics";
  const endNeedle = "teaching about robotics in k-12";
  const start = lower.indexOf(startNeedle);
  const end = lower.indexOf(endNeedle, start + startNeedle.length);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No se encontró el bloque principal de actividades. La página puede haber cambiado.");
  }
  return html.slice(start, end);
}

function canonicalUrl(href) {
  const url = new URL(decodeEntities(href), SOURCE_URL);
  if (url.hostname !== "www.sciencebuddies.org" && url.hostname !== "sciencebuddies.org") return null;
  if (!ALLOWED_PATHS.some(path => url.pathname.startsWith(path))) return null;
  url.protocol = "https:";
  url.hostname = "www.sciencebuddies.org";
  url.search = "";
  url.hash = "";
  return url.href;
}

export function parseCollection(html) {
  const section = articleSection(html);
  const resources = new Map();
  const anchor = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchor.exec(section)) !== null) {
    const url = canonicalUrl(match[1]);
    const title = textOnly(match[2]).replace(/^\d+[.)]?\s*/, "").trim();
    if (!url || !title || title.length < 4 || resources.has(url)) continue;
    resources.set(url, { url, tituloEnColeccion: title });
  }
  return [...resources.values()];
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const first = new RegExp(`<meta\\b[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i").exec(html);
  const second = new RegExp(`<meta\\b[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["'][^>]*>`, "i").exec(html);
  return textOnly((first || second)?.[1] || "");
}

function pageTitle(html, fallback) {
  const ogTitle = metaContent(html, "og:title");
  const titleTag = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || "";
  return (ogTitle || textOnly(titleTag) || fallback)
    .replace(/\s*[|–-]\s*(STEM Activity|Lesson Plan|Science Project|Science Buddies).*$/i, "")
    .trim();
}

function gradeNumber(value) {
  if (/^(?:k|kindergarten)$/i.test(value)) return 0;
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : null;
}

function gradeRange(html) {
  const text = textOnly(html);
  const match = text.match(/(?:Grade Range|Grade Level|Grades?)\s*:?\s*(K|Kindergarten|\d{1,2})(?:st|nd|rd|th)?\s*(?:–|-|to)\s*(K|Kindergarten|\d{1,2})(?:st|nd|rd|th)?/i);
  if (!match) return { edadMin: null, edadMax: null, etapas: [] };

  const minGrade = gradeNumber(match[1]);
  const maxGrade = gradeNumber(match[2]);
  if (minGrade === null || maxGrade === null || minGrade > maxGrade || maxGrade > 12) {
    return { edadMin: null, edadMax: null, etapas: [] };
  }

  const edadMin = Math.max(5, minGrade + 5);
  const edadMax = Math.min(18, maxGrade + 6);
  const etapas = [];
  if (edadMin <= 5) etapas.push("infantil");
  if (edadMin <= 12 && edadMax >= 6) etapas.push("primaria");
  if (edadMin <= 16 && edadMax >= 12) etapas.push("secundaria");
  if (edadMax >= 16) etapas.push("bachillerato");
  return { edadMin, edadMax, etapas };
}

function resourceType(url) {
  if (url.includes("/teacher-resources/lesson-plans/")) return "plan-docente";
  if (url.includes("/stem-activities/")) return "actividad";
  return "proyecto";
}

function hardwareFor(title, html) {
  const text = `${title} ${textOnly(html).slice(0, 12000)}`.toLowerCase();
  const hardware = [];
  if (/\b(?:arduino|genuino)\b/.test(text)) hardware.push("arduino");
  if (/\b(?:raspberry pi)\b/.test(text)) hardware.push("raspberrypi");
  if (/(?:scratch\.mit\.edu|program(?:ming|med)? (?:with|in) scratch|scratch programming)/.test(text)) hardware.push("scratch");
  if (/\b(?:micro:?bit)\b/.test(text)) hardware.push("microbit");

  const unplugged = /(?:make me a sandwich|mars rover obstacle course|robot directions)/.test(text);
  const constructed = /(?:robot|robotic|bristlebot|brushbot|artbot|vibrobot|junkbot|bluebot|drone|rover|rov)/.test(text);
  if (unplugged) hardware.push("sin-dispositivo");
  else if (constructed) hardware.push("robot-construido");
  return [...new Set(hardware.length ? hardware : ["otros"])];
}

function identifier(url) {
  const parsed = new URL(url);
  const slug = parsed.pathname.split("/").filter(Boolean).at(-1);
  const prefix = resourceType(url).replace(/[^a-z0-9]+/g, "-");
  return `science-buddies-${prefix}-${slug}`;
}

function shortDescription(type, hasAge) {
  const labels = { "plan-docente": "Plan docente", actividad: "Actividad práctica", proyecto: "Proyecto" };
  return `Recurso de tipo «${labels[type].toLowerCase()}» publicado por Science Buddies${hasAge ? ", con nivel educativo indicado en la ficha original" : ", pendiente de concretar por edad y etapa"}.`;
}

async function getHtml(url, fixturePath) {
  if (fixturePath) return readFile(fixturePath, "utf8");
  const response = await fetch(url, {
    headers: { "User-Agent": "repositorio-robotica-educativa/1.0 (catalogue metadata importer)" }
  });
  if (!response.ok) throw new Error(`${url} respondió con HTTP ${response.status}`);
  return response.text();
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const collectionHtml = await getHtml(SOURCE_URL, process.env.SCIENCE_BUDDIES_HTML_FILE);
const links = parseCollection(collectionHtml);
if (!links.length) throw new Error("No se encontró ningún recurso educativo de Science Buddies.");

const pageFixture = process.env.SCIENCE_BUDDIES_PAGE_HTML_FILE;
const imported = await mapWithConcurrency(links, 4, async item => {
  let pageHtml = "";
  try {
    pageHtml = await getHtml(item.url, pageFixture);
  } catch (error) {
    console.warn(`No se pudo ampliar ${item.url}: ${error.message}`);
  }
  const titulo = pageTitle(pageHtml, item.tituloEnColeccion);
  const ages = gradeRange(pageHtml);
  const tipo = resourceType(item.url);
  return {
    id: identifier(item.url),
    titulo,
    descripcion: shortDescription(tipo, ages.edadMin !== null),
    fuenteId: "science-buddies",
    fuente: "Science Buddies",
    entidad: "Science Buddies",
    url: item.url,
    etapas: ages.etapas,
    edadMin: ages.edadMin,
    edadMax: ages.edadMax,
    hardware: hardwareFor(titulo, pageHtml),
    idiomas: ["en"],
    tags: ["robótica", "STEM", "ingeniería"],
    tipo,
    licencia: "Copyright Science Buddies; consultar condiciones de uso en la fuente",
    revisado: false
  };
});

let pending = [];
try {
  pending = JSON.parse(await readFile(PENDING_URL, "utf8"));
  if (!Array.isArray(pending)) throw new Error("data/pendientes.json no contiene una lista");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const otherSources = pending.filter(item => item.fuenteId !== "science-buddies");
await writeFile(PENDING_URL, `${JSON.stringify([...otherSources, ...imported], null, 2)}\n`, "utf8");
const classified = imported.filter(item => item.edadMin !== null).length;
console.log(`Importados ${imported.length} candidatos de Science Buddies (${classified} con edades detectadas).`);
