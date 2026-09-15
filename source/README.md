# Repositorio de Robótica Educativa

Web estática preparada para GitHub Pages. El catálogo se carga desde `recursos.json` y puede filtrarse por edad, etapa, entidad, dispositivo y texto libre.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube a la raíz los archivos `index.html`, `styles.css`, `app.js` y `recursos.json` (no subas la carpeta contenedora).
3. En el repositorio, abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona la rama **main**, la carpeta **/(root)** y pulsa **Save**.
6. Espera uno o dos minutos y abre la dirección que mostrará GitHub Pages.

No abras `index.html` con doble clic para probarlo: algunos navegadores bloquean la carga local de JSON. Usa GitHub Pages o un servidor local.

## Probarlo antes de publicar

Desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000`.

## Añadir una actividad

Edita `recursos.json`, añade una coma tras el recurso anterior y copia esta estructura:

```json
{
  "id": "CLM-008",
  "titulo": "Título de la actividad",
  "descripcion": "Descripción breve.",
  "entidad": "JCCM",
  "fuente": "Banco de Recursos CLM",
  "etapas": ["primaria"],
  "edadMin": 8,
  "edadMax": 12,
  "hardware": ["microbit", "scratch"],
  "tags": ["micro:bit", "programación"],
  "url": "https://direccion-oficial-del-recurso"
}
```

Valores admitidos actualmente:

- `entidad`: `JCCM` o `INTEF`.
- `etapas`: `infantil`, `primaria` y `secundaria`.
- `hardware`: `beebot`, `mbot`, `microbit`, `scratch`, `makeymakey`, `lego` o `sin-dispositivo`.

Un recurso puede incluir varias etapas y varios dispositivos. `edadMin` y `edadMax` son números, sin comillas.

Si añades otra entidad o dispositivo, incorpora también una casilla equivalente en `index.html`. En el caso de un dispositivo, añade su nombre visible al objeto `labels` de `app.js`.
