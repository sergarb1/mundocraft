<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { SYLLABLE_WORDS, TRACE_SYLLABLES } from '../../data'
import { pick, shuffle } from '../../lib/rand'
import { randomSyllables, siblingsOf } from '../../lib/syllables'
import { speak } from '../../lib/speech'

const CANDIDATES = SYLLABLE_WORDS.filter((w) => TRACE_SYLLABLES.includes(w.parts[0]))

function make(_index: number, _level: 1 | 2 | 3) {
  const word = pick(CANDIDATES)
  const first = word.parts[0]
  const siblings = siblingsOf(first)
  const options = shuffle([first, ...siblings, ...randomSyllables(2, [first, ...siblings])]).slice(0, 4)
  if (!options.includes(first)) options[0] = first
  return { word, first, options }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-imagen', 7, make)
const answered = ref(false)
const bad = ref<string | null>(null)

const instruction = computed(() => `¿Con qué sílaba empieza?`)
watch(
  task,
  (t) => {
    answered.value = false
    bad.value = null
    speak(`${t.word.word}. ¿Con qué sílaba empieza?`)
  },
  { immediate: true },
)

function drop(value: string, zone: string) {
  if (zone !== 'card') return
  if (value === task.value.first) {
    answered.value = true
    solve()
    return
  }
  bad.value = value
  miss()
  window.setTimeout(() => {
    if (bad.value === value) bad.value = null
  }, 600)
}
</script>

<template>
  <GameShell
    emoji="🖼️"
    title="¿Con qué empieza?"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-5">
      <div data-drop="card" class="panel mx-auto flex w-full max-w-sm flex-col items-center gap-2 px-4 py-5" :class="answered ? 'ring-4 ring-emerald-400' : ''">
        <span class="text-6xl leading-none">{{ task.word.emoji }}</span>
        <div class="flex flex-wrap items-center justify-center gap-1">
          <span class="slot h-12 w-16 text-xl" :class="answered ? 'slot-ok' : 'slot-hot'">
            {{ answered ? task.first : '?' }}
          </span>
          <span
            v-for="(part, i) in task.word.parts.slice(1)"
            :key="i"
            class="tile tile-sm tone-paper"
            style="cursor: default"
          >
            {{ part }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="(syl, i) in task.options"
          :key="syl"
          :label="syl"
          size="lg"
          :tone="['sky', 'leaf', 'gold', 'rose'][i % 4]"
          draggable
          :ghost-id="syl"
          :state="bad === syl ? 'bad' : 'idle'"
          @drop="drop(syl, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
