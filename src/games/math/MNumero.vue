<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { nearbyDistractors, ri, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'

const MAX = [5, 10, 20]
const TONES = ['grass', 'sky', 'gold', 'rose', 'purple', 'leaf']

function make(_index: number, level: 1 | 2 | 3) {
  const max = MAX[level - 1]
  const target = ri(1, max)
  return { target, options: shuffle([target, ...nearbyDistractors(target, 3, max)]) }
}

const { task, index, total, celebrate, solve, miss, restart, mistakes } = useGame('m-numero', 8, make)
const bad = ref<number | null>(null)

const instruction = computed(() => `Toca el número ${task.value.target}`)

watch(
  task,
  (t) => {
    bad.value = null
    speak(`Toca el número ${t.target}`)
  },
  { immediate: true },
)

function choose(value: number) {
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
    emoji="🔢"
    title="Los números"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-4">
      <div class="panel mx-auto flex items-center justify-center gap-3 px-5 py-3">
        <span class="text-3xl">{{ mistakes > 0 ? task.target : '❓' }}</span>
        <span class="text-xs font-extrabold uppercase tracking-wide opacity-55">
          {{ mistakes > 0 ? '¡Este es!' : 'Escucha y busca' }}
        </span>
      </div>

      <div class="grid grid-cols-2 place-items-center gap-4 px-2">
        <BlockTile
          v-for="(n, i) in task.options"
          :key="n"
          :label="String(n)"
          size="xl"
          :tone="TONES[i % TONES.length]"
          :state="bad === n ? 'bad' : 'idle'"
          @pick="choose(n)"
        />
      </div>
    </div>
  </GameShell>
</template>
