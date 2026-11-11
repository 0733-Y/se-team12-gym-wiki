<script setup>
// 选中那天的训练内容：标题（目标肌群）、进度、动作列表；休息日显示恢复建议。
import { computed } from 'vue'
import PlanExerciseRow from './PlanExerciseRow.vue'
import { muscleLabel } from '@/i18n/exerciseLocale.js'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({
  day: { type: Object, required: true }, // generateWeekPlan 返回的一天
  date: { type: String, required: true },
  goal: { type: String, required: true },
  isDone: { type: Function, required: true }, // (exerciseId) => boolean
  isPending: { type: Function, required: true },
})
defineEmits(['toggle'])

const ui = useUiStore()

const title = computed(() => {
  if (props.day.rest) return ui.t('restActive')
  const labels = props.day.groups.slice(0, 2).map((id) => muscleLabel(id, ui.lang))
  return labels.join(' + ') || ui.t('training')
})
const done = computed(() => props.day.exercises.filter((item) => props.isDone(item.exercise.id)).length)
</script>

<template>
  <section class="day-card" data-testid="plan-day" :data-date="date">
    <header class="day-card__head">
      <div>
        <span class="day-card__date">{{ date }}</span>
        <h2>{{ title }}</h2>
        <p class="page-hint">{{ day.rest ? ui.t('restDayNote') : ui.t(`planNote_${goal}`) }}</p>
      </div>
      <strong v-if="!day.rest && day.exercises.length" class="day-card__progress" data-testid="day-progress">
        {{ ui.t('dayProgress', { done, total: day.exercises.length }) }}
      </strong>
    </header>

    <div v-if="day.rest" class="day-card__rest">
      <strong>{{ ui.t('activeRecoveryTipsTitle') }}</strong>
      <p>{{ ui.t('activeRecoveryTips') }}</p>
    </div>

    <div v-else-if="!day.exercises.length" class="day-card__rest">
      <strong>{{ ui.t('planEmptyTitle') }}</strong>
      <p>{{ ui.t('planEmptyMessage') }}</p>
    </div>

    <ul v-else class="day-card__list">
      <PlanExerciseRow
        v-for="item in day.exercises"
        :key="item.exercise.id"
        :item="item"
        :done="isDone(item.exercise.id)"
        :pending="isPending(item.exercise.id)"
        @toggle="$emit('toggle', item)"
      />
    </ul>
  </section>
</template>

<style scoped>
.day-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.day-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-2);
}

.day-card__head h2 {
  font-size: 1.25rem;
}

.day-card__date {
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}

.day-card__progress {
  font-variant-numeric: tabular-nums;
}

.day-card__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.day-card__rest {
  padding: var(--space-4);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
}

.day-card__rest strong {
  color: var(--text);
}

.day-card__rest p {
  margin: var(--space-1) 0 0;
}
</style>
