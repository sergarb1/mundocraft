<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { TRACE_SYLLABLES } from '../../data'
import { pick, shuffle } from '../../lib/rand'
import { randomSyllables, siblingsOf } from '../../lib/syllables'
import { speak } from '../../lib/speech'

function make(_index: number, level: 1 | 2 | 3) {
  const target = pick(TRACE_SYLLABLES)
  const siblings = siblingsOf(target)
  const options = shuffle([
    target,
    ...siblings,
    ...randomSyllables(level === 1 ? 1 : 3, [target, ...siblings]),
  ]).slice(0, level === 1 ? 4 : 6)
  if (!options.includes(target)) options[0] = target
  return { target, options }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-reconocer', 8, make)
const bad = ref<string | null>(null)

const instruction = computed(() => `Busca la sílaba ${task.value.target}`)

watch(
  task,
  (t) => {
    bad.value = null
    speak(`Busca la sílaba ${t.target}`)
  },
  { immediate: true },
)

function choose(value: string) {
  if (value === task.value.target) {
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
    emoji="🗣️"
    title="La sílaba"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-4">
      <div class="panel mx-auto flex items-center gap-3 px-5 py-3">
        <span class="text-xs font-extrabold uppercase tracking-wide opacity-55">Busca</span>
        <span class="tile tile-lg tone-sky" style="cursor: default">{{ task.target }}</span>
      </div>

      <div class="grid grid-cols-3 place-items-center gap-3">
        <BlockTile
          v-for="(syl, i) in task.options"
          :key="syl"
          :label="syl"
          size="lg"
          :tone="['wood', 'sky', 'leaf', 'gold', 'rose', 'purple'][i % 6]"
          :state="bad === syl ? 'bad' : 'idle'"
          @pick="choose(syl)"
        />
      </div>
    </div>
  </GameShell>
</template>
