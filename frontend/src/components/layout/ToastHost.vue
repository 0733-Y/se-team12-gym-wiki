<script setup>
import { watch } from 'vue'
import { useUiStore } from '@/stores/ui.js'

const AUTO_DISMISS_MS = 4000

const ui = useUiStore()
const timers = new Map()

// 新 toast 出现后定时自动关闭
watch(
  () => ui.toasts.map((toast) => toast.id),
  (ids) => {
    for (const id of ids) {
      if (!timers.has(id)) timers.set(id, setTimeout(() => ui.dismissToast(id), AUTO_DISMISS_MS))
    }
    for (const [id, timer] of timers) {
      if (!ids.includes(id)) {
        clearTimeout(timer)
        timers.delete(id)
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="toast-host" aria-live="polite">
    <div v-for="toast in ui.toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`" role="status">
      <span>{{ ui.t(toast.key, toast.params) }}</span>
      <button type="button" class="toast__close" :aria-label="ui.t('close')" @click="ui.dismissToast(toast.id)">
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  right: var(--space-3);
  bottom: var(--space-3);
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: min(360px, calc(100vw - 2 * var(--space-3)));
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-left: 4px solid var(--text-muted);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.toast--success {
  border-left-color: var(--success);
}

.toast--error {
  border-left-color: var(--danger);
}

.toast__close {
  flex: none;
  width: var(--touch);
  height: var(--touch);
  margin-left: auto;
  border: 0;
  background: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
}

/* 小屏上避开底部标签栏 */
@media (max-width: 719px) {
  .toast-host {
    bottom: calc(var(--tabbar-height) + var(--space-3));
    left: var(--space-3);
  }
}
</style>
