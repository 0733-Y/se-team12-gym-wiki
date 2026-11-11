<script setup>
// 纠正中心里的一条易错记录：原因、状态、次数、纠正建议、复盘按钮。
import { computed, ref } from 'vue'
import { mediaUrl } from '@/api/http.js'
import { exerciseName } from '@/i18n/exerciseLocale.js'
import { useUiStore } from '@/stores/ui.js'
import { useWrongBookStore } from '@/stores/wrongBook.js'

const props = defineProps({ record: { type: Object, required: true } })

const ui = useUiStore()
const wrongBook = useWrongBookStore()
const busy = ref(false)

const name = computed(() => exerciseName(props.record.exercise, ui.lang))
const image = computed(() => mediaUrl(props.record.exercise.standard_image))

async function review(outcome) {
  if (busy.value) return
  busy.value = true
  try {
    await wrongBook.review(props.record.exercise.id, outcome)
    ui.toast(outcome === 'fixed' ? 'reviewFixedSaved' : 'reviewWrongSaved', 'success')
  } catch (err) {
    ui.toastError(err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <article class="record-card" data-testid="wrong-record-card" :data-exercise="record.exercise.name">
    <div class="record-card__media">
      <img v-if="image" :src="image" alt="" loading="lazy" decoding="async" />
    </div>

    <div class="record-card__body">
      <div class="record-card__badges">
        <span class="badge" :class="`badge--${record.mastery_status}`" data-testid="card-status">
          {{ ui.t(`mastery_${record.mastery_status}`) }}
        </span>
        <span class="badge">{{ ui.t(`wrongReason_${record.error_category}`) }}</span>
      </div>

      <h3>{{ name }}</h3>

      <dl class="record-card__counts">
        <div>
          <dt>{{ ui.t('errorCount') }}</dt>
          <dd data-testid="card-error-count">{{ record.error_count }}</dd>
        </div>
        <div>
          <dt>{{ ui.t('reviewCount') }}</dt>
          <dd>{{ record.review_count }}</dd>
        </div>
        <div>
          <dt>{{ ui.t('successStreak') }}</dt>
          <dd data-testid="card-streak">{{ record.success_streak }}</dd>
        </div>
      </dl>

      <p v-if="record.user_note" class="record-card__note">{{ record.user_note }}</p>

      <p class="record-card__suggestion">
        <strong>{{ ui.t('correctionSuggestion') }}</strong>
        {{ ui.t(`wrongSuggestion_${record.error_category}`) }}
      </p>

      <div class="record-card__actions">
        <button type="button" class="btn" :disabled="busy" data-testid="review-fixed" @click="review('fixed')">
          {{ ui.t('fixedThisTime') }}
        </button>
        <button type="button" class="btn" :disabled="busy" data-testid="review-recurred" @click="review('recurred')">
          {{ ui.t('stillWrong') }}
        </button>
        <RouterLink class="btn btn--ghost" :to="{ name: 'exercise-detail', params: { id: record.exercise.id } }">
          {{ ui.t('viewExercise') }}
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.record-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.record-card__media {
  aspect-ratio: 16 / 9;
  background: var(--surface-2);
}

.record-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-3);
}

.record-card__badges,
.record-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.record-card h3 {
  font-size: 1.0625rem;
  overflow-wrap: anywhere;
}

.record-card__counts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-4);
  margin: 0;
}

.record-card__counts dt {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.record-card__counts dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.record-card__note {
  margin: 0;
  padding-left: var(--space-2);
  border-left: 3px solid var(--border);
  color: var(--text-muted);
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.record-card__suggestion {
  margin: 0;
  font-size: 0.9375rem;
}

.record-card__suggestion strong {
  display: block;
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.record-card__actions {
  margin-top: auto;
  padding-top: var(--space-1);
}

@media (min-width: 720px) {
  .record-card {
    flex-direction: row;
  }

  .record-card__media {
    flex: none;
    width: 220px;
    aspect-ratio: auto;
  }
}
</style>
