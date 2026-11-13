import { reactive } from 'vue'
import { sfx } from './sfx'

export type Ghost = {
  id: string
  label?: string
  emoji?: string
  tone?: string
}

type DropFn = (zone: string | null) => void

export const dragState = reactive({
  active: false,
  x: 0,
  y: 0,
  ghost: null as Ghost | null,
  /** A tile tapped once, waiting for the child to tap a target. */
  selection: null as Ghost | null,
})

let dropFn: DropFn | null = null
let selectionFn: DropFn | null = null
let moved = false
let startX = 0
let startY = 0
let installed = false
let clearTimer = 0

function install() {
  if (installed) return
  installed = true
  window.addEventListener('pointermove', onMove, { passive: false })
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onCancel)
  // Capture phase: resolving a tap-selection before game handlers run.
  window.addEventListener('pointerdown', onGlobalDown, true)
}

function zoneAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y) as Element | null
  const zone = el?.closest?.('[data-drop]')
  return zone ? zone.getAttribute('data-drop') : null
}

function onMove(e: PointerEvent) {
  if (!dragState.active) return
  dragState.x = e.clientX
  dragState.y = e.clientY
  if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) > 7) moved = true
  if (moved && e.cancelable) e.preventDefault()
}

function onUp(e: PointerEvent) {
  if (!dragState.active) return
  const ghost = dragState.ghost
  const fn = dropFn
  dragState.active = false
  dragState.ghost = null
  dropFn = null
  if (!ghost) return

  if (moved) {
    fn?.(zoneAt(e.clientX, e.clientY))
    return
  }

  // No movement: treat the tap as a selection so the child can tap the target.
  if (dragState.selection?.id === ghost.id) {
    dragState.selection = null
    selectionFn = null
    return
  }
  dragState.selection = ghost
  selectionFn = fn
  sfx.tap()
  window.clearTimeout(clearTimer)
  clearTimer = window.setTimeout(() => {
    dragState.selection = null
    selectionFn = null
  }, 9000)
}

function onCancel() {
  dragState.active = false
  dragState.ghost = null
  dropFn = null
}

function onGlobalDown(e: PointerEvent) {
  if (!selectionFn || dragState.active) return
  const target = (e.target as Element | null)?.closest?.('[data-drop]')
  if (!target) return
  const zone = target.getAttribute('data-drop')
  const fn = selectionFn
  dragState.selection = null
  selectionFn = null
  fn?.(zone)
}

export function startDrag(ev: PointerEvent, ghost: Ghost, onDropFn: DropFn) {
  install()
  startX = ev.clientX
  startY = ev.clientY
  dragState.x = ev.clientX
  dragState.y = ev.clientY
  dragState.ghost = ghost
  dragState.active = true
  moved = false
  dropFn = onDropFn
  if (dragState.selection?.id === ghost.id) {
    dragState.selection = null
    selectionFn = null
  }
}

export function isSelected(id: string) {
  return dragState.selection?.id === id
}

export function clearSelection() {
  dragState.selection = null
  selectionFn = null
}
