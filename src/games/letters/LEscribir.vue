<script setup lang="ts">
import { computed, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import TracePad from '../../components/TracePad.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { CURVY_LETTERS, LETTER_WORDS, STRAIGHT_LETTERS } from '../../data'
import { FONT, letterStrokes } from '../../lib/strokes'
import { shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'

const pools: Record<number, string[]> = {
  1: shuffle(STRAIGHT_LETTERS),
  2: shuffle(CURVY_LETTERS),
  3: shuffle(Object.keys(FONT)),
}

function make(index: number, level: 1 | 2 | 3) {
  const pool = pools[level]
  const letter = pool[index % pool.length]
  return { letter, example: LETTER_WORDS[letter] }
}

const { task, index, total, celebrate, solve, restart } = useGame('l-escribir', 3, make)

const strokes = computed(() => letterStrokes(task.value.letter))
const instruction = computed(() => `Escribe la letra ${task.value.letter}`)

watch(task, (t) => speak(`Escribe la letra ${t.letter}`), { immediate: true })
</script>

<template>
  <GameShell
    emoji="✍️"
    title="Escribe"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-2">
      <div class="mx-auto flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-1.5">
        <span class="text-lg font-black opacity-40">{{ task.letter }}</span>
        <span class="text-2xl">{{ task.example?.emoji ?? '✏️' }}</span>
        <span class="text-sm font-extrabold opacity-60">{{ task.example?.word ?? '' }}</span>
      </div>
      <TracePad
        :key="index"
        :strokes="strokes"
        :free-mode="true"
        :show-start="false"
        :tolerance="10"
        :complete-ratio="0.8"
        hint="Escribe tú solo"
        @done="solve"
      />
    </div>
  </GameShell>
</template>
