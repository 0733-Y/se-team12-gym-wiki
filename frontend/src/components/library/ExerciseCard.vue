<script setup>
import { computed } from 'vue'
import { mediaUrl } from '@/api/http.js'
import { FILTER_BY_ID } from '@/data/muscleFilters.js'
import { exerciseName, muscleLabel, termLabel } from '@/i18n/exerciseLocale.js'
import { useUiStore } from '@/stores/ui.js'
import { useWrongBookStore } from '@/stores/wrongBook.js'

const props = defineProps({ exercise: { type: Object, required: true } })

const ui = useUiStore()
const wrongBook = useWrongBookStore()
const record = computed(() => wrongBook.byExerciseId(props.exercise.id))
const name = computed(() => exerciseName(props.exercise, ui.lang))
const primaryGroup = computed(() => props.exercise.muscle_groups?.[0])
const image = computed(() => mediaUrl(props.exercise.standard_image))
</script>

<template>
  <RouterLink
    class="exercise-card"
    :to="{ name: 'exercise-detail', params: { id: exercise.id } }"
    :data-exercise="exercise.name"
    data-testid="exercise-card"
  >
    <div class="exercise-card__media">
      <img v-if="image" :src="image" alt="" loading="lazy" decoding="async" />
      <span v-else class="exercise-card__no-image">{{ ui.t('noImage') }}</span>
    </div>
    <div class="exercise-card__body">
      <h3 class="exercise-card__name">{{ name }}</h3>
      <span v-if="record" class="badge exercise-card__badge" :class="`badge--${record.mastery_status}`" data-testid="card-wrong-badge">
        {{ ui.t('inWrongBook') }} · {{ ui.t(`mastery_${record.mastery_status}`) }}
      </span>
      <p class="exercise-card__meta">
        <span
          v-if="primaryGroup"
          class="exercise-card__group"
          :style="{ '--group-color': FILTER_BY_ID[primaryGroup]?.color }"
        >
          {{ muscleLabel(primaryGroup, ui.lang) }}
        </span>
        <span>{{ termLabel(exercise.difficulty, ui.lang) }}</span>
        <span v-if="exercise.equipment">{{ termLabel(exercise.equipment, ui.lang) }}</span>
      </p>
    </div>
  </RouterLink>
</template>

<style scoped>
.exercise-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
}

.exercise-card:hover {
  border-color: var(--accent);
}

.exercise-card__media {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  background: var(--surface-2);
}

.exercise-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.exercise-card__no-image {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.exercise-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3) var(--space-3);
}

.exercise-card__name {
  font-size: 1rem;
  overflow-wrap: anywhere;
}

.exercise-card__badge {
  align-self: flex-start;
}

.exercise-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 0;
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.exercise-card__group {
  color: var(--text);
  font-weight: 600;
}

.exercise-card__group::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 5px;
  border-radius: 50%;
  background: var(--group-color, var(--accent));
}

/* 小屏：图片在左、文字在右的横向卡片 */
@media (max-width: 719px) {
  .exercise-card {
    flex-direction: row;
    min-height: 88px;
  }

  .exercise-card__media {
    flex: none;
    width: 112px;
    aspect-ratio: auto;
  }

  .exercise-card__body {
    justify-content: center;
    padding: var(--space-2) var(--space-3);
  }
}
</style>
