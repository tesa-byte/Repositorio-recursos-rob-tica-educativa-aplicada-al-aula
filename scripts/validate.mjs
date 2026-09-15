import { readFile } from "node:fs/promises";
const resources = JSON.parse(await readFile(new URL("../data/resources.json", import.meta.url), "utf8"));
const required = ["id","titulo","descripcion","fuenteId","fuente","entidad","url","etapas","edadMin","edadMax","hardware","idiomas","tags","tipo","revisado"];
const allowedStages = new Set(["infantil","primaria","secundaria","bachillerato","fp"]);
const ids = new Set();
const errors = [];
resources.forEach((item, index) => {
  const where = `Recurso ${index + 1} (${item.id || "sin id"})`;
  required.forEach(field => { if (!(field in item)) errors.push(`${where}: falta ${field}`); });
  if (ids.has(item.id)) errors.push(`${where}: id duplicado`); else ids.add(item.id);
  if (!Array.isArray(item.etapas) || !item.etapas.every(value => allowedStages.has(value))) errors.push(`${where}: etapas no válidas`);
  if (!Array.isArray(item.hardware) || !item.hardware.length) errors.push(`${where}: hardware vacío`);
  if (!Array.isArray(item.idiomas) || !item.idiomas.length) errors.push(`${where}: idiomas vacío`);
  if (!Number.isFinite(item.edadMin) || !Number.isFinite(item.edadMax) || item.edadMin > item.edadMax) errors.push(`${where}: edades no válidas`);
  try { new URL(item.url); } catch { errors.push(`${where}: URL no válida`); }
});
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Catálogo válido: ${resources.length} recursos.`);
