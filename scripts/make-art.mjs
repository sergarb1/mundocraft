/**
 * Genera el arte de bloques de MundoCraft: texturas 16x16 originales con aire
 * voxel/Minecraft y versiones isométricas para carteles y paletas.
 * No usa ningún recurso oficial de Minecraft.
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

/* ------------------------------ PNG encoder ------------------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let crc = 0xffffffff
  for (let i = 0; i < buffer.length; i++) crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, crc])
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* -------------------------------- helpers -------------------------------- */

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)))

function hex(value) {
  const n = parseInt(value.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255]
}

function shade(color, factor) {
  return [clamp(color[0] * factor), clamp(color[1] * factor), clamp(color[2] * factor), color[3] ?? 255]
}

function img(size = 16) {
  return { size, data: new Uint8Array(size * size * 4) }
}

function put(image, x, y, color) {
  if (x < 0 || y < 0 || x >= image.size || y >= image.size) return
  const offset = (y * image.size + x) * 4
  image.data[offset] = color[0]
  image.data[offset + 1] = color[1]
  image.data[offset + 2] = color[2]
  image.data[offset + 3] = color[3] ?? 255
}

function fill(image, color) {
  for (let y = 0; y < image.size; y++) for (let x = 0; x < image.size; x++) put(image, x, y, color)
}

const ri = (rnd, min, max) => min + Math.floor(rnd() * (max - min + 1))

/* ------------------------------- textures -------------------------------- */

const GRASS = hex('#6fb444')
const GRASS_LIGHT = hex('#82cf55')
const GRASS_DARK = hex('#5d9c37')
const DIRT = hex('#8b5a2b')
const DIRT_DARK = hex('#74491f')
const DIRT_LIGHT = hex('#9c6a38')

function paintGrass(image, rnd) {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const r = rnd()
      const color = r < 0.1 ? GRASS_LIGHT : r < 0.26 ? GRASS_DARK : r < 0.32 ? shade(GRASS, 1.12) : GRASS
      put(image, x, y, color)
    }
  }
  for (let i = 0; i < 5; i++) {
    const x = ri(rnd, 1, 14)
    const y = ri(rnd, 1, 13)
    put(image, x, y, GRASS_DARK)
    put(image, x, y + 1, GRASS_DARK)
  }
}

function paintDirt(image, rnd) {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const r = rnd()
      const color = r < 0.2 ? DIRT_DARK : r < 0.36 ? DIRT_LIGHT : DIRT
      put(image, x, y, color)
    }
  }
  for (let i = 0; i < 5; i++) {
    const x = ri(rnd, 0, 15)
    const y = ri(rnd, 0, 15)
    put(image, x, y, shade(DIRT_DARK, 0.9))
  }
}

function grassSide(rnd) {
  const image = img()
  paintDirt(image, rnd)
  for (let x = 0; x < 16; x++) {
    const depth = 3 + Math.floor(rnd() * 3)
    for (let y = 0; y < depth; y++) {
      put(image, x, y, y === 0 ? GRASS_LIGHT : y === depth - 1 ? GRASS_DARK : GRASS)
    }
    put(image, x, depth, shade(DIRT_DARK, 0.85))
  }
  return image
}

function stone(rnd) {
  const image = img()
  const base = hex('#8c8c8c')
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const r = rnd()
      put(image, x, y, r < 0.2 ? shade(base, 0.9) : r < 0.4 ? shade(base, 1.08) : base)
    }
  }
  for (let i = 0; i < 3; i++) {
    let x = ri(rnd, 1, 13)
    let y = ri(rnd, 1, 13)
    for (let k = 0; k < 4; k++) {
      put(image, x, y, shade(base, 0.72))
      x += rnd() > 0.5 ? 1 : 0
      y += 1
    }
  }
  return image
}

function cobblestone(rnd) {
  const image = img()
  const mortar = hex('#5f5f5f')
  fill(image, mortar)
  const centers = []
  for (let gy = 0; gy < 3; gy++) {
    for (let gx = 0; gx < 3; gx++) {
      centers.push({ x: gx * 5 + 3 + ri(rnd, -1, 1), y: gy * 5 + 3 + ri(rnd, -1, 1) })
    }
  }
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let best = null
      let bestD = Infinity
      for (const center of centers) {
        const d = Math.hypot(x - center.x, (y - center.y) * 1.15)
        if (d < bestD) {
          bestD = d
          best = center
        }
      }
      if (bestD < 2.9) {
        const base = hex('#9a9a9a')
        const light = y < best.y ? 1.12 : y > best.y + 1 ? 0.88 : 1
        put(image, x, y, shade(base, light * (0.96 + rnd() * 0.08)))
      }
    }
  }
  return image
}

