<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import Pictogram from '../../components/Pictogram.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { nearbyDistractors, pick, ri, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'

const ITEMS = ['chicken', 'cow', 'sheep', 'carrot', 'corn', 'tomato', 'sunflower', 'eggplant', 'cabbage', 'potato']
const MAX = [5, 10, 20]

function make(_index: number, level: 1 | 2 | 3) {
  const max = MAX[level - 1]
  const n = ri(1, max)
  return { n, item: pick(ITEMS), options: shuffle([n, ...nearbyDistractors(n, 3, max)]) }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('m-cantidad', 7, make)
const answered = ref<number | null>(null)
const bad = ref<number | null>(null)

const instruction = computed(() => `¿Cuántos hay? Arrastra el número`)

watch(
  task,
  () => {
    answered.value = null
    bad.value = null
    speak('Cuenta los objetos y arrastra el número')
  },
  { immediate: true },
)

function drop(value: number, zone: string) {
  if (zone !== 'crate') return
  if (value === task.value.n) {
    answered.value = value
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
    emoji="🧺"
    title="¿Cuántos hay?"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-4">
      <div class="panel flex flex-wrap content-center justify-center gap-2 px-3 py-4">
        <span
          v-for="n in task.n"
          :key="n"
          class="anim-pop select-none text-5xl leading-none"
        >
          <Pictogram :name="task.item" />
        </span>
      </div>

      <div
        data-drop="crate"
        class="slot mx-auto h-28 w-44 flex-col gap-1"
        :class="answered ? 'slot-ok' : ''"
      >
        <span class="text-5xl font-black">{{ answered ?? '?' }}</span>
        <span class="text-xs font-extrabold opacity-50">número</span>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="n in task.options"
          :key="n"
          :label="String(n)"
          size="lg"
          tone="gold"
          draggable
          :ghost-id="`n-${n}`"
          :state="bad === n ? 'bad' : 'idle'"
          @drop="drop(n, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
