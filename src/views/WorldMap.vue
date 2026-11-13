<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { openSection, SECTIONS, type SectionId } from '../lib/nav'
import { SECTION_META } from '../lib/sections'
import { sectionGameIds } from '../games/registry'
import { progress, sectionStars, toggleSound, toggleVoice, totalStars } from '../lib/progress'
import { cubeArt, farmArt, tex } from '../lib/art'
import { motivate, motivation } from '../lib/praise'

const ZONE_ART: Record<SectionId, { texture: string; cube: string; deco?: string }> = {
  math: { texture: 'grass_top', cube: 'gold_block', deco: 'sunflower' },
  letters: { texture: 'oak_planks', cube: 'bookshelf' },
  syllables: { texture: 'farmland', cube: 'hay', deco: 'chicken' },
  build: { texture: 'cobblestone', cube: 'crafting_table', deco: 'pickaxe' },
}

let cheerTimer = 0

onMounted(() => {
  motivate('cheer')
  cheerTimer = window.setInterval(() => motivate('cheer'), 9000)
})

onBeforeUnmount(() => window.clearInterval(cheerTimer))

const zones = computed(() =>
  SECTIONS.map((id: SectionId) => {
    const meta = SECTION_META[id]
    return {
      id,
      ...meta,
      ...ZONE_ART[id],
      stars: sectionStars(sectionGameIds(id)),
    }
  }),
)
</script>

<template>
  <div class="map-shell">
    <header class="map-head">
      <div class="flex-1">
        <h1 class="title">MundoCraft</h1>
        <p class="text-xs font-extrabold opacity-55">Toca un bloque y juega</p>
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

    <main class="flex flex-1 flex-col justify-center">
      <div class="world" :style="{ backgroundImage: `url(${tex('grass_top')})` }">
        <div
          class="world-path world-path-v"
          :style="{ backgroundImage: `url(${tex('dirt')})` }"
          aria-hidden="true"
        />
        <div
          class="world-path world-path-h"
          :style="{ backgroundImage: `url(${tex('dirt')})` }"
          aria-hidden="true"
        />

        <div class="zone-grid">
          <button
            v-for="zone in zones"
            :key="zone.id"
            type="button"
            class="zone"
            :style="{ backgroundImage: `url(${tex(zone.texture)})` }"
            @click="openSection(zone.id)"
          >
            <span v-if="zone.id !== 'build'" class="zone-stars">★ {{ zone.stars }}</span>

            <img class="zone-cube anim-float" :src="cubeArt(zone.cube)" alt="" draggable="false" />

            <span
              class="zone-sign"
              :style="{ backgroundImage: `url(${tex('oak_planks')})` }"
            >
              <span class="zone-emoji">{{ zone.emoji }}</span>
              <span class="zone-name">{{ zone.name }}</span>
            </span>

            <span class="zone-sub">{{ zone.sub }}</span>

            <img
              v-if="zone.deco"
              class="zone-deco"
              :src="farmArt(zone.deco)"
              alt=""
              draggable="false"
            />
          </button>
        </div>
      </div>

      <p class="map-tip">⛏️ {{ motivation.text }}</p>
    </main>
  </div>
</template>
