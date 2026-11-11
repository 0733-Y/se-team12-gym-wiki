<script setup>
// 选中日期的训练记录。日志里存的是不带语言的值（肌群 id、'8-12'、'60-90s'），这里按当前语言显示。
import { computed } from 'vue'
import { mediaUrl } from '@/api/http.js'
import { MUSCLE_GROUP_IDS } from '@/data/muscleFilters.js'
import { parseRest } from '@/domain/plan/strategies.js'
import { exerciseName, muscleLabel } from '@/i18n/exerciseLocale.js'
import { useExercisesStore } from '@/stores/exercises.js'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({
  date: { type: String, required: true },
  log: { type: Object, default: null },
})

const ui = useUiStore()
const exercises = useExercisesStore()

const groupLabel = (value) => (MUSCLE_GROUP_IDS.includes(value) ? muscleLabel(value, ui.lang) : value)

// 标题存的是 'chest+lats' 这样的肌群 id
const title = computed(() => {
  if (!props.log) return ''
  const parts = String(props.log.title || '').split('+').filter(Boolean)
  return parts.map(groupLabel).join(' + ') || ui.t('training')
})

function restText(value) {
  const rest = parseRest(value)
  if (!rest) return value
  return ui.t(rest.unit === 'min' ? 'restMinutes' : 'restSeconds', { range: rest.range })
}

const items = computed(() =>
  (props.log?.items || []).map((item) => {
    // 动作还在库里就用当前语言的名字；被删掉了就用完成时存下的名称快照
    const exercise = exercises.byId(item.exercise_id)
    return {
      id: item.id,
      name: exercise ? exerciseName(exercise, ui.lang) : item.exercise_name,
      exerciseId: exercise?.id ?? null,
      image: mediaUrl(item.image),
      focus: groupLabel(item.focus_label),
      volume: ui.t('setsByReps', { sets: item.sets, reps: ui.t('repsRange', { range: item.reps }) }),
      rest: restText(item.rest),
    }
  }),
)
</script>

<template>
  <section class="day-log" data-testid="day-log" :data-date="date">
    <header class="day-log__head">
      <div>
        <span class="day-log__date">{{ date }}</span>
        <h2>{{ log ? title : ui.t('emptyLogDayTitle') }}</h2>
      </div>
      <strong v-if="log" data-testid="day-log-count">
        {{ log.completed_count }} / {{ Math.max(log.total_count, log.completed_count) }}
      </strong>
    </header>

    <ul v-if="items.length" class="day-log__list">
      <li v-for="item in items" :key="item.id" data-testid="day-log-item">
        <div class="day-log__media">
          <img v-if="item.image" :src="item.image" alt="" loading="lazy" decoding="async" />
        </div>
        <div class="day-log__body">
          <RouterLink v-if="item.exerciseId" :to="{ name: 'exercise-detail', params: { id: item.exerciseId } }">
            {{ item.name }}
          </RouterLink>
          <strong v-else>{{ item.name }}</strong>
          <p>
            <span>{{ item.focus }}</span>
            <span>{{ item.volume }}</span>
            <span v-if="item.rest">{{ ui.t('rest') }} {{ item.rest }}</span>
          </p>
        </div>
      </li>
    </ul>

    <div v-else class="day-log__empty" data-testid="day-log-empty">
      <p>{{ ui.t('emptyLogDayMessage') }}</p>
      <RouterLink class="btn" to="/plans">{{ ui.t('goToPlan') }}</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.day-log {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.day-log__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-2);
}

.day-log__head h2 {
  font-size: 1.125rem;
}

.day-log__date {
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}

.day-log__head strong {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.day-log__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.day-log__list li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.day-log__media {
  flex: none;
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--surface-2);
}

.day-log__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.day-log__body {
  min-width: 0;
}

.day-log__body a {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  color: var(--text);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.day-log__body p {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.day-log__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  color: var(--text-muted);
}

.day-log__empty p {
  margin: 0;
}
</style>
