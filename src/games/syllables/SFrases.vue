<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { PHRASES } from '../../data'
import { pick, shuffle } from '../../lib/rand'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

function make(_index: number, level: 1 | 2 | 3) {
  const count = level === 1 ? 3 : level === 2 ? 4 : 5
  const pool = PHRASES.filter((phrase) => phrase.words.length === count)
  const phrase = pick(pool.length ? pool : PHRASES)
  const tray = shuffle(phrase.words.map((word, id) => ({ id, word })))
  if (tray.length > 1 && tray.every((tile, i) => tile.id === i)) {
    tray.push(tray.shift()!)
  }
  return { phrase, tray }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-frases', 5, make)
const filled = ref<Record<number, number>>({})
const used = ref<number[]>([])
const badSlot = ref<number | null>(null)
const badTile = ref<number | null>(null)

const instruction = computed(() => 'Ordena las palabras de la frase')
const done = computed(() => Object.keys(filled.value).length === task.value.phrase.words.length)

watch(
  task,
  (t) => {
    filled.value = {}
    used.value = []
    badSlot.value = null
    badTile.value = null
    speak(`Ordena las palabras de la frase. ${t.phrase.words.join(' ')}`)
  },
  { immediate: true },
)

function wordOf(id: number) {
  return task.value.phrase.words[id]
}

function dropWord(id: number, zone: string | null) {
  if (done.value) return
  const match = /^word-slot-(\d+)$/.exec(zone ?? '')
  if (!match) return
  const pos = Number(match[1])
  if (filled.value[pos] !== undefined) return

  if (id === pos) {
    filled.value = { ...filled.value, [pos]: id }
    used.value = [...used.value, id]
    sfx.tap()
    if (Object.keys(filled.value).length === task.value.phrase.words.length) solve()
    return
  }

  badSlot.value = pos
  badTile.value = id
  miss()
  window.setTimeout(() => {
    if (badSlot.value === pos) badSlot.value = null
    if (badTile.value === id) badTile.value = null
  }, 600)
}
</script>

<template>
  <GameShell
    emoji="📝"
    title="Frases"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-4">
      <div class="panel mx-auto flex w-full max-w-md flex-col items-center gap-3 px-3 py-4">
        <span class="text-6xl leading-none">{{ task.phrase.emoji }}</span>

        <div class="sentence-slots" role="group" aria-label="Palabras de la frase">
          <div
            v-for="(word, pos) in task.phrase.words"
            :key="pos"
            class="sentence-slot"
            :class="[
              filled[pos] !== undefined ? 'sentence-slot-ok' : '',
              badSlot === pos ? 'slot-bad' : '',
            ]"
            :data-drop="`word-slot-${pos}`"
          >
            <span v-if="filled[pos] !== undefined" class="anim-pop">{{ wordOf(filled[pos]) }}</span>
            <span v-else class="slot-q">?</span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-2.5">
        <BlockTile
          v-for="tile in task.tray"
          :key="`word-${tile.id}`"
          v-show="!used.includes(tile.id)"
          :label="tile.word"
          size="word"
          tone="leaf"
          draggable
          :ghost-id="`sentence-word-${tile.id}`"
          :state="badTile === tile.id ? 'bad' : 'idle'"
          @drop="dropWord(tile.id, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>

<style scoped>
.sentence-slots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  width: 100%;
}

.sentence-slot {
  min-height: 62px;
  min-width: 60px;
  max-width: 100%;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 4px dashed rgba(43, 33, 24, 0.3);
  background: rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 3px 0 rgba(0, 0, 0, 0.05);
  font-size: clamp(0.9rem, 4vw, 1.1rem);
  font-weight: 900;
  line-height: 1;
  overflow-wrap: anywhere;
}

.sentence-slot-ok {
  border-color: #35c46a;
  border-style: solid;
  background: #eafff0;
  color: #14532d;
  animation: pop 0.3s ease-out;
}

.sentence-slot .slot-q {
  font-size: 1.5rem;
}
</style>
