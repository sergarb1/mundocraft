<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { SYLLABLE_WORDS } from '../../data'
import { pick, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'

function make(_index: number, level: 1 | 2 | 3) {
  const target = level === 1 ? 2 : level === 2 ? 3 : 4
  const exact = SYLLABLE_WORDS.filter((word) => word.parts.length === target)
  const word = pick(exact.length ? exact : SYLLABLE_WORDS)
  const options = level === 1 ? [2, 3] : [2, 3, 4]
  return { word, options: shuffle(options) }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-cuentas', 7, make)
const bad = ref<number | null>(null)

const instruction = computed(() => '¿Cuántas sílabas tiene?')

watch(
  task,
  (t) => {
    bad.value = null
    speak(`${t.word.word}. ¿Cuántas sílabas tiene?`)
  },
  { immediate: true },
)

function choose(value: number) {
  if (value === task.value.word.parts.length) {
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
    emoji="👏"
    title="Cuenta sílabas"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-5">
      <div class="panel mx-auto flex w-full max-w-sm flex-col items-center gap-3 px-4 py-5">
        <span class="text-6xl leading-none">{{ task.word.emoji }}</span>
        <span class="text-center text-2xl font-black tracking-wide">{{ task.word.word }}</span>
        <span class="text-sm font-extrabold opacity-55">Toca el número de sílabas</span>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <BlockTile
          v-for="(option, i) in task.options"
          :key="option"
          :label="String(option)"
          size="xl"
          :tone="['sky', 'gold', 'rose'][i % 3]"
          :state="bad === option ? 'bad' : 'idle'"
          @pick="choose(option)"
        />
      </div>
    </div>
  </GameShell>
</template>
