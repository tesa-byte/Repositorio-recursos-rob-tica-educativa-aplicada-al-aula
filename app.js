"use strict";

const PAGE_SIZE = 24;
const state = { resources: [], query: "", sort: "title", visible: PAGE_SIZE };
const ui = {
  grid: document.querySelector("#cardsGrid"), count: document.querySelector("#resultsCount"),
  search: document.querySelector("#searchInput"), sort: document.querySelector("#sortSelect"),
  clear: document.querySelector("#clearFilters"), active: document.querySelector("#activeFilters"),
  loadMore: document.querySelector("#loadMore"), filters: [...document.querySelectorAll(".filter")]
};
const labels = {
  infantil: "Infantil", primaria: "Primaria", secundaria: "ESO", bachillerato: "Bachillerato", fp: "FP",
  beebot: "Bee-Bot / Blue-Bot", mbot: "mBot / mBot2", microbit: "micro:bit", scratch: "Scratch",
  makeymakey: "Makey Makey", lego: "LEGO Education", mtiny: "mTiny", arduino: "Arduino",
  raspberrypi: "Raspberry Pi", "robot-construido": "Robot construido", "sin-dispositivo": "Sin dispositivo",
  otros: "Otros", es: "Español", en: "Inglés"
};
const normalise = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const escapeHTML = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
const selectedValues = type => ui.filters.filter(input => input.dataset.filter === type && input.checked).map(input => input.value);
const overlaps = (values, selected) => selected.length === 0 || values.some(value => selected.includes(value));

function matchesAge(resource, ranges) {
  if (!ranges.length) return true;
  return ranges.some(range => {
    const [min, max] = range.split("-").map(Number);
    return resource.edadMin <= max && resource.edadMax >= min;
  });
}

function filteredResources() {
  const selected = {
    ages: selectedValues("edad"), stages: selectedValues("etapas"), sources: selectedValues("fuenteId"),
    hardware: selectedValues("hardware"), languages: selectedValues("idiomas")
  };
  return state.resources.filter(resource => {
    const searchable = normalise([resource.titulo, resource.descripcion, resource.fuente, resource.entidad,
      ...(resource.tags || []), ...(resource.hardware || []), ...(resource.etapas || [])].join(" "));
    return matchesAge(resource, selected.ages)
      && overlaps(resource.etapas, selected.stages)
      && (!selected.sources.length || selected.sources.includes(resource.fuenteId))
      && overlaps(resource.hardware, selected.hardware)
      && overlaps(resource.idiomas, selected.languages)
      && (!state.query || searchable.includes(normalise(state.query)));
  }).sort((a, b) => state.sort === "age"
    ? a.edadMin - b.edadMin || a.titulo.localeCompare(b.titulo, "es")
    : a.titulo.localeCompare(b.titulo, "es"));
}

function cardTemplate(resource) {
  const stages = resource.etapas.map(value => labels[value] || value).join(" · ");
  const devices = resource.hardware.map(value => labels[value] || value).join(", ");
  const languages = resource.idiomas.map(value => labels[value] || value).join(", ");
  const tags = resource.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("");
  return `<article class="card"><div class="card-accent" aria-hidden="true"></div><div class="card-body">
    <div class="card-meta"><span class="stage">${escapeHTML(stages)}</span><span class="entity">${escapeHTML(resource.fuente)}</span></div>
    <h3>${escapeHTML(resource.titulo)}</h3><p class="description">${escapeHTML(resource.descripcion)}</p>
    <p class="details"><strong>Edad:</strong> ${resource.edadMin}–${resource.edadMax} años<br>
    <strong>Dispositivo:</strong> ${escapeHTML(devices)}<br><strong>Idioma:</strong> ${escapeHTML(languages)}</p>
    <div class="tags">${tags}</div>
    <a class="card-link" href="${escapeHTML(resource.url)}" target="_blank" rel="noopener noreferrer">Abrir en la fuente original <span aria-hidden="true">↗</span></a>
  </div></article>`;
}

function renderActiveFilters() {
  ui.active.innerHTML = ui.filters.filter(input => input.checked).map(input => {
    const text = input.closest("label").textContent.trim();
    return `<button class="filter-chip" type="button" data-remove="${escapeHTML(input.dataset.filter)}:${escapeHTML(input.value)}" aria-label="Quitar filtro ${escapeHTML(text)}">${escapeHTML(text)} ×</button>`;
  }).join("");
}

function render(resetPage = false) {
  if (resetPage) state.visible = PAGE_SIZE;
  const matches = filteredResources();
  const visible = matches.slice(0, state.visible);
  ui.count.textContent = matches.length ? `Mostrando ${visible.length} de ${matches.length} recursos` : "0 recursos";
  renderActiveFilters();
  ui.grid.innerHTML = visible.length ? visible.map(cardTemplate).join("")
    : `<div class="empty"><strong>No hay coincidencias</strong>Prueba a quitar algún filtro o utiliza otra búsqueda.</div>`;
  ui.loadMore.hidden = visible.length >= matches.length;
}

function validateResource(resource) {
  return resource && resource.id && resource.titulo && resource.descripcion && resource.fuenteId && resource.fuente
    && resource.entidad && Array.isArray(resource.etapas) && Number.isFinite(resource.edadMin)
    && Number.isFinite(resource.edadMax) && Array.isArray(resource.hardware) && Array.isArray(resource.idiomas)
    && Array.isArray(resource.tags) && resource.url && resource.revisado === true;
}

async function loadResources() {
  try {
    const response = await fetch("data/resources.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("El catálogo no es una lista");
    state.resources = data.filter(validateResource);
    render(true);
  } catch (error) {
    console.error("No se pudo cargar data/resources.json", error);
    ui.count.textContent = "Catálogo no disponible";
    ui.grid.innerHTML = `<div class="empty"><strong>No se pudo cargar el catálogo</strong>Comprueba que la carpeta data está en el repositorio y que la web se abre mediante GitHub Pages.</div>`;
  }
}

ui.filters.forEach(input => input.addEventListener("change", () => render(true)));
ui.search.addEventListener("input", event => { state.query = event.target.value.trim(); render(true); });
ui.sort.addEventListener("change", event => { state.sort = event.target.value; render(true); });
ui.clear.addEventListener("click", () => { ui.filters.forEach(input => { input.checked = false; }); ui.search.value = ""; state.query = ""; render(true); });
ui.active.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]"); if (!button) return;
  const [type, value] = button.dataset.remove.split(":");
  const input = ui.filters.find(item => item.dataset.filter === type && item.value === value);
  if (input) input.checked = false; render(true);
});
ui.loadMore.addEventListener("click", () => { state.visible += PAGE_SIZE; render(); });
loadResources();
