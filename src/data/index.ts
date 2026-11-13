import wordsRaw from './words.json'
import syllablesRaw from './syllables.json'
import lettersRaw from './letters.json'

export type Word = { word: string; parts: string[]; emoji: string }

export const WORDS = wordsRaw as Word[]
export const FAMILIES = syllablesRaw.families as string[][]
export const TRACE_SYLLABLES = syllablesRaw.trace as string[]
export const LOWERCASE = lettersRaw.lowercase as string[]
export const LETTER_NAMES = lettersRaw.names as Record<string, string>
export const SIMILAR = lettersRaw.similar as string[][]
export const STRAIGHT_LETTERS = lettersRaw.straight as string[]
export const CURVY_LETTERS = lettersRaw.curvy as string[]

/** A friendly example word and picture for each letter. */
export const LETTER_WORDS: Record<string, { word: string; emoji: string }> = {
  A: { word: 'Abeja', emoji: '🐝' },
  B: { word: 'Barco', emoji: '⛵' },
  C: { word: 'Casa', emoji: '🏠' },
  D: { word: 'Dado', emoji: '🎲' },
  E: { word: 'Elefante', emoji: '🐘' },
  F: { word: 'Flor', emoji: '🌸' },
  G: { word: 'Gato', emoji: '🐱' },
  H: { word: 'Hielo', emoji: '🧊' },
  I: { word: 'Isla', emoji: '🏝️' },
  J: { word: 'Jirafa', emoji: '🦒' },
  K: { word: 'Koala', emoji: '🐨' },
  L: { word: 'Luna', emoji: '🌙' },
  M: { word: 'Mamá', emoji: '👩' },
  N: { word: 'Nube', emoji: '☁️' },
  Ñ: { word: 'Ñu', emoji: '🦬' },
  O: { word: 'Oso', emoji: '🐻' },
  P: { word: 'Pato', emoji: '🦆' },
  Q: { word: 'Queso', emoji: '🧀' },
  R: { word: 'Ratón', emoji: '🐭' },
  S: { word: 'Sol', emoji: '☀️' },
  T: { word: 'Tigre', emoji: '🐯' },
  U: { word: 'Uva', emoji: '🍇' },
  V: { word: 'Vaca', emoji: '🐮' },
  W: { word: 'Wafle', emoji: '🧇' },
  X: { word: 'Xilófono', emoji: '🎶' },
  Y: { word: 'Yate', emoji: '🛥️' },
  Z: { word: 'Zapato', emoji: '👟' },
}

/** Every word usable in syllable games (they must have syllables). */
export const SYLLABLE_WORDS = WORDS.filter((w) => w.parts.length >= 2)

export const SIMPLE_WORDS = WORDS.filter(
  (w) => w.parts.length >= 2 && w.parts.every((p) => p.length <= 3),
)
