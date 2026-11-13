<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { nearbyDistractors, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'

const MAX = [5, 10, 20]

type Task = { a: number; b: number; op: '+' | '−'; result: number; options: number[] }

function make(_index: number, level: 1 | 2 | 3): Task {
  const max = MAX[level - 1]
  const op: '+' | '−' = Math.random() < 0.6 ? '+' : '−'
  let a: number
  let b: number
  let result: number
  if (op === '+') {
    a = 1 + Math.floor(Math.random() * (max - 1))
    b = 1 + Math.floor(Math.random() * (max - a))
    result = a + b
  } else {
    a = 2 + Math.floor(Math.random() * (max - 1))
    b = 1 + Math.floor(Math.random() * (a - 1))
    result = a - b
  }
  return { a, b, op, result, options: shuffle([result, ...nearbyDistractors(result, 3, max)]) }
}

const { task, index, total, celebrate, solve, miss, restart, mistakes } = useGame('m-operaciones', 7, make)
const answered = ref<number | null>(null)
const bad = ref<number | null>(null)

const instruction = computed(() => '¿Cuál es el resultado? Arrastra el número')
const hint = computed(() => mistakes.value > 0)

watch(
  task,
  () => {
    answered.value = null
    bad.value = null
    speak('Resuelve la operación y arrastra el número que falta')
  },
  { immediate: true },
)

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
    emoji="🧮"
    title="Cuentas"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-5">
      <div class="panel flex flex-col items-center gap-2 px-4 py-5">
        <div class="equation">
          <span>{{ task.a }}</span>
          <span class="text-amber-600">{{ task.op }}</span>
          <span>{{ task.b }}</span>
          <span>=</span>
          <span
            data-drop="respuesta"
            class="slot h-[72px] w-[72px] text-2xl"
            :class="answered != null ? 'slot-ok' : 'slot-hot'"
          >
            {{ answered ?? '?' }}
          </span>
        </div>

        <div v-if="hint && answered == null && task.op === '+'" class="flex items-center gap-2 pt-1">
          <span class="text-xs font-extrabold opacity-50">Ayuda:</span>
          <span v-for="n in task.a" :key="`h${n}`" class="dot-hint" />
          <span class="text-xs font-black opacity-40">+</span>
          <span v-for="n in task.b" :key="`hb${n}`" class="dot-hint" />
        </div>
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
