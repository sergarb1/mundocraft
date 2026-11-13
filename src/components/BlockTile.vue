<script setup lang="ts">
import { computed } from 'vue'
import { isSelected, startDrag, type Ghost } from '../lib/drag'

const props = withDefaults(
  defineProps<{
    label?: string
    emoji?: string
    tone?: string
    state?: 'idle' | 'ok' | 'bad' | 'dim'
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'word'
    draggable?: boolean
    ghostId?: string
    disabled?: boolean
    labelClass?: string
  }>(),
  {
    tone: 'gold',
    state: 'idle',
    size: 'md',
    draggable: false,
    disabled: false,
    labelClass: '',
  },
)

const emit = defineEmits<{ pick: []; drop: [string | null] }>()

const gid = computed(() => props.ghostId ?? String(props.label ?? props.emoji ?? 'tile'))
const selected = computed(() => isSelected(gid.value))

function onDown(e: PointerEvent) {
  if (props.disabled) return
  e.preventDefault()
  if (props.draggable) {
    const ghost: Ghost = { id: gid.value, label: props.label, emoji: props.emoji, tone: props.tone }
    startDrag(e, ghost, (zone) => {
      if (zone) {
        emit('drop', zone)
      }
    })
  }
  emit('pick')
}
</script>

<template>
  <button
    type="button"
    class="tile"
    :class="[
      `tile-${size}`,
      `tone-${tone}`,
      state === 'ok' ? 'tile-ok' : '',
      state === 'bad' ? 'tile-bad' : '',
      state === 'dim' ? 'tile-dim' : '',
      selected ? 'tile-selected' : '',
    ]"
    :disabled="disabled"
    :aria-label="label ?? emoji"
    @pointerdown="onDown"
  >
    <span v-if="emoji" class="tile-emoji">{{ emoji }}</span>
    <span v-if="label" class="tile-label" :class="labelClass">{{ label }}</span>
  </button>
</template>
