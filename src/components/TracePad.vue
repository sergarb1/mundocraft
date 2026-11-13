<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { TraceStroke } from '../lib/strokes'
import { sfx } from '../lib/sfx'

const props = withDefaults(
  defineProps<{
    strokes: TraceStroke[]
    tolerance?: number
    completeRatio?: number
    showStart?: boolean
    freeMode?: boolean
    color?: string
    hint?: string
  }>(),
  {
    tolerance: 7,
    completeRatio: 0.88,
    showStart: true,
    freeMode: false,
    color: '#f97316',
    hint: 'Repasa con el dedo',
  },
)

const emit = defineEmits<{ done: []; progress: [number] }>()

const svg = ref<SVGSVGElement | null>(null)
const paths = ref<SVGPathElement[]>([])
const samples = ref<{ x: number; y: number }[][]>([])
const covered = ref<boolean[][]>([])
const ink = ref<string[]>([])
const ai = ref(0)
const lastIdx = ref(0)
const drawing = ref(false)
const hintPulse = ref(false)
const done = ref(false)
const pct = ref(0)
let resizeObserver: ResizeObserver | null = null

const activeIdx = computed(() =>
  props.strokes.map((s, i) => (s.active === false ? -1 : i)).filter((i) => i >= 0),
)
const current = computed(() => activeIdx.value[Math.min(ai.value, Math.max(0, activeIdx.value.length - 1))] ?? -1)
const currentPts = computed(() => samples.value[current.value] ?? [])
const startPt = computed(() => currentPts.value[0] ?? null)
const arrow = computed(() => {
  const pts = currentPts.value
  if (pts.length < 4) return null
  const a = pts[Math.min(2, pts.length - 1)]
  const b = pts[Math.min(8, pts.length - 1)]
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  return { x: a.x, y: a.y, angle }
})
const isLastStroke = computed(() => ai.value >= activeIdx.value.length - 1)

function guideClass(stroke: TraceStroke, index: number) {
  if (stroke.active === false) return 'trace-guide-soft'
  if (props.freeMode) return 'trace-guide-soft'
  if (done.value) return 'trace-guide'
  return index === current.value ? 'trace-guide-active' : 'trace-guide'
}

function setPath(el: Element | null, index: number) {
  if (el) paths.value[index] = el as SVGPathElement
}

function coverageOf(index: number) {
  const marks = covered.value[index]
  if (!marks?.length) return 0
  return marks.filter(Boolean).length / marks.length
}

async function measure() {
  await nextTick()
  const next: { x: number; y: number }[][] = []
  props.strokes.forEach((stroke, index) => {
    const el = paths.value[index]
    if (!el) {
      next.push([])
      return
    }
    const len = el.getTotalLength()
    const steps = Math.max(24, Math.min(180, Math.ceil(len / 1.1)))
    const scale = stroke.scale ?? 1
    const pts: { x: number; y: number }[] = []
    for (let k = 0; k <= steps; k++) {
      const p = el.getPointAtLength((len * k) / steps)
      pts.push({ x: p.x * scale + (stroke.tx ?? 0), y: p.y * scale + (stroke.ty ?? 0) })
    }
    next.push(pts)
  })
  samples.value = next
  reset()
}

function reset() {
  ai.value = 0
  lastIdx.value = 0
  drawing.value = false
  done.value = false
  hintPulse.value = false
  pct.value = 0
  ink.value = []
  covered.value = samples.value.map((pts) => pts.map(() => false))
}

function toBoard(e: PointerEvent) {
  const rect = svg.value!.getBoundingClientRect()
  return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }
}

function touchProgress() {
  const active = activeIdx.value
  let total = 0
  let filled = 0
  active.forEach((i) => {
    total += covered.value[i]?.length ?? 0
    filled += covered.value[i]?.filter(Boolean).length ?? 0
  })
  pct.value = total ? filled / total : 0
  emit('progress', pct.value)
}

