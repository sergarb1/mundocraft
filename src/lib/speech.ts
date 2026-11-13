import { progress } from './progress'

let voice: SpeechSynthesisVoice | null = null
let loaded = false

function pickVoice() {
  if (loaded || !('speechSynthesis' in window)) return
  loaded = true
  const voices = window.speechSynthesis.getVoices()
  voice =
    voices.find((v) => v.lang === 'es-ES' && /female|mujer|monica|mónica|helena/i.test(v.name)) ??
    voices.find((v) => v.lang === 'es-ES') ??
    voices.find((v) => v.lang.startsWith('es')) ??
    null
}

if ('speechSynthesis' in window) {
  pickVoice()
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    loaded = false
    pickVoice()
  })
}

export function speak(text: string) {
  if (!progress.settings.voice || !text) return
  if (!('speechSynthesis' in window)) return
  try {
    pickVoice()
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'es-ES'
    utter.rate = 0.92
    utter.pitch = 1.15
    if (voice) utter.voice = voice
    window.speechSynthesis.speak(utter)
  } catch {
    /* voice is a bonus, never a blocker */
  }
}