function planks(rnd) {
  const image = img()
  const base = hex('#b08442')
  for (let y = 0; y < 16; y++) {
    const row = Math.floor(y / 4)
    const rowShade = 0.94 + (row % 2) * 0.06
    for (let x = 0; x < 16; x++) {
      let color = shade(base, rowShade * (0.97 + rnd() * 0.06))
      if (y % 4 === 3) color = shade(base, 0.62)
      if (x === 3 + ((row * 5) % 11)) color = shade(base, 0.72)
      put(image, x, y, color)
    }
  }
  put(image, 11, 6, shade(base, 0.7))
  put(image, 12, 6, shade(base, 0.7))
  put(image, 11, 7, shade(base, 0.8))
  return image
}

function logSide(rnd) {
  const image = img()
  const base = hex('#6b4f2a')
  for (let x = 0; x < 16; x++) {
    const band = Math.floor(x / 2) % 3
    for (let y = 0; y < 16; y++) {
      let color = shade(base, 0.9 + band * 0.08 + (rnd() - 0.5) * 0.05)
      if (x % 4 === 0) color = shade(base, 0.72)
      put(image, x, y, color)
    }
  }
  for (let i = 0; i < 2; i++) {
    const x = ri(rnd, 2, 12)
    const y = ri(rnd, 2, 11)
    put(image, x, y, shade(base, 0.6))
    put(image, x + 1, y, shade(base, 0.6))
    put(image, x, y + 1, shade(base, 0.7))
  }
  return image
}

function logTop(rnd) {
  const image = img()
  const base = hex('#b98a53')
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - 7.5, y - 7.5)
      const ring = Math.floor(d / 1.6) % 2
      let color = ring ? shade(base, 0.86) : shade(base, 1.02)
      if (d > 6.8) color = hex('#6b4f2a')
      put(image, x, y, color)
    }
  }
  return image
}

function leaves(rnd) {
  const image = img()
  const base = hex('#3f7a2e')
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const r = rnd()
      put(image, x, y, r < 0.25 ? shade(base, 1.22) : r < 0.5 ? shade(base, 0.8) : base)
    }
  }
  for (let i = 0; i < 6; i++) {
    const x = ri(rnd, 0, 15)
    const y = ri(rnd, 0, 15)
    put(image, x, y, [0, 0, 0, 0])
  }
  return image
}

function water(rnd) {
  const image = img()
  const base = hex('#3d76c9')
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const wave = Math.sin(x * 0.55 + y * 0.35)
      let color = wave > 0.55 ? hex('#4a86dd') : wave < -0.55 ? hex('#33639f') : base
      if (rnd() < 0.04) color = hex('#7fb4ff')
      put(image, x, y, color)
    }
  }
  return image
}

function sand(rnd) {
  const image = img()
  const base = hex('#e3d5a0')
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const r = rnd()
      put(image, x, y, r < 0.18 ? hex('#d4c288') : r < 0.34 ? hex('#f0e3b5') : base)
    }
  }
  return image
}

function bricks(rnd) {
  const image = img()
  fill(image, hex('#cbc3b3'))
  for (let y = 0; y < 16; y++) {
    const row = Math.floor(y / 4)
    const offset = (row % 2) * 4
    for (let x = 0; x < 16; x++) {
      if (y % 4 === 0) continue
      if ((x + offset) % 8 === 0) continue
      const base = hex('#a5523b')
      put(image, x, y, shade(base, 0.92 + rnd() * 0.14))
    }
  }
  return image
}

function craftingTop(rnd) {
  const image = planks(rnd)
  for (let i = 0; i < 16; i++) {
    put(image, i, 0, hex('#4b3319'))
    put(image, i, 15, hex('#4b3319'))
    put(image, 0, i, hex('#4b3319'))
    put(image, 15, i, hex('#4b3319'))
  }
  for (const p of [5, 10]) {
    for (let i = 1; i < 15; i++) {
      put(image, p, i, hex('#6a4a24'))
      put(image, i, p, hex('#6a4a24'))
    }
  }
  return image
}

