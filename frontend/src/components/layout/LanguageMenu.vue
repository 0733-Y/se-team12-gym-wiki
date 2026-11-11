<script setup>
import { LANGUAGES } from '@/i18n/index.js'
import { useUiStore } from '@/stores/ui.js'

const ui = useUiStore()
</script>

<template>
  <div class="lang-menu" role="group" :aria-label="ui.t('language')">
    <button
      v-for="language in LANGUAGES"
      :key="language.id"
      type="button"
      class="lang-menu__button"
      :class="{ 'is-active': ui.lang === language.id }"
      :aria-pressed="ui.lang === language.id"
      :title="language.label"
      :data-testid="`lang-${language.id}`"
      @click="ui.setLang(language.id)"
    >
      <img class="lang-menu__flag" :src="language.flagSrc" alt="" />
      <span>{{ language.short }}</span>
    </button>
  </div>
</template>

<style scoped>
.lang-menu {
  display: flex;
  gap: var(--space-1);
}

.lang-menu__button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: var(--touch);
  min-height: var(--touch);
  padding: 0 var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text-muted);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.lang-menu__button.is-active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.lang-menu__flag {
  width: 20px;
  height: auto;
  border-radius: 2px;
}
</style>
