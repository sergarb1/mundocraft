<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { nav } from './lib/nav'
import { progress } from './lib/progress'
import WorldMap from './views/WorldMap.vue'
import MissionView from './views/MissionView.vue'
import SectionView from './views/SectionView.vue'
import GameView from './views/GameView.vue'
import DragGhost from './components/DragGhost.vue'
import ReadingSettings from './components/ReadingSettings.vue'

watchEffect(() => {
  const root = document.documentElement
  root.dataset.font = progress.settings.font
  root.dataset.textSize = progress.settings.textSize
})

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
  <MissionView v-if="nav.mission" />
  <WorldMap v-else-if="mode === 'map'" />
  <SectionView v-else-if="mode === 'section' && nav.section" :section="nav.section" />
  <GameView v-else-if="nav.section" :key="gameId" :section="nav.section" :game-id="gameId" />
  <DragGhost />
  <ReadingSettings />
</template>
