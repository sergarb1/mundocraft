# Recursos gráficos · MundoCraft

## Resumen

| Recurso | Origen | Licencia | Archivos |
| --- | --- | --- | --- |
| Bloques y cubos | Generados por `scripts/make-art.mjs` (arte original inspirado en voxel) | Propia / MIT | `public/art/blocks/*.png`, `public/art/cubes/*.png` |
| Animales, cultivos y herramientas | **Kenney · Tiny Farm** | **CC0 1.0** | `public/art/farm/*.png` |
| Pictogramas de interfaz | Emoji del sistema operativo | — | Renderizado por el dispositivo |
| Tipografía escolar | **Andika** (SIL International) | **SIL OFL 1.1** | `src/assets/fonts/andika-*.woff2` |
| Tipografía para dislexia | **OpenDyslexic** (Abbie Gonzalez) | **SIL OFL 1.1** | `src/assets/fonts/opendyslexic-*.woff2` |
| Iconos de la app | `public/icon.svg` + `scripts/make-icons.mjs` | Propia / MIT | `public/icon-*.png` |

No se utiliza **ningún recurso oficial de Minecraft**: ni texturas, ni modelos, ni sonidos, ni la marca. El mundo está hecho con texturas de bloques originales dibujadas en código.

## Texturas de bloques (originales)

Generadas con un script determinista, sin dependencias:

```bash
npm run art   # node scripts/make-art.mjs
```

- **19 texturas 16×16**: `grass_top`, `grass_side`, `dirt`, `stone`, `cobblestone`, `oak_planks`, `oak_log`, `oak_log_top`, `oak_leaves`, `water`, `sand`, `bricks`, `crafting_top`, `bookshelf`, `farmland`, `wheat`, `flower`, `tall_grass`, `gold_block`.
- **14 cubos isométricos 64×64** para carteles y paletas: `grass`, `dirt`, `stone`, `cobblestone`, `oak_planks`, `oak_log`, `oak_leaves`, `water`, `sand`, `bricks`, `gold_block`, `crafting_table`, `bookshelf`, `hay`.
- Se escalan con `image-rendering: pixelated` para conservar el píxel nítido en móvil y tablet.

Colores base: césped `#6fb444`, tierra `#8b5a2b`, piedra `#8c8c8c`, tablones `#b08442`, agua `#3d76c9`, arena `#e3d5a0`, ladrillo `#a5523b`, oro `#f2c94c`.

## Kenney · Tiny Farm (CC0 1.0)

- **Autor:** Kenney (<https://kenney.nl>)
- **Pack:** <https://kenney.nl/assets/tiny-farm>
- **Espejo de descarga utilizado:** <https://opengameart.org/content/tiny-farm>
- **Licencia:** Creative Commons Zero 1.0 — <https://creativecommons.org/publicdomain/zero/1.0/>
  - Uso personal, educativo y comercial permitido.
  - Atribución no obligatoria (se acredita igualmente aquí).
- **Formato:** PNG 16×16 con transparencia, tile size 16.

Sprites usados (índice dentro del tilesheet original de 12 columnas):

| Archivo | Tile | Contenido |
| --- | --- | --- |
| `chicken.png` | `tile_0122` | Gallina |
| `cow.png` | `tile_0121` | Vaca |
| `sheep.png` | `tile_0120` | Oveja |
| `carrot.png` | `tile_0008` | Zanahoria |
| `corn.png` | `tile_0032` | Mazorca de maíz |
| `tomato.png` | `tile_0044` | Tomate |
| `eggplant.png` | `tile_0020` | Berenjena |
| `cabbage.png` | `tile_0054` | Col |
| `potato.png` | `tile_0055` | Patata |
| `sunflower.png` | `tile_0083` | Girasol |
| `wheat_sheaf.png` | `tile_0066` | Gavilla de trigo |
| `pickaxe.png` | `tile_0084` | Pico |
| `axe.png` | `tile_0086` | Hacha |
| `hammer.png` | `tile_0087` | Mazo |

Los archivos copiados conservan el píxel original; el proyecto incluye esta atribución y la licencia CC0 del pack.

## Emoji

El resto de pictogramas de interfaz (🔢, ✏️, 🗣️, 🏠, 🌟…) son emoji renderizados por el sistema (Noto Color Emoji en Android, Apple Color Emoji en iOS). No se redistribuye ninguna fuente.

## Tipografía

La opción **Redonda** usa la pila del sistema (`ui-rounded`, Trebuchet MS, Segoe UI). Las opciones **Escolar** y **Dislexia** usan **Andika** y **OpenDyslexic**, servidas localmente desde `src/assets/fonts/`; no se hace ninguna petición a Google Fonts ni a otro servidor externo.

- **Andika** está diseñada para primeros lectores: formas abiertas, letras distinguibles y trazos sencillos.
- **OpenDyslexic** engrosa la parte inferior de las letras y separa los caracteres para reducir confusiones.
- Ambas se distribuyen bajo **SIL Open Font License 1.1**. Los textos completos están en `src/assets/fonts/OFL-Andika.txt` y `src/assets/fonts/OFL-OpenDyslexic.txt`.
- El panel **Aa** permite elegir letra y tres tamaños de texto; la preferencia se guarda con el resto del progreso local.

## Cómo sustituir o ampliar el arte

1. Añadir el PNG a `public/art/blocks` (16×16) o `public/art/farm` (16×16).
2. Registrarlo en `src/lib/art.ts` (o en `scripts/make-art.mjs` si es procedural).
3. Añadirlo a `ART` en `public/sw.js` para que quede disponible offline.
4. Documentar autor, enlace y licencia en este archivo.

Recursos CC0 recomendados si se quiere ampliar: [Kenney](https://kenney.nl/assets) (CC0), [Quaternius](https://quaternius.com) (CC0), [OpenGameArt](https://opengameart.org) (comprobar licencia por pack). No usar material oficial de Minecraft ni packs derivados de sus texturas.
