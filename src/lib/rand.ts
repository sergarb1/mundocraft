export function ri(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

export function shuffle<T>(list: readonly T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function sample<T>(list: readonly T[], count: number): T[] {
  return shuffle(list).slice(0, count)
}

export function range(min: number, max: number): number[] {
  const out: number[] = []
  for (let n = min; n <= max; n++) out.push(n)
  return out
}

/** Picks `count` distractors near `value`, inside 1..max, avoiding `used`. */
export function nearbyDistractors(value: number, count: number, max: number, used: number[] = []): number[] {
  const candidates = shuffle(range(1, max)).filter((n) => n !== value && !used.includes(n))
  const near = candidates.filter((n) => Math.abs(n - value) <= 3)
  const rest = candidates.filter((n) => Math.abs(n - value) > 3)
  return [...near, ...rest].slice(0, count)
}
