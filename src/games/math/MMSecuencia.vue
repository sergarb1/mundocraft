<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { nearbyDistractors, ri, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const STEPS = [[1], [2, 5], [2, 5, 10]]

type Task = { values: number[]; missing: number[]; options: number[] }

function make(_index: number, level: 1 | 2 | 3): Task {
  const step = STEPS[level - 1][Math.floor(Math.random() * STEPS[level - 1].length)]
  const length = step >= 10 ? 3 : step >= 5 ? 4 : 5
  const maxStart = Math.max(0, 20 - step * (length - 1) - 2)
  const start = ri(0, maxStart)
  const values = Array.from({ length }, (_, i) => start + i * step)
  const positions = shuffle(Array.from({ length: length - 1 }, (_, i) => i + 1)).slice(0, 2)
  const missing = positions.map((i) => values[i])
  const distractors = nearbyDistractors(missing[0], 2, Math.max(values[values.length - 1] + 2, 6), missing)
  return { values, missing, options: shuffle([...missing, ...distractors]) }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('m-secuencia', 6, make)
const filled = ref<Record<number, number>>({})
const badZone = ref<string | null>(null)

const instruction = computed(() => 'Completa la serie de números')
const used = computed(() => Object.values(filled.value))

watch(
  task,
  () => {
    filled.value = {}
    badZone.value = null
    speak('Completa la serie de números que falta')
  },
  { immediate: true },
)

function drop(value: number, zone: string) {
  const match = /^seq-(\d+)$/.exec(zone)
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
    emoji="🧩"
    title="La serie"
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
          class="slot h-[72px] w-[72px]"
          :data-drop="`seq-${i}`"
          :class="filled[i] != null ? 'slot-ok' : ''"
        >
          <span v-if="filled[i] != null" class="anim-pop text-2xl font-black">{{ filled[i] }}</span>
          <span v-else-if="!task.missing.includes(value)" class="text-2xl font-black opacity-45">
            {{ value }}
          </span>
          <span v-else class="slot-q">?</span>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="v in task.options"
          v-show="!used.includes(v)"
          :key="v"
          :label="String(v)"
          size="lg"
          tone="gold"
          draggable
          :ghost-id="`n-${v}`"
          @drop="drop(v, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
