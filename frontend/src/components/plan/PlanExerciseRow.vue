<script setup>
// 计划里的一个动作：名称、目标肌群、组数次数休息、"优先复习"标记、完成按钮。
import { computed } from 'vue'
import { mediaUrl } from '@/api/http.js'
import { exerciseName, muscleLabel } from '@/i18n/exerciseLocale.js'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({
  item: { type: Object, required: true }, // generateWeekPlan 返回的一项
  done: { type: Boolean, default: false },
  pending: { type: Boolean, default: false },
})
defineEmits(['toggle'])

const ui = useUiStore()
const name = computed(() => exerciseName(props.item.exercise, ui.lang))
const image = computed(() => mediaUrl(props.item.exercise.standard_image))
const rest = computed(() =>
  ui.t(props.item.rest.unit === 'min' ? 'restMinutes' : 'restSeconds', { range: props.item.rest.range }),
)
</script>

<template>
  <li
    class="plan-row"
    :class="{ 'is-done': done }"
    data-testid="plan-exercise"
    :data-exercise="item.exercise.name"
    :data-done="done"
  >
    <div class="plan-row__media">
      <img v-if="image" :src="image" alt="" loading="lazy" decoding="async" />
    </div>

    <div class="plan-row__body">
      <div class="plan-row__title">
        <RouterLink :to="{ name: 'exercise-detail', params: { id: item.exercise.id } }">{{ name }}</RouterLink>
        <span v-if="item.isReview" class="badge badge--unfixed" data-testid="review-badge">
          {{ ui.t('priorityReview') }}
        </span>
      </div>
      <p class="plan-row__meta">
        <span>{{ muscleLabel(item.focusGroup, ui.lang) }}</span>
        <span>{{ ui.t('setsByReps', { sets: item.sets, reps: ui.t('repsRange', { range: item.reps }) }) }}</span>
        <span>{{ ui.t('rest') }} {{ rest }}</span>
      </p>
    </div>

    <button
      type="button"
      class="btn plan-row__toggle"
      :class="{ 'btn--primary': !done }"
      :disabled="pending"
      :aria-pressed="done"
      data-testid="plan-toggle"
      @click="$emit('toggle')"
    >
      {{ pending ? ui.t('saving') : done ? ui.t('undoDone') : ui.t('markDone') }}
    </button>
  </li>
</template>

<style scoped>
.plan-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: var(--space-2) var(--space-3);
  align-items: center;
  padding: var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.plan-row.is-done {
  border-color: var(--success);
  background: var(--success-soft);
}

.plan-row__media {
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--surface-2);
}

.plan-row__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plan-row__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-2);
}

.plan-row__title a {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  color: var(--text);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.plan-row__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.plan-row__toggle {
  grid-column: 1 / -1;
}

@media (min-width: 720px) {
  .plan-row {
    grid-template-columns: 64px minmax(0, 1fr) auto;
  }

  .plan-row__toggle {
    grid-column: auto;
    min-width: 120px;
  }
}
</style>
