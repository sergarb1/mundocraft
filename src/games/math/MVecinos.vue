<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { nearbyDistractors, ri, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const MAX = [10, 15, 20]

function make(_index: number, level: 1 | 2 | 3) {
  const max = MAX[level - 1]
  const n = ri(2, max - 1)
  const prev = n - 1
  const next = n + 1
  return {
    n,
    prev,
    next,
    options: shuffle([prev, next, ...nearbyDistractors(n, 2, max, [prev, next])]),
  }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('m-vecinos', 7, make)
const filled = ref<{ prev: number | null; next: number | null }>({ prev: null, next: null })
const badZone = ref<string | null>(null)

const instruction = computed(() => `¿Qué número va antes y después del ${task.value.n}?`)
const used = computed(() => [filled.value.prev, filled.value.next].filter((n): n is number => n != null))

watch(
  task,
  () => {
    filled.value = { prev: null, next: null }
    badZone.value = null
    speak(`¿Qué número va antes y después del ${task.value.n}?`)
  },
  { immediate: true },
)

function drop(value: number, zone: string) {
  if (zone !== 'prev' && zone !== 'next') return
  if (filled.value[zone] != null) return
  const expected = zone === 'prev' ? task.value.prev : task.value.next
  if (value === expected) {
    filled.value = { ...filled.value, [zone]: value }
    sfx.tap()
    if (filled.value.prev != null && filled.value.next != null) solve()
    return
  }
  badZone.value = zone
  miss()
  window.setTimeout(() => {
    if (badZone.value === zone) badZone.value = null
  }, 600)
}
</script>

<template>
  <GameShell
    emoji="🔍"
    title="Antes y después"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-6">
      <div class="flex items-center justify-center gap-3">
        <div
          data-drop="prev"
          class="slot h-24 w-24 flex-col"
          :class="filled.prev != null ? 'slot-ok' : badZone === 'prev' ? 'slot-bad' : ''"
        >
          <span class="text-3xl font-black">{{ filled.prev ?? '?' }}</span>
          <span class="text-[0.65rem] font-extrabold uppercase opacity-50">antes</span>
        </div>

        <div class="tile tile-xl tone-paper anim-float">
          <span class="text-4xl font-black">{{ task.n }}</span>
        </div>

        <div
          data-drop="next"
          class="slot h-24 w-24 flex-col"
          :class="filled.next != null ? 'slot-ok' : badZone === 'next' ? 'slot-bad' : ''"
        >
          <span class="text-3xl font-black">{{ filled.next ?? '?' }}</span>
          <span class="text-[0.65rem] font-extrabold uppercase opacity-50">después</span>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="v in task.options"
          v-show="!used.includes(v)"
          :key="v"
          :label="String(v)"
          size="lg"
          tone="rose"
          draggable
          :ghost-id="`n-${v}`"
          @drop="drop(v, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
