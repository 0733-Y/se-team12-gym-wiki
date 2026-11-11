<script setup>
// 16 个细分肌群 + "全部" 的筛选按钮。
import { MUSCLE_FILTERS } from '@/data/muscleFilters.js'
import { muscleLabel } from '@/i18n/exerciseLocale.js'
import { useUiStore } from '@/stores/ui.js'

defineProps({
  modelValue: { type: String, default: 'all' },
  counts: { type: Object, default: () => ({}) }, // 肌群 id → 动作数
})
defineEmits(['update:modelValue'])

const ui = useUiStore()
</script>

<template>
  <div class="filter-bar" role="group" :aria-label="ui.t('muscleFilter')">
    <button
      type="button"
      class="filter-chip"
      :class="{ 'is-active': modelValue === 'all' }"
      :aria-pressed="modelValue === 'all'"
      data-testid="filter-all"
      @click="$emit('update:modelValue', 'all')"
    >
      {{ ui.t('all') }}
    </button>
    <button
      v-for="filter in MUSCLE_FILTERS"
      :key="filter.id"
      type="button"
      class="filter-chip"
      :class="{ 'is-active': modelValue === filter.id }"
      :style="{ '--chip-color': filter.color }"
      :aria-pressed="modelValue === filter.id"
      :data-testid="`filter-${filter.id}`"
      @click="$emit('update:modelValue', modelValue === filter.id ? 'all' : filter.id)"
    >
      <span class="filter-chip__dot" aria-hidden="true"></span>
      {{ muscleLabel(filter.id, ui.lang) }}
      <span v-if="counts[filter.id] !== undefined" class="filter-chip__count">{{ counts[filter.id] }}</span>
    </button>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.filter-chip {
  --chip-color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: var(--touch);
  padding: 0 var(--space-3);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.filter-chip:hover {
  border-color: var(--chip-color);
}

.filter-chip.is-active {
  border-color: var(--chip-color);
  box-shadow: inset 0 0 0 1px var(--chip-color);
  background: color-mix(in srgb, var(--chip-color) 14%, var(--surface));
}

.filter-chip__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--chip-color);
}

.filter-chip__count {
  color: var(--text-muted);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* 小屏：横向滚动一行，不占太多高度 */
@media (max-width: 719px) {
  .filter-bar {
    flex-wrap: nowrap;
    margin: 0 calc(-1 * var(--space-3));
    padding: 2px var(--space-3);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .filter-chip {
    flex: none;
  }
}
</style>
