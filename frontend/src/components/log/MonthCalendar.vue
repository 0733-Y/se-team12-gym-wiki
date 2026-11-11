<script setup>
// 月历：6 周 42 格，有训练记录的日期显示完成数。
import { computed } from 'vue'
import { monthGrid } from '@/domain/dates.js'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 1–12
  logsByDate: { type: Object, required: true },
  modelValue: { type: String, required: true }, // 选中的日期
  today: { type: String, required: true },
})
defineEmits(['update:modelValue', 'shift'])

const ui = useUiStore()
const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const cells = computed(() => monthGrid(props.year, props.month).cells)
</script>

<template>
  <section class="calendar" data-testid="month-calendar">
    <header class="calendar__head">
      <button type="button" class="btn" :aria-label="ui.t('prevMonth')" data-testid="prev-month" @click="$emit('shift', -1)">
        ‹
      </button>
      <strong data-testid="month-label" aria-live="polite">{{ ui.t('monthLabel', { year, month }) }}</strong>
      <button type="button" class="btn" :aria-label="ui.t('nextMonth')" data-testid="next-month" @click="$emit('shift', 1)">
        ›
      </button>
    </header>

    <div class="calendar__weekdays" aria-hidden="true">
      <span v-for="key in WEEKDAY_KEYS" :key="key">{{ ui.t(key) }}</span>
    </div>

    <div class="calendar__grid">
      <button
        v-for="cell in cells"
        :key="cell.date"
        type="button"
        class="calendar__cell"
        :class="{
          'is-muted': !cell.inMonth,
          'is-active': modelValue === cell.date,
          'is-today': today === cell.date,
          'is-trained': logsByDate[cell.date],
        }"
        :aria-pressed="modelValue === cell.date"
        :aria-label="
          logsByDate[cell.date]
            ? `${cell.date} · ${ui.t('completedCountLabel', { count: logsByDate[cell.date].completed_count })}`
            : cell.date
        "
        :data-date="cell.date"
        data-testid="calendar-day"
        @click="$emit('update:modelValue', cell.date)"
      >
        <span>{{ cell.day }}</span>
        <strong v-if="logsByDate[cell.date]" data-testid="calendar-count">
          {{ logsByDate[cell.date].completed_count }}
        </strong>
      </button>
    </div>
  </section>
</template>

<style scoped>
.calendar {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.calendar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.calendar__head .btn {
  min-width: var(--touch);
  font-size: 1.25rem;
}

.calendar__weekdays,
.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}

.calendar__weekdays span {
  color: var(--text-muted);
  font-size: 0.75rem;
  text-align: center;
}

.calendar__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  min-width: 0;
  min-height: 48px;
  padding: 2px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: none;
  color: var(--text);
  font: inherit;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.calendar__cell strong {
  font-size: 0.75rem;
  line-height: 1;
}

.calendar__cell.is-muted {
  color: var(--text-muted);
  opacity: 0.55;
}

.calendar__cell.is-trained {
  background: var(--success-soft);
  color: var(--success);
}

.calendar__cell.is-today span {
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 700;
}

.calendar__cell.is-active {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

/* 360px 下 7 列要各 ≥ 44px：收窄卡片内边距和格子间距 */
@media (max-width: 719px) {
  .calendar {
    padding: var(--space-3) 3px;
  }

  .calendar__head {
    padding: 0 var(--space-2);
  }

  .calendar__weekdays,
  .calendar__grid {
    gap: 1px;
  }
}

.calendar__cell:hover {
  border-color: var(--border);
}
</style>
