# MundoCraft 🧱

**Juegos educativos infantiles** con estética de bloques. Una aplicación estática, sin cuentas ni backend, pensada para que un niño de 5 años practique matemáticas, letras, escritura, sílabas y palabras **sin instrucciones de un adulto**.

App: **[sergarb1.github.io/mundocraft](https://sergarb1.github.io/mundocraft/)**

## Cómo está pensada

- El **mapa** solo sirve para elegir qué aprender: cuatro zonas grandes, sin movimiento, sin misiones y sin inventarios.
- El producto son los **28 minijuegos**: cada uno tiene una mecánica visual (arrastrar, tocar, ordenar, dibujar) y una instrucción corta, con voz en español.
- Sin vidas, sin cronómetros, sin pantallas de derrota. Los errores se corrigen probando otra vez y las pistas aparecen solas.
- Diseñado primero para **móvil y tablet**: botones grandes (≥ 60 px), `Pointer Events` y **snap** al soltar cerca de una zona, tolerancia amplia al trazar, vibración suave y sin necesidad de zoom.
- Estética de **mundo de bloques** con texturas originales 16×16 (césped, tierra, piedra, tablones, agua…) y sprites CC0 de granja.
- El progreso (estrellas, nivel adaptativo y mundo construido) se guarda en `localStorage`.

## Juegos incluidos

| Zona | Juegos |
| --- | --- |
| 🔢 **Matemáticas** | Los números (1–20) · ¿Cuántos hay? · Cuenta y elige · El puente (contar hacia delante) · Cuenta atrás · En orden · Antes y después · La serie · Sumar · Quitar · Cuentas · Cuenta y dibujo |
| ✏️ **Letras** | La letra (minúsculas) · Parejas mayúscula/minúscula · La letra escondida · Trazos previos · Repasa la letra · Falta un trazo · Escribe sin guía · Sílabas con el dedo |
| 🗣️ **Sílabas** | La sílaba · ¿Con qué empieza? · Falta una sílaba · Las cestas · Construye · En orden · Palabra y dibujo |
| 🧱 **Construir** | Mundo de bloques 10×10 con paleta de 9 materiales y guardado automático |

La dificultad sube sola: cada juego guarda cuántas sesiones llevas y amplía el rango numérico, el número de elementos o el largo de las palabras (3 niveles).

## Escritura con el dedo

El componente `TracePad` dibuja un tipo de letra de un solo trazo (SVG) y comprueba el recorrido con `getPointAtLength`:

- exige empezar cerca del **punto verde** y avanzar en la **dirección** correcta;
- mide la **cobertura** del trazo con una tolerancia generosa (apta para 5 años);
- permite levantar el dedo y continuar, repetir un trazo con ↺ y no reconoce escritura manuscrita libre (no es el objetivo).

## Tecnología

Vue 3 + TypeScript + Vite + Tailwind CSS. Los minijuegos usan componentes Vue, SVG y Pointer Events; no se usa Phaser. Los contenidos (palabras, sílabas, letras) viven en JSON dentro de `src/data/`.

```
src/
  components/     BlockTile, GameShell, TracePad, Celebration, DragGhost
  data/           words.json, syllables.json, letters.json + tipado
  games/
    math/         12 minijuegos
    letters/      8 minijuegos
    syllables/    7 minijuegos
    build/        construcción libre
    registry.ts   catálogo de juegos
  lib/            navegación, progreso, audio, voz, arrastre, trazos
  views/          mapa, sección y contenedor de juego
```

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # dist/
npm run preview   # sirve dist/
npm run icons     # regenera public/icon-192.png y icon-512.png
```

## Despliegue

Cada push a `main` compila y publica `dist/` en GitHub Pages mediante `.github/workflows/deploy.yml`. La app usa `base: './'` y navegación por hash, así que funciona igual en la raíz de un dominio o en un subdirectorio.

## PWA

`manifest.webmanifest` + service worker (`public/sw.js`): instalable y funcional sin conexión tras la primera visita. La voz y los sonidos se pueden silenciar desde el mapa.

## Recursos y licencias

- **Bloques y cubos:** arte original generado en código (`npm run art`).
- **Animales y cultivos:** Kenney · Tiny Farm, **CC0 1.0** (descargado de OpenGameArt).
- **Emoji e iconos:** emoji del sistema + iconos propios.

No se usa ningún recurso oficial de Minecraft. Detalle completo en [ASSETS.md](ASSETS.md).

## Licencia

Código bajo licencia MIT. No se usan recursos oficiales de Minecraft.
