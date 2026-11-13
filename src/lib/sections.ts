import type { SectionId } from './nav'

export type SectionMeta = {
  name: string
  sub: string
  emoji: string
  tone: string
  pixels: string[]
}

export const SECTION_META: Record<SectionId, SectionMeta> = {
  math: {
    name: 'Matemáticas',
    sub: 'Números, contar y sumar',
    emoji: '🔢',
    tone: 'grass',
    pixels: ['1', '2', '3', '+'],
  },
  letters: {
    name: 'Letras',
    sub: 'Letras y escritura',
    emoji: '✏️',
    tone: 'wood',
    pixels: ['A', 'b', 'C', 'd'],
  },
  syllables: {
    name: 'Sílabas',
    sub: 'Sílabas y palabras',
    emoji: '🗣️',
    tone: 'sky',
    pixels: ['MA', 'PA', 'LA', 'SA'],
  },
  build: {
    name: 'Construir',
    sub: 'Construcción libre',
    emoji: '🧱',
    tone: 'stone',
    pixels: ['🟫', '🟩', '🟦', '🟨'],
  },
}
