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
let wasSelected = false
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
  const direct = el?.closest?.('[data-drop]')
  if (direct) return direct.getAttribute('data-drop')

  // "Snap" táctil: si el dedo suelta cerca de una zona, cuenta como acierto.
  let best: Element | null = null
  let bestDistance = 52
  document.querySelectorAll('[data-drop]').forEach((zone) => {
    const rect = zone.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    const dx = Math.max(rect.left - x, 0, x - rect.right)
    const dy = Math.max(rect.top - y, 0, y - rect.bottom)
    const distance = Math.hypot(dx, dy)
    if (distance < bestDistance) {
      bestDistance = distance
      best = zone
    }
  })
  return best ? best.getAttribute('data-drop') : null
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
  const wasAlreadySelected = wasSelected
  wasSelected = false
  dragState.active = false
  dragState.ghost = null
  dropFn = null
  if (!ghost) return

  if (moved) {
    fn?.(zoneAt(e.clientX, e.clientY))
    return
  }

  // Tocar la ficha ya seleccionada la deselecciona.
  if (wasAlreadySelected) {
    dragState.selection = null
    selectionFn = null
    sfx.tap()
    return
  }

  // No movement: treat the tap as a selection so the child can tap the target.
  dragState.selection = ghost
  selectionFn = fn
  sfx.tap()
  window.clearTimeout(clearTimer)
  clearTimer = window.setTimeout(() => {
    dragState.selection = null
    selectionFn = null
  }, 12000)
}

function onCancel() {
  dragState.active = false
  dragState.ghost = null
  dropFn = null
  wasSelected = false
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
  wasSelected = dragState.selection?.id === ghost.id
  if (wasSelected) {
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
