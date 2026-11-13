<script setup lang="ts">
import { computed, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import TracePad from '../../components/TracePad.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { PREWRITING_POOLS, type Prewriting } from '../../lib/strokes'
import { speak } from '../../lib/speech'

function make(index: number, level: 1 | 2 | 3): Prewriting {
  const pool = PREWRITING_POOLS[level - 1]
  return pool[index % pool.length]
}

const { task, index, total, celebrate, solve, restart } = useGame('l-trazos', 3, make)

const instruction = computed(() => `Repasa ${task.value.label} con el dedo`)

watch(task, (t) => speak(`Repasa ${t.label}`), { immediate: true })
</script>

<template>
  <GameShell
    emoji="✏️"
    title="Trazos"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-3">
      <TracePad
        :key="index"
        :strokes="[{ d: task.d }]"
        hint="Sigue la línea desde el punto verde"
        @done="solve"
      />
      <p class="text-center text-xs font-bold opacity-50">
        Empieza en el punto verde y sigue la flecha.
      </p>
    </div>
  </GameShell>
</template>
