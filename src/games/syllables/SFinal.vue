<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { SYLLABLE_WORDS } from '../../data'
import { pick, shuffle } from '../../lib/rand'
import { randomSyllables } from '../../lib/syllables'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

function make(_index: number, level: 1 | 2 | 3) {
  const target = level === 1 ? 2 : level === 2 ? 3 : 4
  const exact = SYLLABLE_WORDS.filter((word) => word.parts.length === target)
  const word = pick(exact.length ? exact : SYLLABLE_WORDS)
  const last = word.parts[word.parts.length - 1]
  const options = shuffle([last, ...randomSyllables(level === 1 ? 2 : 3, [last])])
  return { word, last, options }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-final', 6, make)
const filled = ref<string | null>(null)
const bad = ref<string | null>(null)

const instruction = computed(() => '¿Con qué sílaba termina?')

watch(
  task,
  (t) => {
    filled.value = null
    bad.value = null
    speak(`${t.word.word}. ¿Con qué sílaba termina?`)
  },
  { immediate: true },
)

function drop(value: string, zone: string) {
  if (zone !== 'final' || filled.value) return
  if (value === task.value.last) {
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
    emoji="🔚"
    title="La última sílaba"
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
              v-if="i === task.word.parts.length - 1"
              data-drop="final"
              class="slot h-16 w-20 text-2xl"
              :class="filled ? 'slot-ok' : 'slot-hot'"
            >
              <span :class="filled ? 'anim-pop' : 'slot-q'">{{ filled ?? '?' }}</span>
            </span>
            <span v-else class="tile tile-sm tone-paper" style="cursor: default">{{ part }}</span>
          </template>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="(syl, i) in task.options"
          :key="syl"
          :label="syl"
          size="lg"
          :tone="['rose', 'sky', 'leaf', 'wood'][i % 4]"
          draggable
          :ghost-id="syl"
          :state="bad === syl ? 'bad' : 'idle'"
          @drop="drop(syl, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
