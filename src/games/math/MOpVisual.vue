<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { nearbyDistractors, pick, ri, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const ITEMS = ['🍎', '🍓', '🐤', '🌸', '🥕', '🍇']
const MAX_SUM = [5, 10, 12]

type Pair = { id: number; a: number; b: number; emoji: string }
type Task = { pairs: Pair[]; ops: Pair[] }

function make(_index: number, level: 1 | 2 | 3): Task {
  const max = MAX_SUM[level - 1]
  const pairs: Pair[] = []
  const used = new Set<string>()
  let guard = 0
  while (pairs.length < 3 && guard++ < 60) {
    const a = ri(1, max - 1)
    const b = ri(1, max - a)
    const key = `${a}+${b}`
    if (used.has(key)) continue
    used.add(key)
    pairs.push({ id: pairs.length, a, b, emoji: pick(ITEMS) })
  }
  while (pairs.length < 3) {
    pairs.push({ id: pairs.length, a: pairs.length + 1, b: 1, emoji: '⭐' })
  }
  return { pairs, ops: shuffle(pairs) }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('m-opvisual', 5, make)
const matched = ref<number[]>([])
const badZone = ref<string | null>(null)

const instruction = computed(() => 'Lleva cada cuenta a su dibujo')
const done = computed(() => matched.value.length === task.value.pairs.length)

watch(
  task,
  () => {
    matched.value = []
    badZone.value = null
    speak('Arrastra cada cuenta al dibujo que la representa')
  },
  { immediate: true },
)

function drop(id: number, zone: string) {
  const match = /^visual-(\d+)$/.exec(zone)
  if (!match) return
  const target = Number(match[1])
  if (matched.value.includes(target)) return
  if (target === id) {
    matched.value = [...matched.value, target]
    sfx.tap()
    if (matched.value.length === task.value.pairs.length) solve()
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
    emoji="🖼️"
    title="Cuenta y dibujo"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-3">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <BlockTile
            v-for="p in task.ops"
            :key="`op-${p.id}`"
            :label="`${p.a} + ${p.b}`"
            size="md"
            tone="gold"
            draggable
            :ghost-id="`op-${p.id}`"
            :state="matched.includes(p.id) ? 'dim' : 'idle'"
            :disabled="matched.includes(p.id)"
            @drop="drop(p.id, $event)"
          />
        </div>

        <div class="flex flex-col gap-2">
          <div
            v-for="p in task.pairs"
            :key="`vis-${p.id}`"
            class="panel flex min-h-[74px] flex-wrap content-center items-center justify-center gap-1 px-2 py-2"
            :data-drop="`visual-${p.id}`"
            :class="[
              matched.includes(p.id) ? 'opacity-40 ring-4 ring-emerald-400' : '',
              badZone === `visual-${p.id}` ? 'ring-4 ring-rose-400' : '',
            ]"
          >
            <span v-for="n in p.a" :key="`va${n}`" class="text-2xl leading-none">{{ p.emoji }}</span>
            <span class="px-1 text-xl font-black opacity-60">+</span>
            <span v-for="n in p.b" :key="`vb${n}`" class="text-2xl leading-none">{{ p.emoji }}</span>
            <span v-if="matched.includes(p.id)" class="ml-1 text-xl">✅</span>
          </div>
        </div>
      </div>

      <p v-if="done" class="text-center text-sm font-black text-emerald-700">¡Todo emparejado!</p>
    </div>
  </GameShell>
</template>
