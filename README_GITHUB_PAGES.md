# Panel ESIOS para GitHub Pages

## Archivos

- `index.html`: aplicación completa, incluyendo estilos y JavaScript.
- `.nojekyll`: evita el procesamiento Jekyll.

## Despliegue

1. Crea un repositorio de GitHub.
2. Sube `index.html` y `.nojekyll` a la raíz de la rama `main`.
3. Ve a `Settings > Pages`.
4. Selecciona `Deploy from a branch`, rama `main`, carpeta `/ (root)`.

## Prueba local

```powershell
python -m http.server 8000
```

Abre `http://localhost:8000`.

## Opciones del selector

- Intradiario 1, indicador 600.
- Terciarias Subir, indicador 2197.
- Banda secundaria, indicador 2130.
- Todos / Comparar.

La opción Todos consulta las tres series, las representa juntas y crea una hoja por producto en el Excel descargado.
