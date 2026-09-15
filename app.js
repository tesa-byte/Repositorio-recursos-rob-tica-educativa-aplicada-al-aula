"use strict";

const state = { resources: [], query: "", sort: "title" };

const ui = {
  grid: document.querySelector("#cardsGrid"),
  count: document.querySelector("#resultsCount"),
  search: document.querySelector("#searchInput"),
  sort: document.querySelector("#sortSelect"),
  clear: document.querySelector("#clearFilters"),
  filters: [...document.querySelectorAll(".filter")],
  active: document.querySelector("#activeFilters")
};

const labels = {
  infantil: "Infantil", primaria: "Primaria", secundaria: "Secundaria",
  beebot: "Bee-Bot / Blue-Bot", mbot: "mBot / mBot2", microbit: "micro:bit",
  scratch: "Scratch", makeymakey: "Makey Makey", lego: "LEGO Education",
  "sin-dispositivo": "Sin dispositivo"
};

const normalise = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const escapeHTML = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));

function selectedValues(type) {
  return ui.filters.filter(input => input.dataset.filter === type && input.checked).map(input => input.value);
}

function overlaps(values, selected) {
  return selected.length === 0 || values.some(value => selected.includes(value));
}

function matchesAge(resource, ranges) {
  if (ranges.length === 0) return true;
  return ranges.some(range => {
    const [min, max] = range.split("-").map(Number);
    return resource.edadMin <= max && resource.edadMax >= min;
  });
}

function filteredResources() {
  const ages = selectedValues("edad");
  const stages = selectedValues("etapas");
  const entities = selectedValues("entidad");
  const hardware = selectedValues("hardware");

  return state.resources.filter(resource => {
    const searchable = normalise([
      resource.titulo, resource.descripcion, resource.entidad, resource.fuente,
      ...(resource.tags || []), ...(resource.hardware || []), ...(resource.etapas || [])
    ].join(" "));

    return matchesAge(resource, ages)
      && overlaps(resource.etapas, stages)
      && (entities.length === 0 || entities.includes(resource.entidad))
      && overlaps(resource.hardware, hardware)
      && (!state.query || searchable.includes(normalise(state.query)));
  }).sort((a, b) => state.sort === "age"
    ? a.edadMin - b.edadMin || a.titulo.localeCompare(b.titulo, "es")
    : a.titulo.localeCompare(b.titulo, "es"));
}

function cardTemplate(resource) {
  const stages = resource.etapas.map(stage => labels[stage] || stage).join(" · ");
  const devices = resource.hardware.map(device => labels[device] || device).join(", ");
  const tags = resource.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("");
  return `
    <article class="card">
      <div class="card-accent" aria-hidden="true"></div>
      <div class="card-body">
        <div class="card-meta">
          <span class="stage">${escapeHTML(stages)}</span>
          <span class="entity">${escapeHTML(resource.entidad)} · ${escapeHTML(resource.fuente)}</span>
        </div>
        <h3>${escapeHTML(resource.titulo)}</h3>
        <p class="description">${escapeHTML(resource.descripcion)}</p>
        <p class="details"><strong>Edad:</strong> ${resource.edadMin}–${resource.edadMax} años<br><strong>Dispositivo:</strong> ${escapeHTML(devices)}</p>
        <div class="tags">${tags}</div>
        <a class="card-link" href="${escapeHTML(resource.url)}" target="_blank" rel="noopener noreferrer">Abrir recurso oficial <span aria-hidden="true">↗</span></a>
      </div>
    </article>`;
}

function renderActiveFilters() {
  const checked = ui.filters.filter(input => input.checked);
  ui.active.innerHTML = checked.map(input => {
    const text = input.closest("label").textContent.trim();
    return `<button class="filter-chip" type="button" data-remove="${escapeHTML(input.dataset.filter)}:${escapeHTML(input.value)}" aria-label="Quitar filtro ${escapeHTML(text)}">${escapeHTML(text)} ×</button>`;
  }).join("");
}

function render() {
  const resources = filteredResources();
  ui.count.textContent = `${resources.length} ${resources.length === 1 ? "recurso" : "recursos"}`;
  renderActiveFilters();
  ui.grid.innerHTML = resources.length
    ? resources.map(cardTemplate).join("")
    : `<div class="empty"><strong>No hay coincidencias</strong>Prueba a quitar algún filtro o utiliza otra búsqueda.</div>`;
}

function validateResource(resource) {
  return resource && resource.id && resource.titulo && resource.descripcion && resource.entidad
    && resource.fuente && Array.isArray(resource.etapas) && Number.isFinite(resource.edadMin)
    && Number.isFinite(resource.edadMax) && Array.isArray(resource.hardware)
    && Array.isArray(resource.tags) && resource.url;
}

async function loadResources() {
  try {
    const response = await fetch("recursos.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("El catálogo no es una lista");
    state.resources = data.filter(validateResource);
    render();
  } catch (error) {
    console.error("No se pudo cargar recursos.json", error);
    ui.count.textContent = "Catálogo no disponible";
    ui.grid.innerHTML = `<div class="empty"><strong>No se pudo cargar el catálogo</strong>Comprueba que recursos.json está en la misma carpeta que index.html y que la web se abre mediante GitHub Pages.</div>`;
  }
}

ui.filters.forEach(input => input.addEventListener("change", render));
ui.search.addEventListener("input", event => { state.query = event.target.value.trim(); render(); });
ui.sort.addEventListener("change", event => { state.sort = event.target.value; render(); });
ui.clear.addEventListener("click", () => {
  ui.filters.forEach(input => { input.checked = false; });
  ui.search.value = "";
  state.query = "";
  render();
});
ui.active.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  const [type, value] = button.dataset.remove.split(":");
  const input = ui.filters.find(item => item.dataset.filter === type && item.value === value);
  if (input) input.checked = false;
  render();
});

loadResources();
