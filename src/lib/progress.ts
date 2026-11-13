import { computed, reactive, watch } from 'vue'

const KEY = 'mundocraft.progress.v1'

type ProgressData = {
  plays: Record<string, number>
  stars: Record<string, number>
  build: string | null
  settings: { voice: boolean; sound: boolean }
}

function defaults(): ProgressData {
  return { plays: {}, stars: {}, build: null, settings: { voice: true, sound: true } }
}

function load(): ProgressData {
  const base = defaults()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<ProgressData>
    return {
      plays: saved.plays ?? {},
      stars: saved.stars ?? {},
      build: saved.build ?? null,
      settings: { ...base.settings, ...(saved.settings ?? {}) },
    }
  } catch {
    return base
  }
}

export const progress = reactive<ProgressData>(load())

watch(
  progress,
  () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress))
    } catch {
      /* storage may be full or blocked */
    }
  },
  { deep: true },
)

/** Difficulty grows with the number of sessions played. */
export function levelOf(id: string): 1 | 2 | 3 {
  const plays = progress.plays[id] ?? 0
  if (plays >= 5) return 3
  if (plays >= 2) return 2
  return 1
}

/** Records a finished session. Stars are a 3-level mastery medal. */
export function completeSession(id: string) {
  progress.plays[id] = (progress.plays[id] ?? 0) + 1
  progress.stars[id] = Math.min(3, (progress.stars[id] ?? 0) + 1)
}

export const totalStars = computed(() =>
  Object.values(progress.stars).reduce((sum, n) => sum + n, 0),
)

export function sectionStars(ids: string[]) {
  return ids.reduce((sum, id) => sum + (progress.stars[id] ?? 0), 0)
}

export function toggleSound() {
  progress.settings.sound = !progress.settings.sound
}

export function toggleVoice() {
  progress.settings.voice = !progress.settings.voice
}
