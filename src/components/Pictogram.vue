<script setup lang="ts">
import { computed } from 'vue'
import { FARM_SPRITES, farmArt, type FarmItem } from '../lib/art'

const props = defineProps<{ name: string }>()

const src = computed(() => {
  const sprite = FARM_SPRITES[props.name as FarmItem]
  return sprite ? farmArt(sprite) : ''
})
</script>

<template>
  <img v-if="src" :src="src" class="picto" alt="" draggable="false" />
  <span v-else>{{ name }}</span>
</template>
