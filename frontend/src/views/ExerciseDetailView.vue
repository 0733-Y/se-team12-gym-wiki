<script setup>
// 动作详情（F01）：图片、三语名称与说明、目标肌群、难度、器械、数据来源（N03）。
// 自检与易错本在 P5 加入。
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mediaUrl } from '@/api/http.js'
import ApiStatusBanner from '@/components/layout/ApiStatusBanner.vue'
import BodyMap from '@/components/library/BodyMap.vue'
import { FILTER_BY_ID } from '@/data/muscleFilters.js'
import { exerciseKeyPoints, exerciseName, exerciseSteps, muscleLabel, termLabel } from '@/i18n/exerciseLocale.js'
import { useExercisesStore } from '@/stores/exercises.js'
import { useUiStore } from '@/stores/ui.js'

const props = defineProps({ id: { type: String, required: true } })

const ui = useUiStore()
const store = useExercisesStore()
const router = useRouter()

onMounted(() => store.ensureLoaded())

const exercise = computed(() => store.byId(props.id))
const name = computed(() => exerciseName(exercise.value, ui.lang))
const localized = computed(() => exerciseSteps(exercise.value, ui.lang))
const originalSteps = computed(() => exerciseSteps(exercise.value, 'en').steps)
const keyPoints = computed(() => exerciseKeyPoints(exercise.value, ui.lang))
const image = computed(() => mediaUrl(exercise.value?.standard_image))

function showGroup(groupId) {
  router.push({ name: 'library', query: { group: groupId } })
}
</script>

<template>
  <section class="page detail">
    <RouterLink class="back-link" to="/library">← {{ ui.t('backToLibrary') }}</RouterLink>

    <ApiStatusBanner :error="store.error" :busy="store.status === 'loading'" @retry="store.load()" />
    <p v-if="store.status === 'loading'" class="page-hint">{{ ui.t('loading') }}</p>
    <p v-else-if="store.status === 'ready' && !exercise" class="page-hint" data-testid="not-found">
      {{ ui.t('exerciseNotFound') }}
    </p>

    <article v-if="exercise" class="detail__layout">
      <div class="detail__main">
        <header class="detail__header">
          <h1 data-testid="exercise-name">{{ name }}</h1>
          <p v-if="ui.lang !== 'en'" class="detail__original" lang="en">{{ exercise.name }}</p>
          <dl class="detail__facts">
            <div>
              <dt>{{ ui.t('difficulty') }}</dt>
              <dd>{{ termLabel(exercise.difficulty, ui.lang) }}</dd>
            </div>
            <div v-if="exercise.equipment">
              <dt>{{ ui.t('equipment') }}</dt>
              <dd>{{ termLabel(exercise.equipment, ui.lang) }}</dd>
            </div>
          </dl>
        </header>

        <div class="detail__image">
          <img v-if="image" :src="image" :alt="name" />
          <span v-else>{{ ui.t('noImage') }}</span>
        </div>

        <section class="detail__section">
          <h2>{{ ui.t('steps') }}</h2>
          <p v-if="localized.generated" class="detail__note">{{ ui.t('generatedStepsNote') }}</p>
          <ol v-if="localized.steps.length" data-testid="exercise-steps">
            <li v-for="(step, index) in localized.steps" :key="index">{{ step }}</li>
          </ol>
          <p v-else class="page-hint">{{ ui.t('noExerciseText') }}</p>
          <details v-if="localized.generated && originalSteps.length" class="detail__original-steps">
            <summary>{{ ui.t('originalText') }}</summary>
            <ol lang="en">
              <li v-for="(step, index) in originalSteps" :key="index">{{ step }}</li>
            </ol>
          </details>
        </section>

        <section v-if="keyPoints.length" class="detail__section">
          <h2>{{ ui.t('keyPoints') }}</h2>
          <ul>
            <li v-for="(point, index) in keyPoints" :key="index">{{ point }}</li>
          </ul>
        </section>

        <p v-if="exercise.source_name" class="detail__source">
          {{ ui.t('dataSource') }}:
          <a v-if="exercise.source_url" :href="exercise.source_url" target="_blank" rel="noopener noreferrer">
            {{ exercise.source_name }}
          </a>
          <span v-else>{{ exercise.source_name }}</span>
          <template v-if="exercise.source_license"> · {{ ui.t('license') }}: {{ exercise.source_license }}</template>
        </p>
      </div>

      <aside class="detail__side">
        <h2>{{ ui.t('targetMuscles') }}</h2>
        <ul class="detail__groups">
          <li v-for="groupId in exercise.muscle_groups" :key="groupId">
            <button
              type="button"
              class="detail__group"
              :style="{ '--group-color': FILTER_BY_ID[groupId]?.color }"
              @click="showGroup(groupId)"
            >
              {{ muscleLabel(groupId, ui.lang) }}
            </button>
          </li>
        </ul>
        <BodyMap :selected="exercise.muscle_groups" @select="showGroup" />
      </aside>
    </article>
  </section>
</template>

<style scoped>
.detail__layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.detail__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
}

.detail__header h1 {
  overflow-wrap: anywhere;
}

.detail__original {
  margin: var(--space-1) 0 0;
  color: var(--text-muted);
}

.detail__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  margin: var(--space-3) 0 0;
}

.detail__facts dt {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.detail__facts dd {
  margin: 0;
  font-weight: 600;
}

.detail__image {
  display: grid;
  place-items: center;
  overflow: hidden;
  max-width: 640px;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-2);
  color: var(--text-muted);
}

.detail__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail__section h2,
.detail__side h2 {
  margin-bottom: var(--space-2);
  font-size: 1.125rem;
}

.detail__section ol,
.detail__section ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 70ch;
  margin: 0;
  padding-left: 1.4em;
}

.detail__note {
  max-width: 70ch;
  margin: 0 0 var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 0.875rem;
}

.detail__original-steps {
  margin-top: var(--space-3);
  color: var(--text-muted);
}

.detail__original-steps summary {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch);
  font-weight: 600;
  cursor: pointer;
}

.detail__source {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.detail__side {
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.detail__side :deep(.body-map) {
  max-width: 360px;
  margin: 0 auto;
}

.detail__groups {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0 0 var(--space-3);
  padding: 0;
  list-style: none;
}

.detail__group {
  min-height: var(--touch);
  padding: 0 var(--space-3);
  border: 1px solid var(--group-color, var(--border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--group-color, var(--accent)) 14%, var(--surface));
  color: var(--text);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

@media (min-width: 1120px) {
  .detail__layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .detail__main {
    flex: 1;
  }

  .detail__side {
    position: sticky;
    top: calc(var(--touch) + var(--space-5));
    flex: none;
    width: 340px;
  }
}
</style>
