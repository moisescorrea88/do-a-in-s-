# Costeo de Platillos

Aplicación web sencilla e intuitiva para celular que permite costear un platillo a partir de sus ingredientes. Por cada ingrediente se captura el **peso en gramos por porción** y el **costo por kilo**; la app calcula automáticamente el subtotal de cada ingrediente y el **precio base del platillo** (la suma de todos los ingredientes, ya integrados en el producto final).

## Cómo funciona

- **Mis Platillos**: pantalla inicial con la lista de platillos guardados y su precio base.
- **+ Nuevo platillo**: crea un platillo, ponle nombre y agrega ingredientes.
- Por cada ingrediente se ingresa:
  - Nombre
  - Peso por porción (g)
  - Costo por kilo ($)
- El subtotal de cada ingrediente se calcula como `(gramos / 1000) * costo por kilo`.
- El **precio base** del platillo (barra inferior) es la suma de los subtotales de todos sus ingredientes.
- Todo se guarda automáticamente en el dispositivo (localStorage), sin necesidad de conexión a internet ni cuentas de usuario.

## Uso

Es una app web estática, no requiere backend ni build:

1. Abre `index.html` en el navegador del celular, o
2. Sírvela con cualquier servidor estático (por ejemplo `npx serve .` o GitHub Pages).

Es instalable como PWA ("Agregar a pantalla de inicio") para usarse como app nativa, con soporte offline básico gracias al service worker.

## Estructura

```
index.html          Marcado y vistas (lista de platillos / editor)
css/styles.css       Estilos mobile-first
js/app.js            Lógica de estado, cálculo y persistencia
manifest.json         Metadatos de instalación PWA
service-worker.js     Cache offline
icons/icon.svg         Ícono de la app
```
