import { readFile, writeFile } from "node:fs/promises";

const SOURCE_URL = "https://www.csunplugged.org/es/topics/";
const PENDING_URL = new URL("../../data/pendientes.json", import.meta.url);

function textOnly(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function stagesFor(min, max) {
  const stages = [];
  if (min <= 5) stages.push("infantil");
  if (min <= 12 && max >= 6) stages.push("primaria");
  if (max >= 12) stages.push("secundaria");
  return stages;
}

export function parseTopics(html) {
  const found = new Map();
  const anchor = /<a\b[^>]*href=["']([^"']*\/es\/topics\/([^"'/?#]+)\/?)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchor.exec(html)) !== null) {
    const [, href, slug, body] = match;
    const text = textOnly(body);
    const ages = text.match(/Edades?\s*(\d+)\s*a\s*(\d+)/i);
    if (!ages || found.has(slug)) continue;

    const edadMin = Number(ages[1]);
    const edadMax = Number(ages[2]);
    const unavailable = /No disponible en espa[ñn]ol/i.test(text);
    const titulo = text
      .split(/No disponible en espa[ñn]ol|Edades?\s*\d+/i)[0]
      .replace(/^\d+[.)]?\s*/, "")
      .trim();
    if (!titulo) continue;

    found.set(slug, {
      id: `cs-unplugged-${slug}`,
      titulo,
      descripcion: `Tema de informática desenchufada recomendado para edades de ${edadMin} a ${edadMax} años.`,
      fuenteId: "cs-unplugged",
      fuente: "CS Unplugged",
      entidad: "University of Canterbury",
      url: new URL(href, SOURCE_URL).href,
      etapas: stagesFor(edadMin, edadMax),
      edadMin,
      edadMax,
      hardware: ["sin-dispositivo"],
      idiomas: unavailable ? ["en"] : ["es"],
      tags: ["pensamiento computacional", "informática desenchufada"],
      tipo: "tema-didactico",
      licencia: "CC BY-SA 4.0",
      revisado: false
    });
  }
  return [...found.values()];
}

async function getHtml() {
  if (process.env.CS_UNPLUGGED_HTML_FILE) {
    return readFile(process.env.CS_UNPLUGGED_HTML_FILE, "utf8");
  }
  const response = await fetch(SOURCE_URL, { headers: { "User-Agent": "repositorio-robotica-educativa/1.0" } });
  if (!response.ok) throw new Error(`CS Unplugged respondió con HTTP ${response.status}`);
  return response.text();
}

const html = await getHtml();
const imported = parseTopics(html);
if (!imported.length) throw new Error("No se encontró ningún tema. La estructura de la fuente puede haber cambiado.");

let pending = [];
try { pending = JSON.parse(await readFile(PENDING_URL, "utf8")); } catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const otherSources = pending.filter(item => item.fuenteId !== "cs-unplugged");
await writeFile(PENDING_URL, `${JSON.stringify([...otherSources, ...imported], null, 2)}\n`, "utf8");
console.log(`Importados ${imported.length} temas de CS Unplugged a data/pendientes.json.`);
