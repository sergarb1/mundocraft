<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import BlockTile from '../../components/BlockTile.vue'
import { useGame } from '../../lib/game'
import { goMap } from '../../lib/nav'
import { WORDS } from '../../data'
import { pick, shuffle } from '../../lib/rand'
import { randomSyllables } from '../../lib/syllables'
import { speak } from '../../lib/speech'
import { sfx } from '../../lib/sfx'

function make(_index: number, level: 1 | 2 | 3) {
  const target = level === 1 ? 2 : level === 2 ? 3 : 4
  const exact = WORDS.filter((w) => w.parts.length === target)
  const word = pick(exact.length ? exact : WORDS.filter((w) => w.parts.length >= 2))
  const tray = shuffle([...new Set([...word.parts, ...randomSyllables(2, word.parts)])])
  return { word, tray }
}

const { task, index, total, celebrate, solve, miss, restart } = useGame('s-ordenar', 6, make)
const filled = ref<Record<number, string>>({})
const badZone = ref<string | null>(null)

const instruction = computed(() => 'Ordena las sílabas de la palabra')
const used = computed(() => Object.values(filled.value))

watch(
  task,
  (t) => {
    filled.value = {}
    badZone.value = null
    speak(`Ordena las sílabas de la palabra ${t.word.word}`)
  },
  { immediate: true },
)

function drop(value: string, zone: string) {
  const match = /^slot-(\d+)$/.exec(zone)
  if (!match) return
  const pos = Number(match[1])
  if (filled.value[pos]) return
  if (task.value.word.parts[pos] === value) {
    filled.value = { ...filled.value, [pos]: value }
    sfx.tap()
    if (Object.keys(filled.value).length === task.value.word.parts.length) solve()
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
    emoji="🔤"
    title="En orden"
    :instruction="instruction"
    :celebrate="celebrate"
    :round="index"
    :total="total"
    @home="goMap"
    @restart="restart"
  >
    <div class="flex flex-1 flex-col justify-center gap-5">
      <div class="panel mx-auto flex w-full max-w-sm flex-col items-center gap-3 px-4 py-4">
        <span class="text-5xl leading-none">{{ task.word.emoji }}</span>
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <div
            v-for="(part, i) in task.word.parts"
            :key="i"
            class="slot h-[72px] w-20 text-2xl"
            :data-drop="`slot-${i}`"
            :class="filled[i] ? 'slot-ok' : ''"
          >
            <span v-if="filled[i]" class="anim-pop">{{ filled[i] }}</span>
            <span v-else class="opacity-30">?</span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-2.5">
        <BlockTile
          v-for="syl in task.tray"
          v-show="!used.includes(syl)"
          :key="syl"
          :label="syl"
          size="lg"
          tone="sky"
          draggable
          :ghost-id="syl"
          :state="badZone ? 'idle' : 'idle'"
          @drop="drop(syl, $event)"
        />
      </div>
    </div>
  </GameShell>
</template>
