<script setup lang="ts">
import { dragState } from '../lib/drag'
</script>

<template>
  <div
    v-if="dragState.active && dragState.ghost"
    class="drag-ghost"
    :style="{ left: `${dragState.x}px`, top: `${dragState.y}px` }"
  >
    <div class="tile tile-xl drag-ghost-tile" :class="`tone-${dragState.ghost.tone ?? 'gold'}`">
      <span v-if="dragState.ghost.emoji" class="tile-emoji">{{ dragState.ghost.emoji }}</span>
      <span v-if="dragState.ghost.label" class="tile-label">{{ dragState.ghost.label }}</span>
    </div>
  </div>
</template>
