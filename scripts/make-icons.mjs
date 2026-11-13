/**
 * Generates the PWA icons (192px and 512px) from a 16x16 pixel-art block.
 * No external dependency: raw RGBA rows + zlib deflate + PNG chunks.
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const SKY = [169, 221, 255, 255]
const GRASS = [140, 224, 90, 255]
const GRASS_LIGHT = [179, 240, 125, 255]
const GRASS_DARK = [95, 174, 44, 255]
const DIRT = [165, 113, 63, 255]
const DIRT_DARK = [138, 90, 46, 255]

const ART = [
  'SSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSS',
  'SSLLLLLLLLLLLLSS',
  'SSGGGGGGGGGGGGSS',
  'SSGGGGKGGGGGGGSS',
  'SSDDDDDDDDDDDDSS',
  'SSDDDDDDDDDDDDSS',
  'SSDKKDDDDDDDDDSS',
  'SSDDDDDDDDDKKDSS',
  'SSDDDDDDDDDDDDSS',
  'SSDDKKDDDDDDDDSS',
  'SSDDDDDDDDDKKDSS',
  'SSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSS',
  'SSSSSSSSSSSSSSSS',
]

for (const row of ART) {
  if (row.length !== 16) throw new Error(`Fila de icono inválida: ${row}`)
}
if (ART.length !== 16) throw new Error('El icono debe tener 16 filas')

const PALETTE = {
  S: SKY,
  G: GRASS,
  L: GRASS_LIGHT,
  D: DIRT,
  K: DIRT_DARK,
}

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
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function render(size) {
  const scale = size / 16
  const rgba = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = ART[Math.floor(y / scale)][Math.floor(x / scale)]
      const color = PALETTE[px] ?? SKY
      const offset = (y * size + x) * 4
      rgba[offset] = color[0]
      rgba[offset + 1] = color[1]
      rgba[offset + 2] = color[2]
      rgba[offset + 3] = color[3]
    }
  }
  return encodePng(size, size, rgba)
}

mkdirSync('public', { recursive: true })
for (const size of [192, 512]) {
  writeFileSync(`public/icon-${size}.png`, render(size))
  console.log(`public/icon-${size}.png`)
}
