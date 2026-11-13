<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { WORDS } from '../../data'
import { pick } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

const VOWELS = 'aeiouáéíóú'

function make(_index: number, level: 1 | 2 | 3) {
  const candidates = WORDS.filter((w) => w.word.length >= 3 && w.word.length <= 7)
  const chosen = pick(candidates)
  const letters = [...chosen.word.toLowerCase()]
  const unique = [...new Set(letters)]
  let pool = unique
  if (level === 1) pool = unique.filter((l) => VOWELS.includes(l))
  if (level === 2) pool = unique.filter((l) => !VOWELS.includes(l))
  const target = pick(pool.length ? pool : unique)
  return { word: chosen.word, emoji: chosen.emoji, letters, target }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('l-en-palabra', 6, make)
const found = ref<number[]>([])
const badIndex = ref<number | null>(null)

const totalTargets = computed(() => task.value.letters.filter((l) => l === task.value.target).length)
const instruction = computed(() => `Toca la letra "${task.value.target}"`)

watch(
  task,
  (t) => {
    found.value = []
    badIndex.value = null
    speak(`Toca todas las letras ${t.target}`)
  },
  { immediate: true },
)

function tap(i: number) {
  if (found.value.includes(i)) return
  if (task.value.letters[i] === task.value.target) {
    found.value = [...found.value, i]
    sfx.tap()
    if (found.value.length === totalTargets.value) solve()
    return
  }
  badIndex.value = i
  miss()
  window.setTimeout(() => {
    if (badIndex.value === i) badIndex.value = null
  }, 600)
}
</script>

<template>
  <GameShell
    emoji="🔎"
    title="La letra escondida"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-5">
      <div class="panel flex flex-col items-center gap-2 px-4 py-5">
        <span class="text-6xl leading-none">{{ task.emoji }}</span>
        <div class="flex items-center gap-2">
          <span class="text-xs font-extrabold uppercase tracking-wide opacity-45">Busca</span>
          <span class="tile tile-sm tone-gold" style="cursor: default">{{ task.target }}</span>
        </div>

        <div class="flex flex-wrap justify-center gap-2 pt-1">
          <button
            v-for="(letter, i) in task.letters"
            :key="i"
            type="button"
            class="tile tile-lg"
            :class="
              found.includes(i)
                ? 'tone-grass tile-ok'
                : badIndex === i
                  ? 'tone-paper tile-bad'
                  : 'tone-paper'
            "
            @pointerdown.prevent="tap(i)"
          >
            {{ letter }}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-center gap-2">
        <span class="counter-chip">
          🎯 {{ found.length }} / {{ totalTargets }}
        </span>
      </div>
    </div>
  </GameShell>
</template>
