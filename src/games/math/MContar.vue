<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import Pictogram from '../../components/Pictogram.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { nearbyDistractors, pick, range, ri, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const ITEMS = ['chicken', 'cow', 'sheep', 'carrot', 'corn', 'tomato', 'sunflower', 'eggplant', 'cabbage', 'potato']
const MAX = [6, 10, 16]

type Task = {
  n: number
  item: string
  options: number[]
  items: { id: number; rotate: number; dx: number; dy: number }[]
}

function make(_index: number, level: 1 | 2 | 3): Task {
  const max = MAX[level - 1]
  const n = ri(3, max)
  return {
    n,
    item: pick(ITEMS),
    options: shuffle([n, ...nearbyDistractors(n, 3, max)]),
    items: range(1, n).map((id) => ({
      id,
      rotate: ri(-16, 16),
      dx: ri(-4, 4),
      dy: ri(-4, 4),
    })),
  }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('m-contar', 6, make)
const tapped = ref<number[]>([])
const bad = ref<number | null>(null)
const answered = ref<number | null>(null)

const instruction = computed(() =>
  tapped.value.length >= task.value.n
    ? '¡Muy bien! Arrastra el número'
    : 'Toca los dibujos para contarlos',
)

watch(
  task,
  () => {
    tapped.value = []
    bad.value = null
    answered.value = null
    speak('Toca los dibujos para contarlos y arrastra el número')
  },
  { immediate: true },
)

function tapItem(id: number) {
  if (tapped.value.includes(id)) return
  tapped.value.push(id)
  sfx.tap()
  if (tapped.value.length === task.value.n) speak(`¡${task.value.n}!`)
}

function tapOrder(id: number) {
  const pos = tapped.value.indexOf(id)
  return pos >= 0 ? pos + 1 : 0
}

function drop(value: number, zone: string) {
  if (zone !== 'basket') return
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
    emoji="👆"
    title="Cuenta y elige"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-3">
      <div class="panel flex flex-wrap content-center justify-center gap-1 px-2 py-4">          <button
          v-for="item in task.items"
          :key="item.id"
          type="button"
          class="relative grid h-16 w-16 place-items-center rounded-xl text-5xl leading-none transition"
          :class="tapOrder(item.id) ? 'bg-amber-100' : ''"
          :style="{ transform: `rotate(${item.rotate}deg) translate(${item.dx}px, ${item.dy}px)` }"
          @pointerdown.prevent="tapItem(item.id)"
        >
          <Pictogram :name="task.item" />
          <span
            v-if="tapOrder(item.id)"
            class="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-xs font-black text-white shadow"
          >
            {{ tapOrder(item.id) }}
          </span>
        </button>
      </div>

      <div class="flex items-center justify-center gap-2">
        <span class="counter-chip">👆 {{ tapped.length }} contados</span>
        <span v-if="tapped.length >= task.n" class="counter-chip text-emerald-700">¡Listo!</span>
      </div>

      <div class="flex items-center justify-center gap-3">
        <div
          data-drop="basket"
          class="slot h-24 w-32 flex-col"
          :class="answered ? 'slot-ok' : ''"
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
