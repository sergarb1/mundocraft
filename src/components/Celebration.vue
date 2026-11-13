<script setup lang="ts">
import { computed } from 'vue'
import { motivation } from '../lib/praise'

defineProps<{ stars?: number }>()
const emit = defineEmits<{ again: []; home: [] }>()

const colors = ['#ffc93c', '#ff7b8a', '#6cc7f5', '#8fdc5b', '#c58cff', '#ffa94d']
const pieces = computed(() =>
  Array.from({ length: 30 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.7,
    duration: 1.4 + Math.random() * 1.1,
    rotate: Math.random() * 360,
    color: colors[i % colors.length],
    wide: Math.random() > 0.5,
  })),
)
</script>

<template>
  <div class="celebration">
    <div class="confetti" aria-hidden="true">
      <span
        v-for="(p, i) in pieces"
        :key="i"
        class="confetti-piece"
        :style="{
          left: `${p.left}%`,
          background: p.color,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          transform: `rotate(${p.rotate}deg)`,
          width: p.wide ? '14px' : '9px',
        }"
      />
    </div>
    <div class="celebrate-card">
      <div class="celebrate-star">🌟</div>
      <h2 class="celebrate-title">{{ motivation.text }}</h2>
      <p class="celebrate-sub">Has ganado una estrella</p>
      <div class="celebrate-actions">
        <button type="button" class="big-btn tone-grass" @click="emit('again')">🔄 Otra vez</button>
        <button type="button" class="big-btn tone-paper" @click="emit('home')">🏠 Mapa</button>
      </div>
    </div>
  </div>
</template>
