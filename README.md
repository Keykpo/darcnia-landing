# DARCNIA — Landing Page

Sitio oficial de **Darcnia**, el juego de cartas táctico donde cada carta que jugás se alza sobre el tablero como un monstruo de pixel art.

Página estática (HTML/CSS/JS puro, sin build step). Bilingüe EN/ES.

## Deploy

Cualquier hosting estático sirve tal cual la carpeta:

- **GitHub Pages**: Settings → Pages → Deploy from branch → `main` / root.
- **Cloudflare Pages / Netlify**: arrastrar la carpeta o conectar el repo. Sin comando de build; output = raíz.

## Configuración pendiente al publicar

En `js/main.js`, bloque `CONFIG`:

```js
steamUrl: null,   // ← URL de la página de Steam cuando exista
youtubeId: null,  // ← id de YouTube del tráiler (pisa al video local si se setea)
```

En `index.html`, actualizar `og:image` y `twitter:image` a URLs **absolutas** del dominio final para que las previews al compartir funcionen.

## Estructura

- `index.html` — toda la página (secciones: hero, pilares, cartas, runas, torre, media, roadmap, apoyo).
- `js/i18n.js` — todos los textos EN/ES. `js/cards_data.js` — datos reales de cartas (exportados del juego con `tools/export_cards_web.gd`).
- `assets/img/cards/` — renders reales de cartas (pipeline `tools/shot_one_card.gd` del juego, en inglés).
- `assets/video/` — tráiler, clip de invocación y fondo animado del hero.

© 2026 Darcnia. Todos los derechos reservados.
