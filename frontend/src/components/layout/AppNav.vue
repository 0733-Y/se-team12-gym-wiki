<script setup>
import { NAV_ITEMS } from '@/router/index.js'
import { useUiStore } from '@/stores/ui.js'

const ui = useUiStore()
</script>

<template>
  <nav class="app-nav" :aria-label="ui.t('navLibrary')">
    <RouterLink v-for="item in NAV_ITEMS" :key="item.name" :to="item.path" class="app-nav__link">
      {{ ui.t(item.labelKey) }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.app-nav {
  display: flex;
  gap: var(--space-1);
}

.app-nav__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--touch);
  padding: 0 var(--space-3);
  border-radius: var(--radius);
  color: var(--text-muted);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.app-nav__link:hover {
  background: var(--surface-2);
  color: var(--text);
}

.app-nav__link.router-link-active {
  background: var(--accent-soft);
  color: var(--accent);
}

/* 360px：导航改为底部标签栏 */
@media (max-width: 719px) {
  .app-nav {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 20;
    gap: 0;
    padding: var(--space-1) var(--space-1) calc(var(--space-1) + env(safe-area-inset-bottom));
    border-top: 1px solid var(--border);
    background: var(--surface);
  }

  .app-nav__link {
    flex: 1 1 0;
    min-width: 0;
    padding: 0 2px;
    font-size: 0.75rem;
    white-space: normal;
    text-align: center;
    line-height: 1.2;
  }
}
</style>
