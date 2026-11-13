<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import Pictogram from '../../components/Pictogram.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { nearbyDistractors, pick, ri, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const ITEMS = ['chicken', 'cow', 'sheep', 'carrot', 'corn', 'tomato', 'sunflower', 'eggplant']
const LIMITS = [
  { max: 6, maxTake: 3 },
  { max: 10, maxTake: 5 },
  { max: 20, maxTake: 8 },
]

function make(_index: number, level: 1 | 2 | 3) {
  const limit = LIMITS[level - 1]
  const n = ri(3, limit.max)
  const k = ri(1, Math.min(limit.maxTake, n - 1))
  const result = n - k
  const maxOption = Math.max(n, result + 4)
  return {
    n,
    k,
    result,
    item: pick(ITEMS),
    options: shuffle([result, ...nearbyDistractors(result, 3, maxOption)]),
  }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('m-restar', 6, make)
const removed = ref<number[]>([])
const answered = ref<number | null>(null)
const bad = ref<number | null>(null)

const remaining = computed(() => task.value.n - removed.value.length)
const doneTaking = computed(() => removed.value.length === task.value.k)
const instruction = computed(() =>
  doneTaking.value ? '¿Cuántas quedan? Arrastra el número' : `Quita ${task.value.k} y cuenta las que quedan`,
)

watch(
  task,
  () => {
    removed.value = []
    answered.value = null
    bad.value = null
    speak(`Quita ${task.value.k} y cuenta las que quedan`)
  },
  { immediate: true },
)

function take(i: number) {
  if (removed.value.includes(i) || doneTaking.value) return
  removed.value = [...removed.value, i]
  sfx.drop()
  if (removed.value.length === task.value.k) speak(`Quedan ${task.value.result}`)
}

function drop(value: number, zone: string) {
  if (zone !== 'respuesta') return
  if (value === task.value.result) {
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
    emoji="➖"
    title="Quitar"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-3">
      <div class="panel flex flex-wrap content-center justify-center gap-1 px-2 py-4">
        <button
          v-for="i in task.n"
          :key="i"
          type="button"
          class="grid h-16 w-16 place-items-center rounded-xl text-4xl leading-none transition-all duration-300"
          :class="removed.includes(i) ? 'scale-50 opacity-20 grayscale' : ''"
          @pointerdown.prevent="take(i)"
        >
          <Pictogram :name="task.item" />
        </button>
      </div>

      <div class="flex items-center justify-center gap-2">
        <span class="counter-chip">🧺 Quitaste {{ removed.length }} de {{ task.k }}</span>
        <span class="counter-chip">Quedan {{ remaining }}</span>
      </div>

      <div class="flex items-center justify-center gap-3">
        <div
          data-drop="respuesta"
          class="slot h-24 w-24 flex-col"
          :class="answered != null ? 'slot-ok' : doneTaking ? 'slot-hot' : ''"
        >
          <span class="text-4xl font-black">{{ answered ?? '?' }}</span>
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <BlockTile
            v-for="n in task.options"
            :key="n"
            :label="String(n)"
            size="md"
            tone="rose"
            draggable
            :ghost-id="`n-${n}`"
            :state="bad === n ? 'bad' : 'idle'"
            @drop="drop(n, $event)"
          />
        </div>
      </div>
    </div>
  </GameShell>
</template>
