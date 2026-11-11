<script setup>
import { useUiStore } from '@/stores/ui.js'

defineProps({ modelValue: { type: String, default: '' } })
defineEmits(['update:modelValue'])

const ui = useUiStore()
</script>

<template>
  <div class="search-box">
    <label class="search-box__label" for="exercise-search">{{ ui.t('search') }}</label>
    <div class="search-box__field">
      <input
        id="exercise-search"
        class="search-box__input"
        type="search"
        autocomplete="off"
        enterkeyhint="search"
        :placeholder="ui.t('searchPlaceholder')"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="modelValue"
        type="button"
        class="search-box__clear"
        :aria-label="ui.t('clearSearch')"
        @click="$emit('update:modelValue', '')"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-box {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.search-box__label {
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
}

.search-box__field {
  position: relative;
}

.search-box__input {
  width: 100%;
  min-height: var(--touch);
  padding: 0 var(--touch) 0 var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font: inherit;
}

/* 用自己的清除按钮，隐藏浏览器自带的 */
.search-box__input::-webkit-search-cancel-button {
  display: none;
}

.search-box__clear {
  position: absolute;
  top: 0;
  right: 0;
  width: var(--touch);
  height: var(--touch);
  border: 0;
  background: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
}
</style>
