<script setup>
// 错误原因分布：6 种原因各有多少条记录。
import { computed } from 'vue'
import { reasonStats } from '@/domain/selfCheck.js'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({ records: { type: Array, required: true } })

const ui = useUiStore()
const stats = computed(() => reasonStats(props.records))
const max = computed(() => Math.max(1, ...stats.value.map((item) => item.count)))
</script>

<template>
  <ul class="reason-chart" data-testid="reason-chart">
    <li v-for="item in stats" :key="item.id" :data-reason="item.id">
      <div class="reason-chart__head">
        <span>{{ ui.t(`wrongReason_${item.id}`) }}</span>
        <strong>{{ item.count }}</strong>
      </div>
      <div class="reason-chart__track" aria-hidden="true">
        <span :style="{ width: `${(item.count / max) * 100}%` }"></span>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.reason-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.reason-chart__head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  font-size: 0.9375rem;
}

.reason-chart__head strong {
  font-variant-numeric: tabular-nums;
}

.reason-chart__track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--surface-2);
}

.reason-chart__track span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--accent);
}
</style>
