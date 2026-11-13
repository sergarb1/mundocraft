<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import { goMap } from '../../lib/nav'
import { progress } from '../../lib/progress'
import { sfx } from '../../lib/sfx'

const SIZE = 10
const BLOCKS = [
  { id: 'grass', emoji: '🟩', name: 'Césped' },
  { id: 'dirt', emoji: '🟫', name: 'Tierra' },
  { id: 'stone', emoji: '⬜', name: 'Piedra' },
  { id: 'wood', emoji: '🟧', name: 'Madera' },
  { id: 'leaf', emoji: '🌿', name: 'Hojas' },
  { id: 'water', emoji: '💧', name: 'Agua' },
  { id: 'sand', emoji: '🟨', name: 'Arena' },
  { id: 'brick', emoji: '🧱', name: 'Ladrillo' },
  { id: 'flower', emoji: '🌸', name: 'Flores' },
]

const grid = ref<string[]>(Array(SIZE * SIZE).fill('grass'))
const current = ref('grass')
const painting = ref(false)
const gridEl = ref<HTMLElement | null>(null)
const confirmClear = ref(false)

onMounted(() => {
  const saved = progress.build
  if (!saved) return
  const cells = saved.split(' ')
  if (cells.length !== SIZE * SIZE) return
  grid.value = cells.map((id) => (BLOCKS.some((b) => b.id === id) ? id : 'grass'))
})

let saveTimer = 0
watch(
  grid,
  (value) => {
    window.clearTimeout(saveTimer)
    const snapshot = value.join(' ')
    saveTimer = window.setTimeout(() => {
      progress.build = snapshot
    }, 400)
  },
  { deep: true },
)

function paintAt(clientX: number, clientY: number) {
  const el = gridEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const col = Math.floor(((clientX - rect.left) / rect.width) * SIZE)
  const row = Math.floor(((clientY - rect.top) / rect.height) * SIZE)
  if (col < 0 || col >= SIZE || row < 0 || row >= SIZE) return
  const i = row * SIZE + col
  if (grid.value[i] === current.value) return
  grid.value[i] = current.value
  sfx.tap()
}

function onDown(e: PointerEvent) {
  e.preventDefault()
  painting.value = true
  paintAt(e.clientX, e.clientY)
  try {
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
}

function onMove(e: PointerEvent) {
  if (!painting.value) return
  e.preventDefault()
  paintAt(e.clientX, e.clientY)
}

function onUp() {
  painting.value = false
}

function clearAll() {
  if (!confirmClear.value) {
    confirmClear.value = true
    window.setTimeout(() => (confirmClear.value = false), 2500)
    return
  }
  grid.value = Array(SIZE * SIZE).fill('grass')
  confirmClear.value = false
}
</script>

<template>
  <GameShell
    emoji="🧱"
    title="Construcción libre"
    instruction="Toca o arrastra para construir tu mundo"
    @home="goMap"
  >
    <div class="flex flex-1 flex-col justify-center gap-3">
      <div
        ref="gridEl"
        class="build-grid"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      >
        <div v-for="(block, i) in grid" :key="i" class="cell" :class="`cell-${block}`" />
      </div>

      <div class="flex items-center justify-between px-1">
        <span class="counter-chip">{{ BLOCKS.find((b) => b.id === current)?.emoji }} {{ BLOCKS.find((b) => b.id === current)?.name }}</span>
        <button type="button" class="big-btn tone-paper" @click="clearAll">
          {{ confirmClear ? '¿Seguro? Toca otra vez' : '🧹 Borrar' }}
        </button>
      </div>

      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="block in BLOCKS"
          :key="block.id"
          type="button"
          class="palette-btn"
          :class="{ 'palette-on': current === block.id }"
          :aria-label="block.name"
          @pointerdown.prevent="current = block.id"
        >
          <span class="text-xl leading-none">{{ block.emoji }}</span>
          <span class="text-[0.6rem] font-bold opacity-70">{{ block.name }}</span>
        </button>
      </div>

      <p class="text-center text-xs font-bold opacity-45">Tu mundo se guarda solo ✅</p>
    </div>
  </GameShell>
</template>

<style scoped>
.build-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
  padding: 6px;
  border-radius: 18px;
  background: #5f3d1e;
  border: 4px solid #4c8b24;
  box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.22), 0 8px 0 rgba(43, 33, 24, 0.14);
  touch-action: none;
}

.cell {
  border-radius: 4px;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.18);
  aspect-ratio: 1 / 1;
}

.cell-grass {
  background: radial-gradient(circle at 30% 30%, #9ce45f, #74bd3e);
}
.cell-dirt {
  background: radial-gradient(circle at 30% 30%, #b9804c, #8a5a2e);
}
.cell-stone {
  background: radial-gradient(circle at 30% 30%, #d7dee6, #9aa6b4);
}
.cell-wood {
  background: repeating-linear-gradient(90deg, #d79a53 0 6px, #c78a45 6px 8px);
}
.cell-leaf {
  background: radial-gradient(circle at 60% 40%, #6fc95b, #3f9138);
}
.cell-water {
  background: radial-gradient(circle at 40% 30%, #8fdcff, #3f9fd8);
}
.cell-sand {
  background: radial-gradient(circle at 30% 30%, #ffe9a3, #eccb6c);
}
.cell-brick {
  background: repeating-linear-gradient(0deg, #c1613f 0 7px, #a94e31 7px 9px);
}
.cell-flower {
  background: radial-gradient(circle at 50% 40%, #ffd1e2 0 30%, #6fc95b 32%, #4f9f3e);
}

.palette-btn {
  min-height: 52px;
  border-radius: 14px;
  background: #fffdf5;
  border: 3px solid rgba(43, 33, 24, 0.16);
  box-shadow: 0 4px 0 rgba(43, 33, 24, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.palette-on {
  outline: 4px solid #35c46a;
  outline-offset: 1px;
  animation: pop 0.25s ease-out;
}
</style>
