<script setup>
// 外壳：导航、语言切换、<RouterView>、Toast
import { watchEffect } from 'vue'
import AppNav from '@/components/layout/AppNav.vue'
import LanguageMenu from '@/components/layout/LanguageMenu.vue'
import ToastHost from '@/components/layout/ToastHost.vue'
import { useUiStore } from '@/stores/ui.js'

const ui = useUiStore()

// 让浏览器和读屏软件知道当前语言
watchEffect(() => {
  document.documentElement.lang = ui.lang
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink class="app-brand" to="/library">GYM WIKI</RouterLink>
      <AppNav />
      <LanguageMenu class="app-header__lang" />
    </header>
    <main class="app-main">
      <RouterView />
    </main>
    <ToastHost />
  </div>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.app-brand {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch);
  color: var(--text);
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-decoration: none;
  white-space: nowrap;
}

.app-header__lang {
  margin-left: auto;
}

.app-main {
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-4) var(--space-3);
}

@media (max-width: 719px) {
  .app-main {
    /* 给底部标签栏留位置 */
    padding-bottom: calc(var(--tabbar-height) + var(--space-4));
  }
}
</style>
