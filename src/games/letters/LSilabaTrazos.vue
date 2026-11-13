<script setup lang="ts">
import { computed, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import TracePad from '../../components/TracePad.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { TRACE_SYLLABLES, WORDS } from '../../data'
import { letterStrokes } from '../../lib/strokes'
import { shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'

const syllables = shuffle(TRACE_SYLLABLES)

function make(index: number, _level: 1 | 2 | 3) {
  const syllable = syllables[index % syllables.length]
  const example = WORDS.find((w) => w.parts[0] === syllable)
  return { syllable, example }
}

const { task, index, total, celebrate, solve, restart } = useGame('l-silaba-trazos', 3, make)

const strokes = computed(() => letterStrokes(task.value.syllable))
const instruction = computed(() => `Repasa la sílaba ${task.value.syllable}`)

watch(task, (t) => speak(`Repasa la sílaba ${t.syllable}`), { immediate: true })
</script>

<template>
  <GameShell
    emoji="💫"
    title="Sílabas con el dedo"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-2">
      <div v-if="task.example" class="mx-auto flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-1.5">
        <span class="text-2xl">{{ task.example.emoji }}</span>
        <span class="text-sm font-extrabold opacity-60">{{ task.example.word }}</span>
      </div>
      <TracePad
        :key="index"
        :strokes="strokes"
        hint="Repasa las dos letras"
        @done="solve"
      />
    </div>
  </GameShell>
</template>