function onDown(e: PointerEvent) {
  if (done.value) return
  e.preventDefault()
  const index = current.value
  const pts = samples.value[index]
  if (!pts?.length) return
  const p = toBoard(e)
  const first = pts[0]
  const nearStart = Math.hypot(p.x - first.x, p.y - first.y) <= props.tolerance * 2.4
  const resuming = lastIdx.value > 0
  if (!nearStart && !resuming) {
    hintPulse.value = true
    window.setTimeout(() => (hintPulse.value = false), 900)
    sfx.wrong()
    return
  }
  drawing.value = true
  ink.value[index] = `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  if (lastIdx.value === 0) covered.value[index][0] = true
  try {
    svg.value?.setPointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
}

function advance() {
  if (done.value) return
  const index = current.value
  const pts = samples.value[index]
  if (!pts?.length) return
  const finished = coverageOf(index) >= props.completeRatio && lastIdx.value >= pts.length * 0.7
  if (!finished) return
  drawing.value = false
  if (isLastStroke.value) {
    done.value = true
    sfx.correct()
    emit('done')
  } else {
    ai.value += 1
    lastIdx.value = 0
    sfx.tap()
    touchProgress()
  }
}

function onMove(e: PointerEvent) {
  if (!drawing.value) return
  e.preventDefault()
  const index = current.value
  const pts = samples.value[index]
  if (!pts?.length) return
  const p = toBoard(e)
  ink.value[index] = `${ink.value[index] ?? ''} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  const tol2 = props.tolerance * props.tolerance
  const from = Math.max(0, lastIdx.value - 2)
  const to = Math.min(pts.length - 1, lastIdx.value + 70)
  let best = lastIdx.value
  let bestD = Infinity
  for (let k = from; k <= to; k++) {
    const dx = p.x - pts[k].x
    const dy = p.y - pts[k].y
    const d = dx * dx + dy * dy
    if (d < bestD) {
      bestD = d
      best = k
    }
  }
  if (bestD <= tol2) {
    for (let k = lastIdx.value; k <= best; k++) covered.value[index][k] = true
    lastIdx.value = Math.max(lastIdx.value, best)
    touchProgress()
    if (coverageOf(index) >= props.completeRatio && lastIdx.value >= pts.length * 0.7) advance()
  }
}

function onUp() {
  if (!drawing.value) return
  drawing.value = false
  advance()
}

onMounted(() => {
  measure()
  if ('ResizeObserver' in window && svg.value) {
    resizeObserver = new ResizeObserver(() => {
      if (!drawing.value) measure()
    })
    resizeObserver.observe(svg.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(
  () => props.strokes,
  () => measure(),
  { deep: true },
)
</script>

<template>
  <div class="trace-wrap">
    <svg
      ref="svg"
      class="trace-svg"
      viewBox="0 0 100 100"
      role="img"
      :aria-label="hint"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <g class="trace-grid">
        <line x1="0" y1="25" x2="100" y2="25" />
        <line x1="0" y1="50" x2="100" y2="50" />
        <line x1="0" y1="75" x2="100" y2="75" />
        <line x1="25" y1="0" x2="25" y2="100" />
        <line x1="50" y1="0" x2="50" y2="100" />
        <line x1="75" y1="0" x2="75" y2="100" />
      </g>

      <g
        v-for="(stroke, i) in strokes"
        :key="`guide-${i}`"
        :transform="`translate(${stroke.tx ?? 0} ${stroke.ty ?? 0}) scale(${stroke.scale ?? 1})`"
      >
        <path
          :ref="(el) => setPath(el as Element | null, i)"
          :d="stroke.d"
          :class="guideClass(stroke, i)"
        />
      </g>

      <path
        v-for="(d, i) in ink"
        :key="`ink-${i}`"
        v-show="d"
        :d="d"
        class="trace-ink"
        :stroke="color"
      />

      <g v-if="showStart && !done && startPt && !freeMode">
        <circle
          :cx="startPt.x"
          :cy="startPt.y"
          r="5"
          :class="pct > 0 ? 'trace-dot' : 'trace-dot trace-dot-pulse'"
          :opacity="hintPulse ? 1 : 0.95"
        />
        <circle v-if="hintPulse" :cx="startPt.x" :cy="startPt.y" r="10" class="trace-dot-pulse" />
        <polygon
          v-if="arrow && ai === 0"
          class="trace-arrow"
          :points="`${arrow.x},${arrow.y - 2} ${arrow.x + 8},${arrow.y + 4} ${arrow.x + 1},${arrow.y + 8}`"
          :transform="`rotate(${arrow.angle} ${arrow.x} ${arrow.y})`"
        />
      </g>
    </svg>

    <button type="button" class="trace-clear" aria-label="Borrar el trazo" @pointerdown.prevent="reset">
      ↺
    </button>
    <span v-if="!done" class="trace-hint">{{ hint }}</span>
  </div>
</template>
