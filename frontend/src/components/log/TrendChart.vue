<script setup>
// 最近 N 天每天完成的动作数（柱状图）。每 7 天标一个日期，悬停或聚焦可看具体数值。
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({
  series: { type: Array, required: true }, // [{ date, completed_count, total_count }]
})

const ui = useUiStore()
const max = computed(() => Math.max(1, ...props.series.map((point) => point.completed_count)))
const shortDate = (iso) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`
</script>

<template>
  <div class="trend" data-testid="trend-chart">
    <div class="trend__scale" aria-hidden="true">
      <span>{{ max }}</span>
      <span>0</span>
    </div>
    <ol class="trend__bars">
      <li
        v-for="(point, index) in series"
        :key="point.date"
        :title="`${point.date} · ${ui.t('completedCountLabel', { count: point.completed_count })}`"
        :data-date="point.date"
        :data-count="point.completed_count"
      >
        <span class="trend__track">
          <span
            class="trend__bar"
            :class="{ 'is-empty': !point.completed_count }"
            :style="{ height: `${(point.completed_count / max) * 100}%` }"
          ></span>
        </span>
        <span class="trend__label" :class="{ 'is-hidden': index % 7 !== 0 && index !== series.length - 1 }">
          {{ shortDate(point.date) }}
        </span>
        <span class="visually-hidden">
          {{ point.date }} {{ ui.t('completedCountLabel', { count: point.completed_count }) }}
        </span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.trend {
  display: flex;
  gap: var(--space-2);
}

.trend__scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 120px;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.trend__bars {
  display: grid;
  flex: 1;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: 2px;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.trend__bars li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.trend__track {
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 120px;
  border-bottom: 1px solid var(--border);
}

.trend__bar {
  width: 100%;
  min-height: 2px;
  border-radius: 3px 3px 0 0;
  background: var(--accent);
}

.trend__bar.is-empty {
  background: var(--border);
}

.trend__label {
  color: var(--text-muted);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.trend__label.is-hidden {
  visibility: hidden;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
