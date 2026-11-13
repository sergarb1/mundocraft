<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { nearbyDistractors, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const SIZES = [5, 8, 10]
const GAPS = [2, 2, 3]

type Task = { values: number[]; missing: number[]; options: number[] }

function make(_index: number, level: 1 | 2 | 3): Task {
  const n = SIZES[level - 1]
  const values = Array.from({ length: n }, (_, i) => i + 1)
  const gaps = GAPS[level - 1]
  const positions = shuffle(values.map((_, i) => i)).slice(0, gaps)
  const missing = positions.map((i) => values[i])
  const distractors = nearbyDistractors(missing[0], 2, n, missing)
  return { values, missing, options: shuffle([...missing, ...distractors]) }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('m-adelante', 6, make)
const filled = ref<Record<number, number>>({})
const badZone = ref<string | null>(null)

const instruction = computed(() => 'Completa el puente contando hacia delante')

watch(
  task,
  () => {
    filled.value = {}
    badZone.value = null
    speak('Completa el puente con los números que faltan')
  },
  { immediate: true },
)

const used = computed(() => Object.values(filled.value))

function drop(value: number, zone: string) {
  const match = /^gap-(\d+)$/.exec(zone)
  if (!match) return
  const pos = Number(match[1])
  if (filled.value[pos] != null) return
  if (task.value.values[pos] === value) {
    filled.value = { ...filled.value, [pos]: value }
    sfx.tap()
    if (Object.keys(filled.value).length === task.value.missing.length) solve()
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
    emoji="🌉"
    title="El puente"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-5">
      <div class="flex flex-wrap justify-center gap-2">
        <div
          v-for="(value, i) in task.values"
          :key="i"
          class="slot h-16 w-16"
          :data-drop="`gap-${i}`"
          :class="filled[i] != null ? 'slot-ok' : badZone === `gap-${i}` ? 'slot-bad' : ''"
        >
          <span v-if="filled[i] != null" class="anim-pop text-2xl font-black">{{ filled[i] }}</span>
          <span v-else-if="!task.missing.includes(value)" class="text-2xl font-black opacity-45">
            {{ value }}
          </span>
          <span v-else class="text-2xl font-black opacity-30">?</span>
        </div>
      </div>

      <div class="mx-auto h-2 w-3/4 rounded-full bg-amber-800/30" />

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="v in task.options"
          v-show="!used.includes(v)"
          :key="v"
          :label="String(v)"
          size="lg"
          tone="wood"
          draggable
          :ghost-id="`n-${v}`"
          @drop="drop(v, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
