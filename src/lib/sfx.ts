import { progress } from './progress'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (!progress.settings.sound) return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone(freq: number, start: number, duration: number, gain = 0.12, type: OscillatorType = 'sine') {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const vol = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + start)
  vol.gain.setValueAtTime(0.0001, ac.currentTime + start)
  vol.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.015)
  vol.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration)
  osc.connect(vol).connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + duration + 0.05)
}

function buzz(pattern: number | number[]) {
  if (!progress.settings.sound) return
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* vibración no disponible */
  }
}

export const sfx = {
  tap() {
    tone(520, 0, 0.08, 0.06, 'triangle')
    buzz(8)
  },
  correct() {
    tone(660, 0, 0.12, 0.11, 'triangle')
    tone(880, 0.1, 0.16, 0.1, 'triangle')
    buzz([10, 30, 10])
  },
  wrong() {
    tone(220, 0, 0.16, 0.08, 'sawtooth')
    tone(180, 0.12, 0.18, 0.07, 'sine')
    buzz(30)
  },
  win() {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, 0.12, 'triangle'))
    buzz([10, 40, 10, 40, 20])
  },
  drop() {
    tone(340, 0, 0.1, 0.08, 'square')
    buzz(10)
  },
}
