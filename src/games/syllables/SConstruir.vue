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

function make(_index: number, level: 1 | 2 | 3) {
  const target = level === 1 ? 2 : level === 2 ? 3 : 4
  const exact = WORDS.filter((w) => w.parts.length === target)
  const word = pick(exact.length ? exact : WORDS.filter((w) => w.parts.length >= 2))
  const tray = shuffle([...new Set([...word.parts, ...randomSyllables(1, word.parts)])])
  return { word, tray }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-construir', 5, make)
const placed = ref(0)
const used = ref<number[]>([])
const wrong = ref<string | null>(null)

const instruction = computed(() => 'Junta las sílabas en orden')
const done = computed(() => placed.value === task.value.word.parts.length)

watch(
  task,
  (t) => {
    placed.value = 0
    used.value = []
    wrong.value = null
    speak(`Construye la palabra ${t.word.word}`)
  },
  { immediate: true },
)

function tapSyllable(value: string, trayIndex: number) {
  if (used.value.includes(trayIndex) || done.value) return
  const expected = task.value.word.parts[placed.value]
  if (value === expected) {
    used.value = [...used.value, trayIndex]
    placed.value += 1
    sfx.tap()
    if (placed.value === task.value.word.parts.length) solve()
    return
  }
  wrong.value = value
  miss()
  window.setTimeout(() => {
    if (wrong.value === value) wrong.value = null
  }, 600)
}
</script>

<template>
  <GameShell
    emoji="🧱"
    title="Construye"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-5">
      <div class="panel mx-auto flex w-full max-w-sm flex-col items-center gap-3 px-4 py-4">
        <span class="text-5xl leading-none">{{ task.word.emoji }}</span>
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <span
            v-for="(part, i) in task.word.parts"
            :key="i"
            :class="i < placed ? 'tile tile-md tone-grass tile-ok' : 'slot h-[72px] w-20 text-xl'"
          >
            {{ i < placed ? part : '?' }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-2.5">
        <BlockTile
          v-for="(syl, i) in task.tray"
          :key="`${syl}-${i}`"
          v-show="!used.includes(i)"
          :label="syl"
          size="lg"
          tone="wood"
          :state="wrong === syl ? 'bad' : 'idle'"
          @pick="tapSyllable(syl, i)"
        />
      </div>
    </div>
  </GameShell>
</template>
