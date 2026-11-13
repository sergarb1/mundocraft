<script setup lang="ts">
import { openReading } from '../lib/reading'
</script>

<template>
  <button
    type="button"
    class="icon-btn reading-btn"
    aria-label="Cambiar letra y tamaño"
    aria-haspopup="dialog"
    @click="openReading"
  >
    <span aria-hidden="true">Aa</span>
  </button>
</template>
