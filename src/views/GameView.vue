<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { SectionId } from '../lib/nav'
import { goMap } from '../lib/nav'
import { gameById } from '../games/registry'

const props = defineProps<{ section: SectionId; gameId: string }>()

const def = computed(() => gameById(props.gameId))

onMounted(() => {
  if (!def.value) goMap()
})
</script>

<template>
  <component :is="def.component" v-if="def" />
</template>
