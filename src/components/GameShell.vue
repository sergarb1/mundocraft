<script setup lang="ts">
import { computed } from 'vue'
import Celebration from './Celebration.vue'
import { speak } from '../lib/speech'
import { motivation } from '../lib/praise'
import ReadingButton from './ReadingButton.vue'

const props = withDefaults(
  defineProps<{
    emoji: string
    instruction: string
    title?: string
    celebrate?: boolean
    round?: number
    total?: number
    speech?: string
  }>(),
  { title: '', celebrate: false, round: 0, total: 0, speech: '' },
)

const emit = defineEmits<{ home: []; restart: [] }>()

const sentence = computed(() => props.speech || props.instruction)
</script>

<template>
  <div class="game-shell">
    <header class="game-top">
      <button type="button" class="icon-btn" aria-label="Volver al mapa" @pointerdown.prevent="emit('home')">
        🏠
      </button>
      <div class="round-dots" aria-hidden="true">
        <span
          v-for="n in total"
          :key="n"
          class="round-dot"
          :class="{ 'round-dot-done': n <= round }"
        />
      </div>
      <button
        type="button"
        class="icon-btn"
        aria-label="Escuchar la instrucción"
        @pointerdown.prevent="speak(sentence)"
      >
        🔊
      </button>
      <ReadingButton />
    </header>

    <p v-if="title" class="game-title">{{ title }}</p>

    <div class="px-4 pt-1">
      <button type="button" class="instruction" @pointerdown.prevent="speak(sentence)">
        <span class="instruction-emoji">{{ emoji }}</span>
        <span class="instruction-text">{{ instruction }}</span>
      </button>
    </div>

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

    <main class="game-board">
      <slot />
    </main>

    <Celebration v-if="celebrate" @again="emit('restart')" @home="emit('home')" />
  </div>
</template>
