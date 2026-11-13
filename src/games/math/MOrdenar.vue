<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { range, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const COUNT = [4, 5, 6]
const MAX = [10, 15, 20]

type Task = { values: number[]; tray: number[] }

function make(_index: number, level: 1 | 2 | 3): Task {
  const values = shuffle(range(1, MAX[level - 1]))
    .slice(0, COUNT[level - 1])
    .sort((a, b) => a - b)
  return { values, tray: shuffle(values) }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('m-ordenar', 5, make)
const filled = ref<Record<number, number>>({})
const badZone = ref<string | null>(null)

const instruction = computed(() => 'Ordena los números del más pequeño al más grande')
const used = computed(() => Object.values(filled.value))
const nextPos = computed(() => {
  for (let i = 0; i < task.value.values.length; i++) if (filled.value[i] == null) return i
  return -1
})

watch(
  task,
  () => {
    filled.value = {}
    badZone.value = null
    speak('Ordena los números del más pequeño al más grande')
  },
  { immediate: true },
)

function drop(value: number, zone: string) {
  const match = /^pos-(\d+)$/.exec(zone)
  if (!match) return
  const pos = Number(match[1])
  if (filled.value[pos] != null) return
  if (task.value.values[pos] === value) {
    filled.value = { ...filled.value, [pos]: value }
    sfx.tap()
    if (Object.keys(filled.value).length === task.value.values.length) solve()
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
    emoji="📏"
    title="En orden"
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
          v-for="(_, i) in task.values"
          :key="i"
          class="slot h-[72px] w-[72px]"
          :data-drop="`pos-${i}`"
          :class="
            filled[i] != null
              ? 'slot-ok'
              : badZone === `pos-${i}`
                ? 'slot-bad'
                : i === nextPos
                  ? 'slot-hot'
                  : ''
          "
        >
          <span v-if="filled[i] != null" class="anim-pop text-2xl font-black">{{ filled[i] }}</span>
          <span v-else class="text-lg font-black opacity-25">{{ i + 1 }}º</span>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="v in task.tray"
          v-show="!used.includes(v)"
          :key="v"
          :label="String(v)"
          size="lg"
          tone="purple"
          draggable
          :ghost-id="`n-${v}`"
          @drop="drop(v, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
