<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { openMission, openSection, SECTIONS, type SectionId } from '../lib/nav'
import { SECTION_META } from '../lib/sections'
import { sectionGameIds } from '../games/registry'
import { progress, sectionStars, totalStars } from '../lib/progress'
import { cubeArt, farmArt, tex } from '../lib/art'
import { motivate, motivation } from '../lib/praise'
import { install, installApp, showInstall } from '../lib/install'
import ReadingButton from '../components/ReadingButton.vue'

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
      <ReadingButton />
    </header>

    <main class="flex flex-1 flex-col justify-center">
      <button type="button" class="mission-banner" @click="openMission">
        <span class="mission-banner-emoji" aria-hidden="true">🎯</span>
        <span class="flex-1 min-w-0 text-left">
          <span class="mission-banner-name">Misiones</span>
          <span class="mission-banner-sub">3 pruebas · elige rango</span>
        </span>
        <span
          v-if="progress.diamondMissions > 0"
          class="mission-medal"
          :aria-label="`${progress.diamondMissions} medallas Diamante`"
        >
          <span aria-hidden="true">💎</span>{{ progress.diamondMissions }}
        </span>
        <span class="mission-banner-go" aria-hidden="true">▶</span>
      </button>

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

      <div v-if="showInstall" class="map-foot">
        <button type="button" class="install-btn" @click="installApp">
          <span aria-hidden="true">📲</span>
          Instalar para móvil
        </button>
      </div>
    </main>

    <div v-if="install.help" class="install-backdrop" @click.self="install.help = false">
      <div class="install-card" role="dialog" aria-modal="true" aria-labelledby="install-title">
        <div class="install-emoji" aria-hidden="true">📲</div>
        <h2 id="install-title" class="install-title">Instalar MundoCraft</h2>
        <p class="install-sub">Se abrirá como una app, sin barra del navegador.</p>

        <ol v-if="install.ios" class="install-steps">
          <li>
            <span class="install-num">1</span>
            <span>Toca <b>Compartir</b> <span aria-hidden="true">⬆️</span> en Safari.</span>
          </li>
          <li>
            <span class="install-num">2</span>
            <span>Elige <b>Añadir a pantalla de inicio</b>.</span>
          </li>
          <li>
            <span class="install-num">3</span>
            <span>Toca <b>Añadir</b> y listo.</span>
          </li>
        </ol>

        <ol v-else class="install-steps">
          <li>
            <span class="install-num">1</span>
            <span>Abre el menú de opciones del navegador.</span>
          </li>
          <li>
            <span class="install-num">2</span>
            <span>Elige <b>Instalar app</b> o <b>Añadir a pantalla de inicio</b>.</span>
          </li>
          <li>
            <span class="install-num">3</span>
            <span>Confirma y listo.</span>
          </li>
        </ol>

        <button type="button" class="big-btn tone-grass" @click="install.help = false">
          ¡Entendido!
        </button>
      </div>
    </div>
  </div>
</template>
