<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { SectionId } from '../lib/nav'
import { goMap, openGame } from '../lib/nav'
import { SECTION_META } from '../lib/sections'
import { gamesOf, sectionGameIds } from '../games/registry'
import { progress, sectionStars } from '../lib/progress'
import { motivate, motivation } from '../lib/praise'
import { speak } from '../lib/speech'
import ReadingButton from '../components/ReadingButton.vue'

const props = defineProps<{ section: SectionId }>()

const meta = computed(() => SECTION_META[props.section])
const games = computed(() => gamesOf(props.section))
const stars = computed(() => sectionStars(sectionGameIds(props.section)))

onMounted(() => motivate('cheer'))
</script>

<template>
  <div class="section-shell">
    <header class="section-head">
      <button type="button" class="icon-btn" aria-label="Volver al mapa" @click="goMap">🏠</button>
      <div class="section-icon" :class="`zone-${meta.tone}`">{{ meta.emoji }}</div>
      <div class="flex-1 min-w-0">
        <h1 class="section-title">{{ meta.name }}</h1>
        <p class="section-sub">{{ meta.sub }}</p>
      </div>
      <div class="star-badge"><span>★</span>{{ stars }}</div>
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

    <p v-if="section === 'letters'" class="mb-2 px-2 text-xs font-bold opacity-75">
      ✍️ Usa el dedo para escribir. Puedes volver al mapa con 🏠.
    </p>

    <div class="game-list">
      <button
        v-for="game in games"
        :key="game.id"
        type="button"
        class="game-card"
        @click="openGame(game.section, game.id)"
      >
        <span class="game-icon" :class="`tone-${game.tone}`">{{ game.emoji }}</span>
        <span class="flex-1 min-w-0">
          <span class="game-name block">{{ game.name }}</span>
          <span class="game-desc block">{{ game.desc }}</span>
        </span>
        <span class="game-stars">
          {{ '★'.repeat(progress.stars[game.id] ?? 0) || '☆' }}
        </span>
      </button>
    </div>
  </div>
</template>
