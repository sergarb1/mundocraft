import type { InjectionKey } from 'vue'

/** Mission mode: a short chain of random minigames. */
export type MissionLevel = 1 | 2 | 3
export type MissionRankId = 'madera' | 'piedra' | 'hierro' | 'diamante'

export type MissionRank = {
  id: MissionRankId
  name: string
  emoji: string
  desc: string
  /** Test types available at this rank. */
  tier: MissionLevel
  /** Internal difficulty used by each minigame. */
  level: MissionLevel
}

/**
 * Minecraft-style progression. Piedra and Hierro share the mid-tier test
 * types, but Hierro generates harder rounds; Diamante only offers hard types.
 */
export const MISSION_RANKS: MissionRank[] = [
  {
    id: 'madera',
    name: 'Madera',
    emoji: '🪵',
    desc: 'Pruebas sencillas para empezar',
    tier: 1,
    level: 1,
  },
  {
    id: 'piedra',
    name: 'Piedra',
    emoji: '🪨',
    desc: 'Pruebas con más truco',
    tier: 2,
    level: 1,
  },
  {
    id: 'hierro',
    name: 'Hierro',
    emoji: '⛏️',
    desc: 'Más números y opciones',
    tier: 2,
    level: 2,
  },
  {
    id: 'diamante',
    name: 'Diamante',
    emoji: '💎',
    desc: 'Solo retos difíciles',
    tier: 3,
    level: 3,
  },
]

export function missionRank(id: MissionRankId): MissionRank {
  return MISSION_RANKS.find((rank) => rank.id === id) ?? MISSION_RANKS[0]
}

export type MissionCtx = {
  level: MissionLevel
  done: () => void
}

export const MISSION_KEY: InjectionKey<MissionCtx> = Symbol('mundocraft-mission')
