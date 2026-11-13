<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { LOWERCASE } from '../../data'
import { sample, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const COUNTS = [2, 3, 4]

function make(_index: number, level: 1 | 2 | 3) {
  const upper = sample(LOWERCASE, COUNTS[level - 1]).map((l) => l.toUpperCase())
  return { targets: upper, tiles: shuffle(upper.map((l) => l.toLowerCase())) }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('l-parejas', 5, make)
const filled = ref<Record<string, string>>({})
const badZone = ref<string | null>(null)

const instruction = computed(() => 'Lleva cada letra pequeña a su letra grande')
const placed = computed(() => Object.values(filled.value))

watch(
  task,
  () => {
    filled.value = {}
    badZone.value = null
    speak('Lleva cada letra minúscula a su letra mayúscula')
  },
  { immediate: true },
)

function drop(letter: string, zone: string) {
  const match = /^up-(.+)$/.exec(zone)
  if (!match) return
  const target = match[1]
  if (filled.value[target]) return
  if (target === letter.toUpperCase()) {
    filled.value = { ...filled.value, [target]: letter }
    sfx.tap()
    if (Object.keys(filled.value).length === task.value.targets.length) solve()
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
    emoji="🅰️"
    title="Parejas"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-5">
      <div class="flex flex-wrap justify-center gap-3">
        <div
          v-for="letter in task.targets"
          :key="letter"
          class="slot h-24 w-24 flex-col"
          :data-drop="`up-${letter}`"
          :class="filled[letter] ? 'slot-ok' : badZone === `up-${letter}` ? 'slot-bad' : ''"
        >
          <span class="text-4xl font-black">{{ letter }}</span>
          <span v-if="filled[letter]" class="text-sm font-black text-emerald-700">
            {{ filled[letter] }} ✓
          </span>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="letter in task.tiles"
          v-show="!placed.includes(letter)"
          :key="letter"
          :label="letter"
          size="lg"
          tone="wood"
          draggable
          :ghost-id="letter"
          @drop="drop(letter, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
