<script setup lang="ts">
import { computed, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import TracePad from '../../components/TracePad.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { LETTER_WORDS } from '../../data'
import { letterStrokes, lettersWithSeveralStrokes, type TraceStroke } from '../../lib/strokes'
import { shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'

const letters = shuffle(lettersWithSeveralStrokes())

function make(index: number, level: 1 | 2 | 3) {
  const letter = letters[index % letters.length]
  const all = letterStrokes(letter)
  const missing = (index + level) % all.length
  const strokes: TraceStroke[] = all.map((s, i) => ({ ...s, active: i === missing }))
  return { letter, strokes, example: LETTER_WORDS[letter], missing }
}

const { task, index, total, celebrate, solve, restart } = useGame('l-completar', 4, make)

const instruction = computed(() => `Completa la letra ${task.value.letter}`)

watch(task, (t) => speak(`Completa la letra ${t.letter}`), { immediate: true })
</script>

<template>
  <GameShell
    emoji="🧩"
    title="Falta un trazo"
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
        :strokes="task.strokes"
        hint="Repasa el trazo amarillo"
        @done="solve"
      />
    </div>
  </GameShell>
</template>
