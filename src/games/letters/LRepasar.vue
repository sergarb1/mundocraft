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
  2: shuffle([...STRAIGHT_LETTERS, ...CURVY_LETTERS]),
  3: shuffle(Object.keys(FONT)),
}

function make(index: number, level: 1 | 2 | 3) {
  const pool = pools[level]
  const letter = pool[index % pool.length]
  return { letter, example: LETTER_WORDS[letter] }
}

const { task, index, total, celebrate, solve, restart } = useGame('l-repasar', 4, make)

const strokes = computed(() => letterStrokes(task.value.letter))
const instruction = computed(() => `Repasa la letra ${task.value.letter}`)

watch(task, (t) => speak(`Repasa la letra ${t.letter}`), { immediate: true })
</script>

<template>
  <GameShell
    emoji="🖍️"
    title="Repasa la letra"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-2">
      <div class="mx-auto flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-1.5">
        <span class="text-2xl">{{ task.example?.emoji ?? '✏️' }}</span>
        <span class="text-sm font-extrabold opacity-60">{{ task.example?.word ?? '' }}</span>
      </div>
      <TracePad
        :key="index"
        :strokes="strokes"
        :hint="`Sigue los trazos de la ${task.letter}`"
        @done="solve"
      />
    </div>
  </GameShell>
</template>
