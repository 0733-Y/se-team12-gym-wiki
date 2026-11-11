<script setup>
import { useUiStore } from '@/stores/ui.js'

const ui = useUiStore()
</script>

<template>
  <section class="page">
    <h1>{{ ui.t('navTools') }}</h1>
    <p class="page-hint">{{ ui.t('pageComingSoon') }}</p>
  </section>
</template>
