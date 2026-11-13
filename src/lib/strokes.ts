/**
 * A tiny single-stroke font used for touch tracing (uppercase letters on a
 * 100x100 grid). Each entry is a list of SVG path strings; every path is one
 * stroke the child has to follow, in order.
 */
export const FONT: Record<string, string[]> = {
  A: ['M14 88 L50 12 L86 88', 'M28 62 L72 62'],
  B: [
    'M22 12 L22 88',
    'M22 12 L50 12 Q76 12 76 31 Q76 50 50 50 L22 50',
    'M50 50 Q78 50 78 69 Q78 88 50 88 L22 88',
  ],
  C: ['M80 26 Q70 12 50 12 Q22 12 22 50 Q22 88 50 88 Q70 88 80 74'],
  D: [
    'M24 12 L24 88',
    'M24 12 L46 12 Q80 12 80 50 Q80 88 46 88 L24 88',
  ],
  E: ['M78 12 L22 12 L22 88 L78 88', 'M22 50 L66 50'],
  F: ['M78 12 L22 12 L22 88', 'M22 50 L64 50'],
  G: ['M80 26 Q70 12 50 12 Q22 12 22 50 Q22 88 50 88 Q78 88 78 58 L54 58'],
  H: ['M22 12 L22 88', 'M78 12 L78 88', 'M22 50 L78 50'],
  I: ['M50 12 L50 88', 'M32 12 L68 12', 'M32 88 L68 88'],
  J: ['M68 12 L68 66 Q68 88 48 88 Q30 88 26 70'],
  K: ['M24 12 L24 88', 'M80 12 L30 54', 'M40 46 L82 88'],
  L: ['M24 12 L24 88 L78 88'],
  M: ['M16 88 L16 12 L50 58 L84 12 L84 88'],
  N: ['M20 88 L20 12 L80 88 L80 12'],
  Ñ: ['M20 88 L20 12 L80 88 L80 12', 'M34 3 Q50 11 66 3'],
  O: ['M50 12 Q22 12 22 50 Q22 88 50 88 Q78 88 78 50 Q78 12 50 12'],
  P: ['M24 88 L24 12 L50 12 Q76 12 76 32 Q76 52 50 52 L24 52'],
  Q: [
    'M50 12 Q22 12 22 50 Q22 88 50 88 Q78 88 78 50 Q78 12 50 12',
    'M60 66 L84 90',
  ],
  R: [
    'M24 88 L24 12 L50 12 Q76 12 76 32 Q76 52 50 52 L24 52',
    'M52 52 L82 88',
  ],
  S: ['M80 24 Q68 12 50 12 Q26 12 26 32 Q26 48 50 50 Q78 52 78 70 Q78 88 50 88 Q32 88 22 76'],
  T: ['M14 12 L86 12', 'M50 12 L50 88'],
  U: ['M22 12 L22 58 Q22 88 50 88 Q78 88 78 58 L78 12'],
  V: ['M18 12 L50 88 L82 12'],
  W: ['M12 12 L30 88 L50 36 L70 88 L88 12'],
  X: ['M20 12 L80 88', 'M80 12 L20 88'],
  Y: ['M20 12 L50 50 L80 12', 'M50 50 L50 88'],
  Z: ['M20 12 L80 12 L20 88 L80 88'],
}

export type TraceStroke = {
  d: string
  /** Translation applied to the path, in board units. */
  tx?: number
  ty?: number
  /** Scale applied to the path, in board units. */
  scale?: number
  /** false renders the stroke only as a reference to copy. */
  active?: boolean
}

/** Builds the strokes for one or more letters laid out side by side. */
export function letterStrokes(letters: string, opts: { scale?: number } = {}): TraceStroke[] {
  const chars = [...letters.toUpperCase()]
  if (chars.length === 1) {
    const paths = FONT[chars[0]] ?? []
    return paths.map((d) => ({ d, tx: 0, ty: 0, scale: opts.scale ?? 1 }))
  }
  const scale = opts.scale ?? (chars.length === 2 ? 0.45 : 0.3)
  const step = 100 / chars.length
  const out: TraceStroke[] = []
  chars.forEach((char, i) => {
    const paths = FONT[char] ?? []
    paths.forEach((d) => {
      out.push({ d, tx: i * step + (step - 100 * scale) / 2, ty: 0, scale })
    })
  })
  return out
}

/** Letters that can be split into "complete the missing stroke" puzzles. */
export function lettersWithSeveralStrokes(): string[] {
  return Object.entries(FONT)
    .filter(([, paths]) => paths.length >= 2)
    .map(([letter]) => letter)
}

export type Prewriting = { id: string; label: string; d: string }

export const PREWRITING: Prewriting[] = [
  { id: 'horizontal', label: 'la línea', d: 'M14 50 L86 50' },
  { id: 'vertical', label: 'la línea', d: 'M50 14 L50 86' },
  { id: 'diagonal', label: 'la línea', d: 'M18 82 L82 18' },
  { id: 'curva', label: 'la curva', d: 'M20 74 Q50 14 80 74' },
  { id: 'arco', label: 'el arco', d: 'M22 70 Q22 26 50 26 Q78 26 78 70' },
  { id: 'zigzag', label: 'el zigzag', d: 'M12 72 L30 30 L48 72 L66 30 L84 72' },
  { id: 'ola', label: 'la ola', d: 'M12 62 Q26 34 40 62 Q54 90 68 62 Q78 42 88 54' },
  { id: 'espiral', label: 'la espiral', d: 'M50 50 Q62 40 60 52 Q58 66 44 64 Q28 62 30 46 Q32 26 54 28 Q80 30 78 54 Q76 82 46 82' },
  { id: 'cruz', label: 'la cruz', d: 'M50 16 L50 84' },
]

export const PREWRITING_CROSS = 'M16 50 L84 50'

export const PREWRITING_POOLS: Prewriting[][] = [
  PREWRITING.slice(0, 4),
  PREWRITING.slice(2, 7),
  PREWRITING.slice(4, 9),
]
