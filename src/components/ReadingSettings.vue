<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { progress, toggleSound, toggleVoice } from '../lib/progress'
import { closeReading, FONT_OPTIONS, readingOpen, SIZE_OPTIONS } from '../lib/reading'

const closeBtn = ref<HTMLButtonElement | null>(null)

const status = computed(() => {
  const font = FONT_OPTIONS.find((option) => option.id === progress.settings.font)?.name ?? ''
  const size = SIZE_OPTIONS.find((option) => option.id === progress.settings.textSize)?.name ?? ''
  return `Letra ${font}, tamaño ${size}.`
})

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') closeReading()
}

watch(readingOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) return
  await nextTick()
  closeBtn.value?.focus()
})

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="readingOpen" class="reading-backdrop" @click.self="closeReading">
    <section
      class="reading-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-title"
      aria-describedby="reading-sub"
    >
      <header class="reading-head">
        <div class="reading-head-copy">
          <span class="reading-kicker">Lectura fácil</span>
          <h2 id="reading-title" class="reading-title">Letra y tamaño</h2>
          <p id="reading-sub" class="reading-sub">Elige cómo quieres leer.</p>
        </div>
        <button
          ref="closeBtn"
          type="button"
          class="reading-close"
          aria-label="Cerrar los ajustes de lectura"
          @click="closeReading"
        >
          ✕
        </button>
      </header>

      <section class="reading-section" aria-labelledby="reading-font-title">
        <h3 id="reading-font-title" class="reading-label">Tipo de letra</h3>
        <div class="reading-fonts" role="group" aria-labelledby="reading-font-title">
          <button
            v-for="font in FONT_OPTIONS"
            :key="font.id"
            type="button"
            class="reading-font"
            :class="[`reading-font-${font.id}`, { 'reading-on': progress.settings.font === font.id }]"
            :aria-pressed="progress.settings.font === font.id"
            :aria-label="`Letra ${font.name}, ${font.note}`"
            @click="progress.settings.font = font.id"
          >
            <span v-if="progress.settings.font === font.id" class="reading-check" aria-hidden="true">✓</span>
            <span class="reading-font-sample" aria-hidden="true">Aa</span>
            <span class="reading-font-name">{{ font.name }}</span>
            <span class="reading-font-note">{{ font.note }}</span>
          </button>
        </div>
      </section>

      <section class="reading-section" aria-labelledby="reading-size-title">
        <h3 id="reading-size-title" class="reading-label">Tamaño del texto</h3>
        <div class="reading-sizes" role="group" aria-labelledby="reading-size-title">
          <button
            v-for="size in SIZE_OPTIONS"
            :key="size.id"
            type="button"
            class="reading-size"
            :class="[`reading-size-${size.id}`, { 'reading-on': progress.settings.textSize === size.id }]"
            :aria-pressed="progress.settings.textSize === size.id"
            :aria-label="`Tamaño ${size.name}`"
            @click="progress.settings.textSize = size.id"
          >
            <span v-if="progress.settings.textSize === size.id" class="reading-check" aria-hidden="true">✓</span>
            <span class="reading-size-sample" aria-hidden="true">A</span>
            <span class="reading-size-name">{{ size.name }}</span>
          </button>
        </div>
      </section>

      <section class="reading-section" aria-labelledby="reading-sound-title">
        <h3 id="reading-sound-title" class="reading-label">Sonido</h3>
        <div class="reading-sounds">
          <button
            type="button"
            class="reading-toggle"
            :class="{ 'reading-off': !progress.settings.voice }"
            :aria-pressed="progress.settings.voice"
            @click="toggleVoice"
          >
            <span class="reading-toggle-emoji" aria-hidden="true">{{ progress.settings.voice ? '🗣️' : '🤐' }}</span>
            <span>Voz</span>
            <span class="reading-toggle-state">{{ progress.settings.voice ? 'Sí' : 'No' }}</span>
          </button>
          <button
            type="button"
            class="reading-toggle"
            :class="{ 'reading-off': !progress.settings.sound }"
            :aria-pressed="progress.settings.sound"
            @click="toggleSound"
          >
            <span class="reading-toggle-emoji" aria-hidden="true">{{ progress.settings.sound ? '🔔' : '🔇' }}</span>
            <span>Efectos</span>
            <span class="reading-toggle-state">{{ progress.settings.sound ? 'Sí' : 'No' }}</span>
          </button>
        </div>
      </section>

      <p class="reading-tip">Se guarda en este dispositivo.</p>
      <p class="sr-only" aria-live="polite">{{ status }}</p>
    </section>
  </div>
</template>
