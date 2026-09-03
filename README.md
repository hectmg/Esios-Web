# Panel Web ESIOS

Sitio estático compatible con GitHub Pages. Consulta directamente la API e·sios desde el navegador, representa los datos con Plotly y permite descargarlos en CSV o Excel.

## Productos incluidos

- Intradiario 1, indicador 600
- Terciarias Subir, indicador 2197
- Banda secundaria, indicador 2130

## Publicación en GitHub Pages

1. Crea un repositorio en GitHub.
2. Copia en la raíz: `index.html`, `styles.css`, `app.js` y `.nojekyll`.
3. Sube los archivos a la rama `main`.
4. En `Settings > Pages`, selecciona `Deploy from a branch`, rama `main`, carpeta `/ (root)`.
5. Abre la dirección que muestre GitHub Pages.

## Uso local

Para evitar restricciones de algunos navegadores al abrir ficheros con `file://`, sirve la carpeta localmente:

```powershell
python -m http.server 8000
```

Después abre `http://localhost:8000`.

## Token

El token está incluido en `app.js` y también puede editarse desde la interfaz. En GitHub Pages cualquier token incluido en JavaScript es público y visible para cualquier visitante.
