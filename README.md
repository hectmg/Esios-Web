# Panel ESIOS

Panel web estático para consultar, visualizar y descargar series de precios de ESIOS desde GitHub Pages.

## Contenido

- `index.html`: aplicación completa. Incluye HTML, CSS y JavaScript en un único archivo.
- `README.md`: instrucciones de publicación y uso.

## Indicadores configurados

| Producto | Indicador ESIOS |
|---|---:|
| Precio mercado diario | 600 |
| Precio Intradiario 1 | 612 |
| Precio Intradiario 2 | 613 |
| Precio Intradiario 3 | 614 |
| Precio Terciaria Subir | 2197 |
| Precio Terciaria Bajar | 2198 |
| Precio Banda Secundaria | 2130 |

El selector `Todos / Comparar` consulta todos los productos anteriores.

## Funcionalidades

- Selección individual de producto.
- Comparación conjunta de todas las series.
- Selección libre de fechas.
- Accesos rápidos para mes actual, año actual y año anterior.
- Consultas divididas por bloques mensuales.
- Gráfico interactivo con Plotly.
- Indicadores de registros, media, mínimo y máximo.
- Vista previa de hasta 500 filas.
- Descarga completa en CSV.
- Descarga en Excel, con una hoja por producto al usar `Todos / Comparar`.
- Diseño adaptable a escritorio, tableta y móvil.

## Publicación en GitHub Pages

1. Descomprime el ZIP.
2. Sube `index.html` y `README.md` a la raíz de la rama `main` del repositorio.
3. En GitHub, abre `Settings > Pages`.
4. Selecciona `Deploy from a branch`.
5. Configura la rama `main` y la carpeta `/ (root)`.
6. Guarda la configuración.
7. Cuando termine el despliegue, abre la página y fuerza una recarga con `Ctrl + F5` si el navegador conserva una versión anterior.

## Uso

1. Abre el panel.
2. Selecciona un producto o `Todos / Comparar`.
3. Indica las fechas de inicio y fin.
4. Comprueba el token ESIOS incluido en el campo correspondiente.
5. Pulsa `Consultar`.
6. Usa los botones `CSV` o `Excel` para descargar todos los registros obtenidos.

## Dependencias externas

La aplicación carga desde CDN:

- Plotly 2.35.2 para los gráficos.
- SheetJS XLSX 0.18.5 para generar archivos Excel.

No requiere servidor, instalación de Python, Node.js ni proceso de compilación.

## Consideraciones

- La aplicación realiza las consultas directamente desde el navegador contra la API de ESIOS.
- El token se encuentra incorporado en `index.html`, conforme a la configuración solicitada.
- Si la API devuelve un error HTTP, el panel muestra el producto afectado y el código de respuesta.
- La disponibilidad histórica puede variar según el indicador y el intervalo solicitado.

## URL del panel

La publicación prevista es:

https://hectmg.github.io/Esios-Web/