function bookshelf(rnd) {
  const image = planks(rnd)
  const bookColors = ['#c4544a', '#4f7dc4', '#5aa34f', '#d9a33c', '#8a5ab5']
  for (let i = 0; i < 16; i++) {
    put(image, i, 0, hex('#6b4a24'))
    put(image, i, 1, hex('#6b4a24'))
    put(image, i, 14, hex('#6b4a24'))
    put(image, i, 15, hex('#6b4a24'))
  }
  for (const shelfY of [3, 9]) {
    let x = 1
    while (x < 15) {
      const width = ri(rnd, 1, 2)
      const color = hex(bookColors[ri(rnd, 0, bookColors.length - 1)])
      const top = shelfY + ri(rnd, 0, 1)
      for (let bx = x; bx < Math.min(15, x + width); bx++) {
        for (let by = top; by < shelfY + 5; by++) {
          put(image, bx, by, by === top ? shade(color, 1.25) : color)
        }
      }
      x += width + 1
    }
  }
  return image
}

function farmland(rnd) {
  const image = img()
  const base = hex('#6e4a26')
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      put(image, x, y, shade(base, 0.94 + rnd() * 0.12))
    }
  }
  for (const y of [2, 7, 12]) {
    for (let x = 0; x < 16; x++) put(image, x, y, shade(base, 0.7))
  }
  return image
}

function wheat(rnd) {
  const image = img()
  // fondo transparente
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) put(image, x, y, [0, 0, 0, 0])
  const stalk = hex('#d9a83c')
  const light = hex('#f0cb63')
  for (const baseX of [2, 7, 12]) {
    for (let y = 5; y < 16; y++) put(image, baseX, y, stalk)
    for (let y = 5; y < 13; y += 2) {
      put(image, baseX - 1, y, light)
      put(image, baseX + 1, y, light)
      put(image, baseX - 1, y + 1, shade(stalk, 0.85))
      put(image, baseX + 1, y + 1, shade(stalk, 0.85))
    }
    put(image, baseX, 4, light)
  }
  return image
}

function flower(rnd) {
  const image = img()
  paintGrass(image, rnd)
  for (let y = 9; y < 15; y++) put(image, 8, y, hex('#3f7a2e'))
  put(image, 7, 12, hex('#4f8f38'))
  put(image, 9, 13, hex('#4f8f38'))
  const red = hex('#e0554f')
  for (const [x, y] of [[7, 6], [9, 6], [7, 8], [9, 8], [8, 5], [8, 9]]) put(image, x, y, red)
  put(image, 8, 7, hex('#f2c94c'))
  return image
}

function tallGrass(rnd) {
  const image = img()
  paintGrass(image, rnd)
  for (let i = 0; i < 7; i++) {
    const x = ri(rnd, 1, 14)
    const y = ri(rnd, 6, 13)
    const h = ri(rnd, 2, 4)
    for (let k = 0; k < h; k++) put(image, x, y - k, hex('#4f8f38'))
  }
  return image
}

function gold(rnd) {
  const image = img()
  const base = hex('#f2c94c')
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let factor = 1
      if (x < 2 || y < 2) factor = 1.16
      if (x > 13 || y > 13) factor = 0.82
      if ((x + y) % 7 === 0) factor *= 1.08
      put(image, x, y, shade(base, factor * (0.97 + rnd() * 0.06)))
    }
  }
  return image
}

/* ------------------------------- iso cubes -------------------------------- */

const CUBE = 64
const TOP_FACE = [[32, 4], [62, 20], [32, 36], [2, 20]]
const LEFT_FACE = [[2, 20], [32, 36], [32, 61], [2, 45]]
const RIGHT_FACE = [[62, 20], [32, 36], [32, 61], [62, 45]]

