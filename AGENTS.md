# AGENTS.md · Guía para agentes

Instrucciones para trabajar en **MundoCraft**, una app estática de juegos educativos para niños de ~5 años. La interfaz, los contenidos y los commits están en **español**.

- App: <https://sergarb1.github.io/mundocraft/>
- Repo: <https://github.com/sergarb1/mundocraft>
- Estado y traspaso: [HANDSOFF.md](HANDSOFF.md) · Arte y licencias: [ASSETS.md](ASSETS.md)

## Comandos

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # dist/
npm run preview   # sirve dist/
npm run art       # regenera texturas y cubos en public/art/
npm run icons     # regenera iconos PWA
```

Node 22 en CI. No hay tests automatizados en el repo: la verificación es `npm run build` + pruebas manuales/CDP (ver abajo).

## Reglas del producto (no romper)

- **Sin vidas, cronómetros ni pantallas de derrota.** Un error solo invita a probar otra vez.
- **Sin instrucciones de adulto.** Cada ronda se entiende por la imagen, una frase corta y la voz.
- **Móvil/tablet primero.** Objetivos táctiles ≥ 60 px, `Pointer Events` (no `click`), sin scroll horizontal, sin zoom.
- **Progreso local.** `localStorage` (`mundocraft.progress.v1`); nada de backend, cuentas ni red.
- **Dificultad adaptativa.** `useGame` hace 7 rondas por sesión; `levelOf` sube a nivel 2 a las 2 sesiones y a 3 a las 5. Las estrellas se acumulan hasta 3 por juego.
- **Idioma:** español de España, tono cercano, sin jerga técnica ni mayúsculas gritadas.

## Arquitectura

```
src/
  main.ts            monta la app y registra el SW en producción
  App.vue            elige mapa / sección / juego
  views/             WorldMap, SectionView, GameView
  games/registry.ts  catálogo de los 31 juegos (id, zona, nombre, componente)
  games/<zona>/      math (12), letters (8), syllables (7), build (1)
  components/        GameShell, BlockTile, TracePad, Celebration, DragGhost, Pictogram
  lib/               nav (hash), progress, game (bucle), drag, strokes, speech, sfx, art, rand
  data/              words.json, syllables.json, letters.json + tipado
```

- Navegación por **hash** (`#/math/m-cantidad`, `#/build`) y `base: './'` para funcionar en GitHub Pages sin router.
- Cada juego declara `useGame(id, rondas, make)` y pinta su ronda dentro de `<GameShell>`; `solve()` avanza y `miss()` solo suena.
- Los `id` de juego son **estables**: son la clave del progreso guardado. No renombrar sin migrar `localStorage`.

### Añadir un minijuego

1. Crear `src/games/<zona>/Xxx.vue` con `GameShell` + `useGame`.
2. Registrarlo en `src/games/registry.ts` con un `id` nuevo y estable.
3. Usar `<Pictogram name="…">` para objetos de granja; no introducir emojis nuevos si hay sprite.
4. `npm run build` y probar la ronda en 390×844.

## Arte

- **Prohibido usar recursos oficiales de Minecraft** (texturas, modelos, sonidos, fuentes o la marca). La estética es original inspirada en vóxel.
- Texturas 16×16 y cubos isométricos se generan con `scripts/make-art.mjs`; los sprites de animales/cultivos son de **Kenney Tiny Farm, CC0**.
- Helpers en `src/lib/art.ts`: `tex()`, `blockTex()` (mapea `grass` → `grass_top`), `cubeArt()`, `farmArt()`, `FARM_ITEMS`.
- Al añadir arte: incluir el PNG, registrarlo en `art.ts`, añadirlo a `ART` en `public/sw.js` y documentarlo en `ASSETS.md`.
- Escalar siempre con `image-rendering: pixelated`; no interpolar pixel art.

## Táctil

- `src/lib/drag.ts`: arrastre con umbral de 7 px; al soltar hace **snap** a la zona `[data-drop]` más cercana (≤ 52 px). Tocar una ficha la selecciona y permite tocar el destino; **tocar la ficha ya seleccionada la deselecciona**.
- Mientras hay selección, `DragGhost` pone `body.has-selection`, que resalta todos los `[data-drop]` con `outline` dorado.
- `TracePad`: tolerancia 9 px, cobertura 0,85; exige empezar en el punto verde y avanzar en la dirección correcta. No es reconocimiento de escritura libre.
- `sfx`: WebAudio + `navigator.vibrate` (tap 8 ms, acierto `[10,30,10]`, error 30, victoria `[10,40,10,40,20]`). La vibración es opcional y puede no existir (iOS).

## PWA y despliegue

- `public/sw.js` cachea el shell y `ART`; estrategia network-first para navegación y cache-first para estáticos.
- **Subir `CACHE` (`mundocraft-vN`) al cambiar el shell o los assets**, o los usuarios verán la versión anterior.
- Cada push a `main` despliega `dist/` con `.github/workflows/deploy.yml`. No cambiar `base: './'` ni la navegación por hash sin un motivo fuerte.

## Verificación mínima

```bash
npm run build
```

Para probar en tamaño móvil, servir `dist` y usar Chrome headless:

```bash
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort   # dejar como servicio en segundo plano
google-chrome --headless=new --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=390,844 \
  --virtual-time-budget=7000 --screenshot=/tmp/map.png http://127.0.0.1:4173/
```

Trampas conocidas:

- Chrome headless **muere al terminar el comando**; lánzalo y ejecuta el script CDP en el mismo comando.
- `pkill -f "port 4173"` puede matar el propio shell (el patrón coincide con el comando); matar por PID.
- El `vite preview` lanzado con `&` dentro de un comando síncrono no sobrevive; usar un proceso en segundo plano.
- Un service worker antiguo puede servir el shell viejo: usa un perfil de Chrome limpio o sube la versión de caché.
- Las animaciones (`anim-pop`, `anim-float`) deforman `getBoundingClientRect`; espera ~700 ms antes de medir.

Comprobaciones que han detectado fallos reales: `overflowX`, carteles que desbordan, `img.naturalWidth > 0`, `backgroundImage` con HTTP 200, snap soltando 30 px fuera de la caja y doble toque de deselección.

## Convenciones

- TypeScript estricto, Composition API con `<script setup>`, estilos globales en `src/style.css` y utilidades Tailwind en plantilla.
- Componentes y variables en inglés; textos visibles en español.
- Commits en estilo `feat:`, `fix:` o `docs:`, en español y describiendo el porqué.
- No commitear `node_modules/`, `dist/` ni capturas temporales.
- No añadir dependencias, backend ni fuentes externas sin necesidad demostrable. Las tipografías de lectura se sirven localmente desde `src/assets/fonts/`.
