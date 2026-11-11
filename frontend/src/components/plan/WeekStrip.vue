<script setup>
// 本周 7 天：星期、日期、当天完成进度。点击切换要看的那天。
import { useUiStore } from '@/stores/ui.js'

defineProps({
  days: { type: Array, required: true }, // [{ date, day, rest, done, total }]
  modelValue: { type: String, required: true },
  today: { type: String, required: true },
})
defineEmits(['update:modelValue'])

const ui = useUiStore()
const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
</script>

<template>
  <div class="week-strip" role="group" :aria-label="ui.t('thisWeek')">
    <button
      v-for="(day, index) in days"
      :key="day.date"
      type="button"
      class="week-strip__day"
      :class="{
        'is-active': modelValue === day.date,
        'is-today': today === day.date,
        'is-rest': day.rest,
        'is-complete': !day.rest && day.total > 0 && day.done === day.total,
      }"
      :aria-pressed="modelValue === day.date"
      :data-date="day.date"
      data-testid="week-day"
      @click="$emit('update:modelValue', day.date)"
    >
      <span class="week-strip__weekday">{{ ui.t(WEEKDAY_KEYS[index]) }}</span>
      <strong>{{ day.day }}</strong>
      <span class="week-strip__status">
        <template v-if="day.rest">{{ ui.t('rest') }}</template>
        <template v-else>{{ day.done }}/{{ day.total }}</template>
      </span>
    </button>
  </div>
</template>

<style scoped>
.week-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  /* 360px 下 7 列要各 ≥ 44px，间距只能留 2px */
  gap: 2px;
}

.week-strip__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  min-height: 72px;
  padding: var(--space-2) 2px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.week-strip__weekday,
.week-strip__status {
  color: var(--text-muted);
  font-size: 0.75rem;
  white-space: nowrap;
}

.week-strip__status {
  font-variant-numeric: tabular-nums;
}

.week-strip__day.is-rest {
  background: var(--surface-2);
}

.week-strip__day.is-today strong {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.week-strip__day.is-complete .week-strip__status {
  color: var(--success);
  font-weight: 700;
}

.week-strip__day.is-active {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
  background: var(--accent-soft);
}

@media (min-width: 720px) {
  .week-strip {
    gap: var(--space-2);
  }
}
</style>
