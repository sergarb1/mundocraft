# Recursos gráficos · MundoCraft

## Decisión

MundoCraft **no incluye archivos gráficos de terceros**. Todo el arte es original y se genera en el propio código:

- **Bloques, botones, insignias y el mundo**: CSS (gradientes, sombras duras y texturas de píxel con `repeating-linear-gradient`) y SVG (decoración del mapa, iconos).
- **Pictogramas de los ejercicios** (frutas, animales, objetos): **emoji del sistema**, renderizado por el dispositivo (Noto Color Emoji en Android, Apple Color Emoji en iOS). No se redistribuye ninguna fuente de emoji.
- **Iconos de la app**: `public/icon.svg` y los PNG generados por `scripts/make-icons.mjs` (pixel art propio, dibujado en código).

Motivos:

1. Coherencia visual total entre mapa, juegos y tiendas de aplicaciones.
2. Licencias limpias: no hay que atribuir ni arrastrar condiciones de terceros.
3. Funcionamiento **offline** completo y un paquete pequeño (≈150 kB de JS).
4. El esfuerzo se dedica a los minijuegos, que es el producto.

No se ha utilizado ningún recurso oficial de Minecraft ni material con marca registrada.

## Atribución

No se requiere atribución: el arte y los iconos son originales y los emoji pertenecen al sistema operativo del usuario.

## Fuentes consultadas (CC0 / permisivas)

Si en el futuro se quieren sustituir los bloques procedurales por tilesets, estos son los bancos recomendados y su licencia:

| Fuente | Enlace | Licencia | Uso previsto |
| --- | --- | --- | --- |
| Kenney | <https://kenney.nl/assets> | CC0 1.0 | Tilesets de bloques, UI y personajes |
| Quaternius | <https://quaternius.com> | CC0 1.0 | Packs 3D/2D low-poly y voxel |
| OpenGameArt | <https://opengameart.org> | Variable (comprobar cada pack) | Fondos, tiles y objetos |
| itch.io (assets gratuitos) | <https://itch.io/game-assets/free> | Variable (comprobar cada pack) | Packs de pixel art y fuentes |
| Twemoji (referencia) | <https://github.com/jdecked/twemoji> | CC-BY 4.0 | Emoji consistentes si se empaquetan |

### Cómo integrar un pack

1. Descargar solo recursos **CC0** o permisivos y guardar el archivo de licencia junto al pack.
2. Colocarlos en `src/assets/` (Vite los empaqueta y versiona) o en `public/` si se referencian por URL.
3. Sustituir las clases de bloque (`.tile`, `.cell-*`) por `background-image` con `image-rendering: pixelated`.
4. Añadir la entrada en la tabla de arriba con autor, enlace y licencia.

## Tipografía

Se usa la pila de fuentes del sistema (`ui-rounded`, Trebuchet MS, Segoe UI), sin fuentes web externas, para que la app cargue al instante y funcione sin conexión.

## Paleta

| Color | Uso |
| --- | --- |
| `#7cc243` / `#4c8b24` | Césped del mapa y zona de matemáticas |
| `#ffc93c` / `#f2a91c` | Estrellas, recompensas y pistas |
| `#8b5a2b` | Madera, tierra y botones de sílabas |
| `#9fd6ff` | Cielo, agua y zona de sílabas |
| `#2b2118` | Texto y contornos |

Las animaciones (nubes, flotación, confeti, pulso del punto de inicio) están hechas con CSS y respetan `prefers-reduced-motion`.
