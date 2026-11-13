<script setup lang="ts">
import { computed } from 'vue'
import { nav } from './lib/nav'
import WorldMap from './views/WorldMap.vue'
import SectionView from './views/SectionView.vue'
import GameView from './views/GameView.vue'
import DragGhost from './components/DragGhost.vue'

const mode = computed<'map' | 'section' | 'game'>(() => {
  if (!nav.section) return 'map'
  if (nav.section === 'build') return 'game'
  return nav.game ? 'game' : 'section'
})

const gameId = computed(() => {
  if (nav.section === 'build') return 'construir'
  return nav.game ?? ''
})
</script>

<template>
  <WorldMap v-if="mode === 'map'" />
  <SectionView v-else-if="mode === 'section' && nav.section" :section="nav.section" />
  <GameView v-else-if="nav.section" :key="gameId" :section="nav.section" :game-id="gameId" />
  <DragGhost />
</template>
