<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { WORDS } from '../../data'
import { pick, shuffle } from '../../lib/rand'
import { randomSyllables } from '../../lib/syllables'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const CANDIDATES = WORDS.filter((w) => w.parts.length >= 2 && w.parts.length <= 3)

function make(_index: number, _level: 1 | 2 | 3) {
  const word = pick(CANDIDATES)
  const gap = Math.floor(Math.random() * word.parts.length)
  const missing = word.parts[gap]
  const options = shuffle([missing, ...randomSyllables(3, [missing])])
  return { word, gap, missing, options }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-falta', 7, make)
const filled = ref<string | null>(null)
const bad = ref<string | null>(null)

const instruction = computed(() => 'Completa la palabra')
watch(
  task,
  (t) => {
    filled.value = null
    bad.value = null
    speak(`Completa la palabra ${t.word.word}`)
  },
  { immediate: true },
)

function drop(value: string, zone: string) {
  if (zone !== 'hueco' || filled.value) return
  if (value === task.value.missing) {
    filled.value = value
    sfx.tap()
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
    emoji="🧩"
    title="Falta una sílaba"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-5">
      <div class="panel mx-auto flex w-full max-w-sm flex-col items-center gap-3 px-4 py-5">
        <span class="text-6xl leading-none">{{ task.word.emoji }}</span>
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <template v-for="(part, i) in task.word.parts" :key="i">
            <span
              v-if="i === task.gap"
              data-drop="hueco"
              class="slot h-16 w-20 text-2xl"
              :class="filled ? 'slot-ok' : 'slot-hot'"
            >
              {{ filled ?? '?' }}
            </span>
            <span v-else class="tile tile-md tone-paper" style="cursor: default">{{ part }}</span>
          </template>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="(syl, i) in task.options"
          :key="syl"
          :label="syl"
          size="lg"
          :tone="['wood', 'rose', 'sky', 'leaf'][i % 4]"
          draggable
          :ghost-id="syl"
          :state="bad === syl ? 'bad' : 'idle'"
          @drop="drop(syl, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
