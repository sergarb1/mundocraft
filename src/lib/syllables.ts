import { FAMILIES, TRACE_SYLLABLES, type Word } from '../data'
import { pick, shuffle } from './rand'

export function siblingsOf(syllable: string): string[] {
  const family = FAMILIES.find((fam) => fam.includes(syllable))
  return family ? family.filter((s) => s !== syllable) : []
}

export function randomSyllables(count: number, exclude: string[] = []): string[] {
  return shuffle(TRACE_SYLLABLES.filter((s) => !exclude.includes(s))).slice(0, count)
}

export function wordsByFirstSyllable(words: Word[]): Map<string, Word[]> {
  const map = new Map<string, Word[]>()
  for (const word of words) {
    const first = word.parts[0]
    const list = map.get(first) ?? []
    list.push(word)
    map.set(first, list)
  }
  return map
}

/** Splits a syllable string like "MA" into its letters for tracing. */
export function syllableLetters(syllable: string): string {
  return syllable.replace(/[^A-ZÁÉÍÓÚÑ]/g, '')
}

export function pickSyllableWord(words: Word[], syllables: number): Word {
  const filtered = words.filter((w) => w.parts.length === syllables)
  return pick(filtered.length ? filtered : words)
}
