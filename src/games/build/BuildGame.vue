<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import GameShell from '../../components/GameShell.vue'
import { goMap } from '../../lib/nav'
import { progress } from '../../lib/progress'
import { sfx } from '../../lib/sfx'
import { blockTex, cubeArt } from '../../lib/art'

const SIZE = 10
const BLOCKS = [
  { id: 'grass', name: 'Césped' },
  { id: 'dirt', name: 'Tierra' },
  { id: 'stone', name: 'Piedra' },
  { id: 'cobblestone', name: 'Roca' },
  { id: 'oak_planks', name: 'Madera' },
  { id: 'oak_leaves', name: 'Hojas' },
  { id: 'water', name: 'Agua' },
  { id: 'sand', name: 'Arena' },
  { id: 'bricks', name: 'Ladrillo' },
]

const LEGACY: Record<string, string> = {
  wood: 'oak_planks',
  leaf: 'oak_leaves',
  brick: 'bricks',
  flower: 'grass',
}

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
  grid.value = cells.map((raw) => {
    const id = LEGACY[raw] ?? raw
    return BLOCKS.some((b) => b.id === id) ? id : 'grass'
  })
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

const currentName = () => BLOCKS.find((b) => b.id === current.value)?.name ?? ''
</script>

<template>
  <GameShell
    emoji="⛏️"
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
        <div
          v-for="(block, i) in grid"
          :key="i"
          class="cell"
          :style="{ backgroundImage: `url(${blockTex(block)})` }"
        />
      </div>

      <div class="flex items-center justify-between gap-2 px-1">
        <span class="counter-chip">
          <img class="hotbar-cube" :src="cubeArt(current)" alt="" draggable="false" />
          {{ currentName() }}
        </span>
        <button type="button" class="big-btn tone-paper" @click="clearAll">
          {{ confirmClear ? '¿Seguro? Otra vez' : '🧹 Borrar' }}
        </button>
      </div>

      <div class="hotbar">
        <button
          v-for="block in BLOCKS"
          :key="block.id"
          type="button"
          class="palette-btn"
          :class="{ 'palette-on': current === block.id }"
          :aria-label="block.name"
          @pointerdown.prevent="current = block.id"
        >
          <img :src="cubeArt(block.id)" alt="" draggable="false" />
          <span class="palette-name">{{ block.name }}</span>
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
  padding: 7px;
  border-radius: 14px;
  background: #4a3218;
  border: 5px solid #3b2a17;
  box-shadow:
    inset 0 0 0 3px rgba(0, 0, 0, 0.3),
    0 8px 0 rgba(43, 33, 24, 0.18);
  touch-action: none;
}

.cell {
  border-radius: 3px;
  background-size: cover;
  image-rendering: pixelated;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.18), inset 0 -2px 0 rgba(0, 0, 0, 0.16);
  aspect-ratio: 1 / 1;
}

.hotbar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  padding: 7px;
  border-radius: 16px;
  background: rgba(43, 33, 24, 0.55);
  box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.28);
}

.palette-btn {
  min-height: 60px;
  border-radius: 8px;
  background: rgba(255, 253, 245, 0.14);
  border: 3px solid rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transition: transform 0.08s, background 0.15s;
}

.palette-btn img {
  width: 34px;
  height: 34px;
  image-rendering: pixelated;
}

.palette-name {
  font-size: 0.58rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  line-height: 1;
}

.palette-on {
  background: rgba(255, 201, 60, 0.35);
  border-color: #ffc93c;
  transform: translateY(-2px);
}

.hotbar-cube {
  width: 22px;
  height: 22px;
  image-rendering: pixelated;
}
</style>
