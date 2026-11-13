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
const MAX_SUM = [5, 10, 20]

function make(_index: number, level: 1 | 2 | 3) {
  const max = MAX_SUM[level - 1]
  const a = ri(1, max - 1)
  const b = ri(1, max - a)
  const sum = a + b
  return { a, b, sum, item: pick(ITEMS), options: shuffle([sum, ...nearbyDistractors(sum, 3, max)]) }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('m-sumar', 7, make)

const mergedA = ref(false)
const mergedB = ref(false)
const answered = ref<number | null>(null)
const bad = ref<number | null>(null)

const basketCount = computed(
  () => (mergedA.value ? task.value.a : 0) + (mergedB.value ? task.value.b : 0),
)
const instruction = computed(() => `¿Cuánto es ${task.value.a} + ${task.value.b}?`)

watch(
  task,
  () => {
    mergedA.value = false
    mergedB.value = false
    answered.value = null
    bad.value = null
    speak(`¿Cuánto es ${task.value.a} más ${task.value.b}?`)
  },
  { immediate: true },
)

function merge(side: 'a' | 'b') {
  if (side === 'a' && !mergedA.value) {
    mergedA.value = true
    sfx.drop()
  }
  if (side === 'b' && !mergedB.value) {
    mergedB.value = true
    sfx.drop()
  }
}

function drop(value: number, zone: string) {
  if (zone !== 'respuesta') return
  if (value === task.value.sum) {
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
    emoji="➕"
    title="Sumar"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-3">
      <div class="flex items-center justify-center gap-2">
        <button
          type="button"
          class="panel flex max-w-[42%] flex-wrap content-center justify-center gap-1 px-3 py-3"
          :class="mergedA ? 'opacity-35' : ''"
          @pointerdown.prevent="merge('a')"
        >
          <span v-for="n in task.a" :key="`a${n}`" class="text-3xl leading-none">
            <Pictogram :name="task.item" />
          </span>
        </button>
        <span class="text-2xl font-black">+</span>
        <button
          type="button"
          class="panel flex max-w-[42%] flex-wrap content-center justify-center gap-1 px-3 py-3"
          :class="mergedB ? 'opacity-35' : ''"
          @pointerdown.prevent="merge('b')"
        >
          <span v-for="n in task.b" :key="`b${n}`" class="text-3xl leading-none">
            <Pictogram :name="task.item" />
          </span>
        </button>
      </div>

      <div
        class="panel flex min-h-[74px] flex-wrap content-center justify-center gap-1 px-3 py-2"
        :class="basketCount === task.sum ? 'ring-4 ring-emerald-400' : ''"
      >
        <span v-if="basketCount === 0" class="text-xs font-extrabold opacity-50">
          Toca los grupos para juntarlos
        </span>
        <span v-for="n in basketCount" :key="`c${n}`" class="anim-pop text-3xl leading-none">
          <Pictogram :name="task.item" />
        </span>
      </div>

      <div class="flex items-center justify-center gap-3">
        <span class="text-3xl font-black">=</span>
        <div
          data-drop="respuesta"
          class="slot h-24 w-24 flex-col"
          :class="answered != null ? 'slot-ok' : ''"
        >
          <span class="text-4xl font-black">{{ answered ?? '?' }}</span>
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <BlockTile
            v-for="n in task.options"
            :key="n"
            :label="String(n)"
            size="md"
            tone="leaf"
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
