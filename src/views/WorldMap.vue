<script setup lang="ts">
import { computed } from 'vue'
import { openSection, SECTIONS, type SectionId } from '../lib/nav'
import { SECTION_META } from '../lib/sections'
import { sectionGameIds } from '../games/registry'
import { progress, sectionStars, toggleSound, toggleVoice, totalStars } from '../lib/progress'

const zones = computed(() =>
  SECTIONS.map((id: SectionId) => {
    const meta = SECTION_META[id]
    return { id, ...meta, stars: sectionStars(sectionGameIds(id)) }
  }),
)
</script>

<template>
  <div class="map-shell">
    <header class="map-head">
      <div class="flex-1">
        <h1 class="title">MundoCraft</h1>
        <p class="text-xs font-extrabold opacity-55">Toca una zona y juega</p>
      </div>
      <div class="star-badge"><span>★</span>{{ totalStars }}</div>
      <button
        type="button"
        class="icon-btn"
        :class="{ 'icon-btn-off': !progress.settings.voice }"
        :aria-label="progress.settings.voice ? 'Silenciar la voz' : 'Activar la voz'"
        @click="toggleVoice"
      >
        {{ progress.settings.voice ? '🗣️' : '🤐' }}
      </button>
      <button
        type="button"
        class="icon-btn"
        :class="{ 'icon-btn-off': !progress.settings.sound }"
        :aria-label="progress.settings.sound ? 'Silenciar los sonidos' : 'Activar los sonidos'"
        @click="toggleSound"
      >
        {{ progress.settings.sound ? '🔔' : '🔇' }}
      </button>
    </header>

    <main class="flex-1">
      <div class="world">
        <svg class="world-deco" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50 -2 L50 102" stroke="#a9743f" stroke-width="9" opacity="0.35" />
          <path d="M-2 50 L102 50" stroke="#a9743f" stroke-width="9" opacity="0.35" />
          <circle cx="50" cy="50" r="7" fill="#a9743f" opacity="0.35" />
          <ellipse cx="6" cy="96" rx="9" ry="5" fill="#4fa8dd" opacity="0.55" />
          <ellipse cx="95" cy="4" rx="8" ry="5" fill="#4fa8dd" opacity="0.45" />
        </svg>

        <div class="zone-grid">
          <button
            v-for="zone in zones"
            :key="zone.id"
            type="button"
            class="zone"
            :class="`zone-${zone.tone}`"
            @click="openSection(zone.id)"
          >
            <span v-if="zone.id !== 'build'" class="zone-stars">★ {{ zone.stars }}</span>
            <span class="zone-emoji anim-float">{{ zone.emoji }}</span>
            <span class="zone-name">{{ zone.name }}</span>
            <span class="zone-sub">{{ zone.sub }}</span>
            <span class="zone-pixels">
              <span v-for="(pixel, i) in zone.pixels" :key="i">{{ pixel }}</span>
            </span>
          </button>
        </div>
      </div>

      <p class="map-tip">👆 Elige qué quieres aprender hoy</p>
    </main>
  </div>
</template>

<style scoped>
.map-head {
  position: relative;
}
</style>
