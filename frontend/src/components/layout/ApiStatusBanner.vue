<script setup>
// 读取失败时的提示条：按 ApiError.code 显示三语文字，带重试按钮。
import { useUiStore } from '@/stores/ui.js'

defineProps({
  error: { type: Object, default: null }, // ApiError
  busy: { type: Boolean, default: false },
})
defineEmits(['retry'])

const ui = useUiStore()
</script>

<template>
  <div v-if="error" class="api-banner" role="alert">
    <span>{{ ui.t(error.messageKey || 'backendFailed') }}</span>
    <button type="button" class="api-banner__retry" :disabled="busy" @click="$emit('retry')">
      {{ busy ? ui.t('loading') : ui.t('retry') }}
    </button>
  </div>
</template>

<style scoped>
.api-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  background: var(--danger-soft);
  color: var(--danger-text);
}

.api-banner__retry {
  min-height: var(--touch);
  padding: 0 var(--space-3);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--danger-text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.api-banner__retry:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