function inPoly(x, y, points) {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i]
    const [xj, yj] = points[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function cube(spec) {
  const data = Buffer.alloc(CUBE * CUBE * 4)
  const rnd = mulberry32(spec.seed ?? 7)
  const set = (x, y, color) => {
    const offset = (y * CUBE + x) * 4
    data[offset] = clamp(color[0])
    data[offset + 1] = clamp(color[1])
    data[offset + 2] = clamp(color[2])
    data[offset + 3] = color[3] ?? 255
  }

  for (let y = 0; y < CUBE; y++) {
    for (let x = 0; x < CUBE; x++) {
      if (inPoly(x, y, LEFT_FACE)) {
        const edge = 20 + ((x - 2) / 30) * 16
        const fringe = spec.fringe && y < edge + spec.fringeDepth
        set(x, y, fringe ? shade(spec.fringe, 0.92 + rnd() * 0.12) : shade(spec.left, 0.82 + rnd() * 0.1))
        continue
      }
      if (inPoly(x, y, RIGHT_FACE)) {
        const edge = 20 + ((62 - x) / 30) * 16
        const fringe = spec.fringe && y < edge + spec.fringeDepth
        set(x, y, fringe ? shade(spec.fringe, 0.78 + rnd() * 0.1) : shade(spec.right, 0.62 + rnd() * 0.1))
        continue
      }
      if (inPoly(x, y, TOP_FACE)) {
        let factor = 1
        if (spec.topGlow) factor = 1.07
        set(x, y, shade(spec.top, factor * (0.94 + rnd() * 0.12)))
      }
    }
  }

  // borde oscuro tipo sticker, igual que los sprites de Kenney
  const outline = [43, 32, 20, 255]
  const copy = Buffer.from(data)
  for (let y = 1; y < CUBE - 1; y++) {
    for (let x = 1; x < CUBE - 1; x++) {
      const alpha = copy[(y * CUBE + x) * 4 + 3]
      if (alpha !== 0) continue
      const neighbors = [
        copy[((y - 1) * CUBE + x) * 4 + 3],
        copy[((y + 1) * CUBE + x) * 4 + 3],
        copy[(y * CUBE + x - 1) * 4 + 3],
        copy[(y * CUBE + x + 1) * 4 + 3],
      ]
      if (neighbors.some((a) => a !== 0)) set(x, y, outline)
    }
  }
  return { width: CUBE, height: CUBE, data }
}

/* --------------------------------- output -------------------------------- */

const textures = {
  grass_top: (rnd) => {
    const image = img()
    paintGrass(image, rnd)
    return image
  },
  grass_side: grassSide,
  dirt: (rnd) => {
    const image = img()
    paintDirt(image, rnd)
    return image
  },
  stone,
  cobblestone,
  oak_planks: planks,
  oak_log: logSide,
  oak_log_top: logTop,
  oak_leaves: leaves,
  water,
  sand,
  bricks,
  crafting_top: craftingTop,
  bookshelf,
  farmland,
  wheat,
  flower,
  tall_grass: tallGrass,
  gold_block: gold,
}

mkdirSync('public/art/blocks', { recursive: true })
mkdirSync('public/art/cubes', { recursive: true })

let seed = 100
for (const [name, painter] of Object.entries(textures)) {
  const image = painter(mulberry32(seed++))
  writeFileSync(`public/art/blocks/${name}.png`, encodePng(16, 16, Buffer.from(image.data)))
}

const cubeSpecs = {
  grass: {
    top: hex('#79c04e'),
    left: DIRT,
    right: DIRT,
    fringe: hex('#6fb444'),
    fringeDepth: 5,
    topGlow: true,
    seed: 11,
  },
  dirt: { top: DIRT_LIGHT, left: DIRT, right: DIRT, seed: 12 },
  stone: { top: hex('#9a9a9a'), left: hex('#8c8c8c'), right: hex('#8c8c8c'), seed: 13 },
  cobblestone: { top: hex('#a5a5a5'), left: hex('#8f8f8f'), right: hex('#8f8f8f'), seed: 14 },
  oak_planks: { top: hex('#c09050'), left: hex('#b08442'), right: hex('#b08442'), seed: 15 },
  oak_log: { top: hex('#bb8b52'), left: hex('#6b4f2a'), right: hex('#6b4f2a'), seed: 16 },
  oak_leaves: { top: hex('#4b8b36'), left: hex('#3f7a2e'), right: hex('#3f7a2e'), seed: 17 },
  water: { top: hex('#5a93e0'), left: hex('#3d76c9'), right: hex('#3d76c9'), seed: 18 },
  sand: { top: hex('#eee0b3'), left: hex('#e3d5a0'), right: hex('#e3d5a0'), seed: 19 },
  bricks: { top: hex('#b75f47'), left: hex('#a5523b'), right: hex('#a5523b'), seed: 20 },
  gold_block: { top: hex('#ffd968'), left: hex('#f2c94c'), right: hex('#f2c94c'), topGlow: true, seed: 21 },
  crafting_table: {
    top: hex('#c09050'),
    left: hex('#b08442'),
    right: hex('#8a6231'),
    seed: 22,
  },
  bookshelf: {
    top: hex('#c09050'),
    left: hex('#7d5a2e'),
    right: hex('#7d5a2e'),
    seed: 23,
  },
  hay: { top: hex('#e8c765'), left: hex('#d4af47'), right: hex('#c09c38'), seed: 24 },
}

for (const [name, spec] of Object.entries(cubeSpecs)) {
  const result = cube(spec)
  writeFileSync(`public/art/cubes/${name}.png`, encodePng(result.width, result.height, result.data))
}

// Libro de estilo para depurar el arte generado
console.log(`texturas: ${Object.keys(textures).length}`)
console.log(`cubos: ${Object.keys(cubeSpecs).length}`)
