<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue'
import Celebration from '../components/Celebration.vue'
import { gameById, gamesOf, type GameDef } from '../games/registry'
import { goMap, type SectionId } from '../lib/nav'
import { MISSION_KEY } from '../lib/mission'
import { SECTION_META } from '../lib/sections'
import { motivation, motivate } from '../lib/praise'
import { pick, shuffle } from '../lib/rand'
import { speak } from '../lib/speech'
import { sfx } from '../lib/sfx'
import { totalStars } from '../lib/progress'

const ZONES: SectionId[] = ['math', 'letters', 'syllables']

type Phase = 'briefing' | 'play' | 'between' | 'complete'

const phase = ref<Phase>('briefing')
const ids = ref<string[]>([])
const current = ref(0)

const games = computed(() =>
  ids.value.map((id) => gameById(id)).filter((game): game is GameDef => Boolean(game)),
)
const game = computed(() => games.value[current.value])
const left = computed(() => Math.max(0, games.value.length - current.value - 1))
const leftLabel = computed(() =>
  left.value === 1 ? 'Queda 1 prueba' : `Quedan ${left.value} pruebas`,
)

function roll() {
  ids.value = shuffle(ZONES).map((section) => pick(gamesOf(section)).id)
  current.value = 0
}

function newMission() {
  roll()
  phase.value = 'briefing'
  motivate('cheer')
  speak('¡Otra misión! Tres pruebas nuevas.')
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
  done: () => {
    const isLast = current.value + 1 >= games.value.length
    phase.value = isLast ? 'complete' : 'between'
    if (isLast) speak('¡Misión completada! Has superado las tres pruebas.')
  },
})

onMounted(() => {
  roll()
  motivate('cheer')
  speak('¡Misión sorpresa! Tres pruebas de distintos mundos. Toca empezar cuando quieras.')
})
</script>

<template>
  <div v-if="phase === 'briefing'" class="mission-shell">
    <header class="section-head">
      <button type="button" class="icon-btn" aria-label="Volver al mapa" @click="goMap">🏠</button>
      <div class="section-icon zone-gold">🎯</div>
      <div class="flex-1 min-w-0">
        <h1 class="section-title">Misión sorpresa</h1>
        <p class="section-sub">3 pruebas de distintos mundos</p>
      </div>
      <div class="star-badge"><span>★</span>{{ totalStars }}</div>
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
    :sub="`Has superado las ${games.length} pruebas`"
    again-label="🎯 Otra misión"
    home-label="🏠 Mapa"
    @again="newMission"
    @home="goMap"
  />
</template>
