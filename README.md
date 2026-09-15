# Repositorio de Robótica Educativa

Catálogo preparado para crecer mediante fuentes externas sin que el navegador dependa directamente de sus APIs.

## Archivos principales

- `data/resources.json`: recursos revisados que aparecen en la web.
- `data/manual.json`: futuras incorporaciones manuales.
- `data/pendientes.json`: futuras importaciones pendientes de revisión.
- `data/sources.json`: las seis fuentes del proyecto.
- `scripts/validate.mjs`: comprueba la estructura del catálogo.

La web muestra 24 resultados cada vez. Esto no limita el catálogo: el botón **Cargar más recursos** permite recorrer todas las coincidencias.

## Publicar en GitHub Pages

Sube el contenido de esta carpeta a la raíz del repositorio. Después configura **Settings → Pages → Deploy from a branch → main → /(root)**.

## Comprobar el catálogo

```bash
node scripts/validate.mjs
```

## Probar localmente

```bash
python -m http.server 8000
```

Abre `http://localhost:8000`. No abras `index.html` directamente con doble clic porque algunos navegadores bloquean la carga local del JSON.

## Siguiente fase

Los importadores se añadirán dentro de `scripts/fuentes/`. Generarán candidatos para `data/pendientes.json`; solo los recursos revisados pasarán a `data/resources.json`.
