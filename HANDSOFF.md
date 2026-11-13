# HANDSOFF.md · Traspaso de MundoCraft

**Fecha:** 13 de noviembre de 2026
**App en producción:** <https://sergarb1.github.io/mundocraft/>
**Repo:** <https://github.com/sergarb1/mundocraft>
**Último commit funcional:** `b22af5c` — arte de bloques y ajuste táctil (desplegado y verificado)

## Estado actual

Aplicación completa, publicada y usable: mapa de 4 zonas, **31 minijuegos**, progreso local con 3 niveles, voz y sonidos, lectura adaptable, PWA offline y despliegue automático en GitHub Pages.

Lo último que se hizo:

- **Arte nuevo**: 19 texturas 16×16 originales y 14 cubos isométricos generados con `npm run art`; mapa rediseñado con biomas, carteles de madera, caminos de tierra y cubos; cuadrícula de construcción con texturas reales.
- **Sprites CC0** de Kenney Tiny Farm para contar, sumar, restar y comparar (vacas, gallinas, zanahorias, maíz, girasoles…).
- **Táctil**: snap de 52 px al soltar, resaltado de destinos, doble toque para cancelar la selección, tolerancia de trazo 9 px / 85 %, objetivos más grandes y vibración.
- **Offline**: service worker `mundocraft-v2` precachea el arte nuevo.
- Documentación de licencias en `ASSETS.md`; sin ningún recurso oficial de Minecraft.

Verificación realizada antes del último despliegue: build correcto y **14/14** comprobaciones en Chrome móvil emulado (390×844) — carga del mapa, carteles sin desbordar, sin scroll horizontal, texturas 200, pintado, pictogramas de 42 px, selección/deselección, snap y cero excepciones JS. El bundle publicado coincide con el local (`index-CbCT0RGQ.js` en ese momento).

## Arrancar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
npm run preview    # sirve dist/
```

Rutas de prueba: `/` (mapa), `#/math/m-cantidad`, `#/math/m-contar`, `#/letters/l-repasar`, `#/syllables/s-construir`, `#/syllables/s-frases`, `#/build`.

## Cómo está montado

```
src/
  main.ts / App.vue
  views/            WorldMap, SectionView, GameView
  games/registry.ts catálogo: 12 matemáticas + 8 letras + 10 sílabas + 1 construcción
  games/*/          un .vue por juego
  components/       GameShell, BlockTile, TracePad, Celebration, DragGhost, Pictogram
  lib/
    nav.ts          rutas por hash
    progress.ts     localStorage, niveles y estrellas
    game.ts         bucle de 7 rondas (solve/miss/restart)
    drag.ts         arrastre, snap y selección táctil
    strokes.ts      plantillas de trazos SVG
    speech.ts       voz en español (Web Speech API)
    sfx.ts          WebAudio + vibración
    art.ts          rutas y catálogo de arte
  data/             words.json (100 palabras), syllables.json, letters.json, phrases.json
public/
  art/blocks|cubes|farm   PNG del arte
  sw.js                   service worker
  manifest.webmanifest    PWA
```

Decisiones clave:

- **Sin router**: hash + `base: './'`, para que funcione en la raíz o en `/mundocraft/`.
- **Sin backend**: todo estático; el progreso vive en el dispositivo (`mundocraft.progress.v1`).
- **Sin Phaser**: SVG, CSS y Pointer Events; más ligero y suficiente para las mecánicas.
- **Dificultad adaptativa** por número de sesiones (2 → nivel 2, 5 → nivel 3), nunca por castigos.

## Arte y licencias

- Texturas y cubos: **originales**, procedurales (`scripts/make-art.mjs`). No usar material oficial de Minecraft.
- Granja: **Kenney Tiny Farm, CC0 1.0** (OpenGameArt). Atribución y tabla de tiles en `ASSETS.md`.
- Emoji del sistema para el resto de pictogramas. Andika y OpenDyslexic se sirven localmente desde `src/assets/fonts/` (SIL OFL 1.1).
- Si se añade arte: registrar en `src/lib/art.ts`, añadir a `ART` en `public/sw.js` y documentar la licencia.

## PWA y caché

- `sw.js`: network-first para navegación con fallback a `index.html`; cache-first para estáticos; precache de `CORE` + 33 imágenes de arte.
- **Al cambiar el shell o el arte, subir `CACHE` a `mundocraft-v5`**; si no, los clientes existentes pueden quedarse con la versión anterior.
- El registro del SW solo ocurre en producción (`import.meta.env.PROD`).

## Despliegue

Cada push a `main` ejecuta `.github/workflows/deploy.yml` (Node 22, `npm ci`, `npm run build`, `upload-pages-artifact`, `deploy-pages`). Pages está configurado con GitHub Actions como origen.

Para comprobar un despliegue:

```bash
curl -s -H 'Cache-Control: no-cache' "https://sergarb1.github.io/mundocraft/?cb=$(date +%s)" | grep -o 'assets/index-[^"]*\.js'
```

Comparar el hash con `dist/assets/index-*.js`. El CDN de Pages puede tardar ~30–60 s y cachear HTML; usar query de cache-busting.

## Receta de prueba

1. `npm run build`.
2. Servir `dist` en segundo plano: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`.
3. Captura rápida:

```bash
google-chrome --headless=new --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=390,844 \
  --virtual-time-budget=7000 --screenshot=/tmp/map.png http://127.0.0.1:4173/
```

4. Para interacción real, lanzar Chrome con `--remote-debugging-port=9222` **y ejecutar el script CDP en el mismo comando**. Entre comandos el proceso muere.
5. Usar un `--user-data-dir` nuevo para evitar el service worker cacheado.

Trampas que ya han costado tiempo:

- `pkill -f "port 4173"` mata el propio shell; usar el PID del servidor.
- Un `vite preview` con `&` dentro de un comando síncrono no sobrevive; usar un proceso en segundo plano.
- Medir un elemento con `anim-pop` en marcha da tamaños falsos; esperar ~700 ms.
- `data-drop` sin `data-tile`: las fichas se localizan por `button.tile`; el contenedor del número es `[data-drop="crate"]`.
- En construcción, el id de bloque `grass` no tiene archivo propio: usar `blockTex()` (mapea a `grass_top.png`).

## Limitaciones conocidas

- **Sin recursos oficiales de Minecraft** (decisión legal): la estética es homenaje, no copia.
- `TracePad` valida un trazo guiado; no reconoce escritura libre.
- La voz depende de `speechSynthesis` y de las voces del dispositivo; puede no funcionar sin conexión en algunos navegadores.
- La vibración no está disponible en iOS Safari.
- El mundo de construcción es una capa 10×10 (sin profundidad ni capas).
- El progreso es por dispositivo y navegador; no se sincroniza.
- Sin suite de tests automatizada; las comprobaciones fueron manuales y con CDP.

## Próximos pasos razonables

1. **Modo crafteo**: recetas simples (2×2) con los bloques actuales, reutilizando la paleta y el guardado.
2. **Más vida en el mapa**: árboles, animales y pequeñas animaciones; evitar recargar la interfaz.
3. **Prueba en móvil/tablet real**: ajustar snap, tamaños y sonido con dedos de verdad.
4. **Tests Playwright** de las mecánicas críticas (arrastre, trazo, guardado) para no depender de scripts CDP ad hoc.
5. **Accesibilidad**: `aria-live` para instrucciones y celebraciones, revisar contraste de los carteles.
6. **Orientación**: revisar landscape en tablet (el diseño actual prioriza vertical).
