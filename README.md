# DARCNIA — Landing Page

Sitio oficial de **Darcnia**, el juego de cartas táctico donde cada carta que jugás se alza sobre el tablero como un monstruo de pixel art.

Página estática (HTML/CSS/JS puro, sin build step). Bilingüe EN/ES.

## Deploy

**Producción: [darcniamonster.com](https://darcniamonster.com) vía Vercel** — conectar este repo en Vercel (framework: *Other*, sin build command, output = raíz) y asignar el dominio en Project Settings → Domains.

Todas las URLs absolutas (canonical, Open Graph, sitemap, JSON-LD) ya apuntan a `darcniamonster.com`.

## Configuración pendiente al publicar

En `js/main.js`, bloque `CONFIG`:

```js
steamUrl: null,   // ← URL de la página de Steam cuando exista
youtubeId: null,  // ← id de YouTube del tráiler (pisa al video local si se setea)
```

Tras el deploy, validar las previews de compartir en https://cards-dev.twitter.com/validator y pegando el link en Discord.

## Estructura

- `index.html` — toda la página (secciones: hero, pilares, cartas, runas, torre, media, roadmap, apoyo).
- `js/i18n.js` — todos los textos EN/ES. `js/cards_data.js` — datos reales de cartas (exportados del juego con `tools/export_cards_web.gd`).
- `assets/img/cards/` — renders reales de cartas (pipeline `tools/shot_one_card.gd` del juego, en inglés).
- `assets/video/` — tráiler, clip de invocación y fondo animado del hero.

© 2026 Darcnia. Todos los derechos reservados.
