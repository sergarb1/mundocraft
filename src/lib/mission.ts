import type { InjectionKey } from 'vue'

/** Mission mode: a short chain of random minigames. */
export type MissionCtx = {
  done: () => void
}

export const MISSION_KEY: InjectionKey<MissionCtx> = Symbol('mundocraft-mission')
