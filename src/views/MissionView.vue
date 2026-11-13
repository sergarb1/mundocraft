<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue'
import Celebration from '../components/Celebration.vue'
import { gameById, gamesOf, type GameDef } from '../games/registry'
import { goMap, type SectionId } from '../lib/nav'
import { MISSION_KEY, MISSION_RANKS, missionRank, type MissionRankId } from '../lib/mission'
import { SECTION_META } from '../lib/sections'
import { motivation, motivate } from '../lib/praise'
import { pick, shuffle } from '../lib/rand'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sfx'
import { awardDiamondMission, diamondMedals, totalStars } from '../lib/progress'
import ReadingButton from '../components/ReadingButton.vue'

const ZONES: SectionId[] = ['math', 'letters', 'syllables']

type Phase = 'briefing' | 'play' | 'between' | 'complete'

const phase = ref<Phase>('briefing')
const rankId = ref<MissionRankId>('madera')
const ids = ref<string[]>([])
const current = ref(0)

const rank = computed(() => missionRank(rankId.value))
const games = computed(() =>
  ids.value.map((id) => gameById(id)).filter((game): game is GameDef => Boolean(game)),
)
const game = computed(() => games.value[current.value])
const left = computed(() => Math.max(0, games.value.length - current.value - 1))
const leftLabel = computed(() =>
  left.value === 1 ? 'Queda 1 prueba' : `Quedan ${left.value} pruebas`,
)

function pickFor(section: SectionId): GameDef {
  const pool = gamesOf(section).filter((game) => game.tier === rank.value.tier)
  return pick(pool.length ? pool : gamesOf(section))
}

function roll() {
  ids.value = shuffle(ZONES).map((section) => pickFor(section).id)
  current.value = 0
}

function selectRank(id: MissionRankId) {
  if (id === rankId.value) return
  rankId.value = id
  roll()
  motivate('cheer')
  sfx.tap()
  speak(`Rango ${rank.value.name}. ${rank.value.desc}.`)
}

function newMission() {
  roll()
  phase.value = 'briefing'
  motivate('cheer')
  speak(`¡Otra misión! Rango ${rank.value.name}. Tres pruebas nuevas.`)
}

function start() {
  if (!game.value) return
  phase.value = 'play'
  motivate('cheer')
  sfx.tap()
}

function advance() {
  if (current.value + 1 >= games.value.length) return
  current.value += 1
  phase.value = 'play'
  motivate('cheer')
  sfx.tap()
}

provide(MISSION_KEY, {
  get level() {
    return rank.value.level
  },
  done: () => {
    const isLast = current.value + 1 >= games.value.length
    phase.value = isLast ? 'complete' : 'between'
    if (!isLast) return
    if (rank.value.id === 'diamante') {
      awardDiamondMission()
      speak('¡Misión completada! Has ganado una medalla Diamante.')
    } else {
      speak('¡Misión completada! Has superado las tres pruebas.')
    }
  },
})

onMounted(() => {
  roll()
  motivate('cheer')
  speak(`¡Misión sorpresa! Rango ${rank.value.name}. Tres pruebas de distintos mundos. Toca empezar cuando quieras.`)
})
</script>

<template>
  <div v-if="phase === 'briefing'" class="mission-shell">
    <header class="section-head">
      <button type="button" class="icon-btn" aria-label="Volver al mapa" @click="goMap">🏠</button>
      <div class="section-icon zone-gold">🎯</div>
      <div class="flex-1 min-w-0">
        <h1 class="section-title">Misión sorpresa</h1>
        <p class="section-sub">{{ rank.emoji }} Rango {{ rank.name }} · 3 pruebas</p>
      </div>
      <div class="star-badge"><span>★</span>{{ totalStars }}</div>
      <ReadingButton />
    </header>

    <div class="cheer-row" aria-live="polite">
      <span aria-hidden="true">💛</span>
      <span :key="motivation.n" class="cheer-text">{{ motivation.text }}</span>
      <button
        type="button"
        class="cheer-speak"
        :aria-label="`Escuchar: ${motivation.text}`"
        @pointerdown.prevent="speak(motivation.text)"
      >
        🔊
      </button>
    </div>

    <section class="mission-ranks" aria-labelledby="mission-ranks-title">
      <div class="mission-ranks-head">
        <span id="mission-ranks-title" class="mission-ranks-title">Elige tu rango</span>
        <span class="mission-ranks-note" aria-live="polite">{{ rank.desc }}</span>
      </div>
      <div class="mission-rank-grid">
        <button
          v-for="r in MISSION_RANKS"
          :key="r.id"
          type="button"
          class="mission-rank"
          :class="[`rank-${r.id}`, { 'mission-rank-on': r.id === rankId }]"
          :aria-pressed="r.id === rankId"
          :aria-label="`Rango ${r.name}: ${r.desc}`"
          @click="selectRank(r.id)"
        >
          <span class="mission-rank-emoji" aria-hidden="true">{{ r.emoji }}</span>
          <span class="mission-rank-name">{{ r.name }}</span>
        </button>
      </div>
    </section>

    <ol class="mission-list">
      <li v-for="(step, i) in games" :key="step.id" class="mission-card">
        <span class="mission-num">{{ i + 1 }}</span>
        <span class="game-icon" :class="`tone-${step.tone}`">{{ step.emoji }}</span>
        <span class="flex-1 min-w-0">
          <span class="game-name block">{{ step.name }}</span>
          <span class="game-desc block">{{ SECTION_META[step.section].name }} · {{ step.desc }}</span>
        </span>
      </li>
    </ol>

    <div class="mission-actions">
      <button type="button" class="big-btn tone-grass mission-start" @click="start">
        ▶ ¡Empezar!
      </button>
      <button type="button" class="big-btn tone-paper" @click="newMission">🎲 Cambiar</button>
    </div>

    <p class="mission-hint">Puedes volver al mapa con 🏠 cuando quieras</p>
  </div>

  <component :is="game.component" v-else-if="phase === 'play' && game" :key="game.id" />

  <Celebration
    v-else-if="phase === 'between'"
    emoji="✅"
    :title="`¡Prueba ${current + 1} superada!`"
    :sub="leftLabel"
    again-label="▶ Siguiente prueba"
    home-label="🏠 Salir"
    @again="advance"
    @home="goMap"
  />

  <Celebration
    v-else-if="phase === 'complete'"
    emoji="🏆"
    title="¡Misión completada!"
    :sub="`Rango ${rank.name} · ${games.length} pruebas superadas`"
    again-label="🎯 Otra misión"
    home-label="🏠 Mapa"
    @again="newMission"
    @home="goMap"
  >
    <div v-if="rank.id === 'diamante'" class="diamond-medal" role="status">
      <span class="diamond-medal-icon" aria-hidden="true">💎</span>
      <span class="diamond-medal-copy">
        <span class="diamond-medal-name">Medalla Diamante</span>
        <span class="diamond-medal-note">
          {{ diamondMedals === 1 ? '¡Primera misión Diamante superada!' : `${diamondMedals} misiones Diamante superadas` }}
        </span>
      </span>
    </div>
  </Celebration>
</template>
