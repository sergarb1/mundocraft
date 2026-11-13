import { ref } from 'vue'
import type { ReadingFont, ReadingSize } from './progress'

export type FontOption = {
  id: ReadingFont
  name: string
  note: string
}

export type SizeOption = {
  id: ReadingSize
  name: string
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'redonda', name: 'Redonda', note: 'Alegre' },
  { id: 'escolar', name: 'Escolar', note: 'Para aprender' },
  { id: 'dislexia', name: 'Dislexia', note: 'Más clara' },
]

export const SIZE_OPTIONS: SizeOption[] = [
  { id: 'pequena', name: 'Pequeña' },
  { id: 'normal', name: 'Normal' },
  { id: 'grande', name: 'Grande' },
]

export const readingOpen = ref(false)

export function openReading() {
  readingOpen.value = true
}

export function closeReading() {
  readingOpen.value = false
}
