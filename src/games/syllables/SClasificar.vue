<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { SYLLABLE_WORDS, TRACE_SYLLABLES } from '../../data'
import { sample, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'
import { wordsByFirstSyllable } from '../../lib/syllables'

const grouped = wordsByFirstSyllable(
  SYLLABLE_WORDS.filter((w) => TRACE_SYLLABLES.includes(w.parts[0])),
)

function make(_index: number, level: 1 | 2 | 3) {
  const count = level === 1 ? 2 : 3
  const keys = shuffle([...grouped.keys()].filter((k) => (grouped.get(k)?.length ?? 0) >= 2)).slice(0, count)
  const cards = keys
    .flatMap((key) => sample(grouped.get(key) ?? [], 2))
    .map((word, id) => ({ id, word, emoji: word.emoji, basket: word.parts[0] }))
  return { baskets: keys, cards: shuffle(cards) }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-clasificar', 5, make)
const placed = ref<number[]>([])
const badZone = ref<string | null>(null)

const instruction = computed(() => 'Lleva cada dibujo a su cesta')
const allPlaced = computed(() => placed.value.length === task.value.cards.length)

watch(
  task,
  () => {
    placed.value = []
    badZone.value = null
    speak('Lleva cada dibujo a la cesta de su primera sílaba')
  },
  { immediate: true },
)

function drop(card: { id: number; basket: string }, zone: string) {
  const match = /^basket-(.+)$/.exec(zone)
  if (!match) return
  const target = match[1]
  if (placed.value.includes(card.id)) return
  if (target === card.basket) {
    placed.value = [...placed.value, card.id]
    sfx.tap()
    if (allPlaced.value) solve()
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
    emoji="🧺"
    title="Las cestas"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        <div
          v-for="key in task.baskets"
          :key="key"
          class="panel flex min-h-[112px] w-[30%] min-w-[98px] flex-col items-center gap-1 p-2"
          :data-drop="`basket-${key}`"
          :class="badZone === `basket-${key}` ? 'ring-4 ring-rose-400' : ''"
        >
          <span class="tile tile-sm tone-wood" style="cursor: default">{{ key }}</span>
          <div class="flex flex-wrap justify-center gap-0.5">
            <span
              v-for="card in task.cards.filter((c) => c.basket === key && placed.includes(c.id))"
              :key="card.id"
              class="anim-pop text-2xl leading-none"
            >
              {{ card.emoji }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        <BlockTile
          v-for="card in task.cards"
          v-show="!placed.includes(card.id)"
          :key="card.id"
          :emoji="card.emoji"
          size="lg"
          tone="paper"
          draggable
          :ghost-id="`card-${card.id}`"
          @drop="drop(card, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
