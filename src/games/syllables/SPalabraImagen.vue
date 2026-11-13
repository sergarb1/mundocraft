<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { SYLLABLE_WORDS } from '../../data'
import { sample, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

function make(_index: number, level: 1 | 2 | 3) {
  const count = level === 1 ? 2 : 3
  const words = sample(SYLLABLE_WORDS.filter((w) => w.parts.length <= 3), count)
  return {
    cards: words.map((w, id) => ({ id, emoji: w.emoji, word: w.word, parts: w.parts })),
    tiles: shuffle(words.map((w, id) => ({ id, word: w.word }))),
  }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-palabra-imagen', 5, make)
const matched = ref<number[]>([])
const badZone = ref<string | null>(null)

const instruction = computed(() => 'Lleva cada palabra a su dibujo')

watch(
  task,
  () => {
    matched.value = []
    badZone.value = null
    speak('Lleva cada palabra al dibujo que le corresponde')
  },
  { immediate: true },
)

function drop(id: number, zone: string) {
  const match = /^img-(\d+)$/.exec(zone)
  if (!match) return
  const target = Number(match[1])
  if (matched.value.includes(target)) return
  if (target === id) {
    matched.value = [...matched.value, target]
    sfx.tap()
    if (matched.value.length === task.value.cards.length) solve()
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
    emoji="🎴"
    title="Palabra y dibujo"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        <BlockTile
          v-for="tile in task.tiles"
          :key="`t-${tile.id}`"
          v-show="!matched.includes(tile.id)"
          :label="tile.word"
          size="word"
          tone="wood"
          draggable
          :ghost-id="`word-${tile.id}`"
          @drop="drop(tile.id, $event)"
        />
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        <div
          v-for="card in task.cards"
          :key="`c-${card.id}`"
          class="panel flex h-28 w-28 flex-col items-center justify-center gap-1"
          :data-drop="`img-${card.id}`"
          :class="[
            matched.includes(card.id) ? 'opacity-60 ring-4 ring-emerald-400' : '',
            badZone === `img-${card.id}` ? 'ring-4 ring-rose-400' : '',
          ]"
        >
          <span class="text-4xl leading-none">{{ card.emoji }}</span>
          <span v-if="matched.includes(card.id)" class="text-[0.7rem] font-black">{{ card.word }}</span>
        </div>
      </div>
    </div>
  </GameShell>
</template>
