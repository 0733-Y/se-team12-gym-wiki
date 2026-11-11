<script setup>
import { useUiStore } from '@/stores/ui.js'

defineProps({ id: { type: String, required: true } })

const ui = useUiStore()
</script>

<template>
  <section class="page">
    <RouterLink class="back-link" to="/library">{{ ui.t('backToLibrary') }}</RouterLink>
    <p class="page-hint">{{ ui.t('pageComingSoon') }}</p>
  </section>
</template>
