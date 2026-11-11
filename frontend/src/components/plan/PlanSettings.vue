<script setup>
// 训练目标与每周频率。只是偏好，存 localStorage（stores/plan.js）。
import { PLAN_FREQUENCIES, PLAN_GOALS } from '@/domain/plan/splits.js'
import { usePlanStore } from '@/stores/plan.js'
import { useUiStore } from '@/stores/ui.js'

const ui = useUiStore()
const plan = usePlanStore()
</script>

<template>
  <div class="plan-settings">
    <label class="field">
      <span>{{ ui.t('planGoal') }}</span>
      <select :value="plan.goal" data-testid="plan-goal" @change="plan.setGoal($event.target.value)">
        <option v-for="goal in PLAN_GOALS" :key="goal.id" :value="goal.id">
          {{ ui.t(`planGoal_${goal.id}`) }} · {{ ui.t(`planGoal_${goal.id}_description`) }}
        </option>
      </select>
    </label>
    <label class="field">
      <span>{{ ui.t('weeklyFrequency') }}</span>
      <select
        :value="plan.frequency"
        data-testid="plan-frequency"
        @change="plan.setFrequency(Number($event.target.value))"
      >
        <option v-for="option in PLAN_FREQUENCIES" :key="option.value" :value="option.value">
          {{ ui.t('frequencyOption', { count: option.value }) }}
        </option>
      </select>
    </label>
  </div>
</template>

<style scoped>
.plan-settings {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

@media (min-width: 720px) {
  .plan-settings {
    grid-template-columns: 2fr 1fr;
  }
}
</style>
