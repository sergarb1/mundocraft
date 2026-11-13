<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { LETTER_NAMES, LOWERCASE, SIMILAR } from '../../data'
import { pick, sample, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'

const EASY = ['a', 'e', 'i', 'o', 'u', 'm', 'p', 's', 'l', 't', 'n', 'd']

function make(_index: number, level: 1 | 2 | 3) {
  const pool = level === 1 ? EASY : LOWERCASE
  const target = pick(pool)
  const related = SIMILAR.find((group) => group.includes(target)) ?? []
  const extra = sample(
    LOWERCASE.filter((l) => l !== target),
    6,
  )
  const options = shuffle([...new Set([target, ...related, ...extra])]).slice(0, level === 1 ? 4 : 6)
  if (!options.includes(target)) options[0] = target
  return { target, options }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('l-reconocer', 8, make)
const bad = ref<string | null>(null)

const instruction = computed(() => `Busca la letra "${task.value.target}"`)

watch(
  task,
  (t) => {
    bad.value = null
    speak(`Busca la letra ${LETTER_NAMES[t.target] ?? t.target}`)
  },
  { immediate: true },
)

function choose(letter: string) {
  if (letter === task.value.target) {
    solve()
    return
  }
  bad.value = letter
  miss()
  window.setTimeout(() => {
    if (bad.value === letter) bad.value = null
  }, 600)
}
</script>

<template>
  <GameShell
    emoji="🔤"
    title="La letra"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-4">
      <div class="panel mx-auto flex w-full max-w-xs items-center justify-center gap-3 px-4 py-3">
        <span class="text-xs font-extrabold uppercase tracking-wide opacity-75">Busca</span>
        <span class="tile tile-lg tone-wood" style="cursor: default">{{ task.target }}</span>
      </div>

      <div class="grid grid-cols-3 place-items-center gap-3">
        <BlockTile
          v-for="letter in task.options"
          :key="letter"
          :label="letter"
          size="lg"
          :tone="['sky', 'rose', 'leaf', 'gold', 'purple', 'wood'][task.options.indexOf(letter) % 6]"
          :state="bad === letter ? 'bad' : 'idle'"
          @pick="choose(letter)"
        />
      </div>
    </div>
  </GameShell>
</template>
