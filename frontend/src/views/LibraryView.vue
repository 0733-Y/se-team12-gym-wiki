<script setup>
// 动作库（F01）：肌肉图 + 肌群筛选 + 三语搜索。筛选条件放在地址栏，从详情返回时保持不变。
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ApiStatusBanner from '@/components/layout/ApiStatusBanner.vue'
import BodyMap from '@/components/library/BodyMap.vue'
import ExerciseCard from '@/components/library/ExerciseCard.vue'
import MuscleFilterBar from '@/components/library/MuscleFilterBar.vue'
import SearchBox from '@/components/library/SearchBox.vue'
import { MUSCLE_GROUP_IDS } from '@/data/muscleFilters.js'
import { filterByGroup, search } from '@/domain/search.js'
import { exerciseName, muscleLabel } from '@/i18n/exerciseLocale.js'
import { useExercisesStore } from '@/stores/exercises.js'
import { useUiStore } from '@/stores/ui.js'

const ui = useUiStore()
const store = useExercisesStore()
const route = useRoute()
const router = useRouter()

onMounted(() => store.ensureLoaded())

const group = computed({
  get: () => (MUSCLE_GROUP_IDS.includes(route.query.group) ? route.query.group : 'all'),
  set: (value) => updateQuery({ group: value === 'all' ? undefined : value }),
})

const term = computed({
  get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
  set: (value) => updateQuery({ q: value || undefined }),
})

function updateQuery(changes) {
  router.replace({ query: { ...route.query, ...changes } })
}

const searched = computed(() =>
  search(store.items, term.value, ui.lang, { nameOf: exerciseName, groupLabel: muscleLabel }),
)
const visible = computed(() => filterByGroup(searched.value, group.value))

// 每个肌群按钮上的数量：在当前搜索结果里各有多少个
const counts = computed(() => {
  const result = Object.fromEntries(MUSCLE_GROUP_IDS.map((id) => [id, 0]))
  for (const exercise of searched.value) {
    for (const id of exercise.muscle_groups || []) if (id in result) result[id] += 1
  }
  return result
})

const selectedGroups = computed(() => (group.value === 'all' ? [] : [group.value]))
const heading = computed(() => (group.value === 'all' ? ui.t('allExercises') : muscleLabel(group.value, ui.lang)))

function toggleGroup(id) {
  group.value = group.value === id ? 'all' : id
}
</script>

<template>
  <section class="page library">
    <h1>{{ ui.t('navLibrary') }}</h1>

    <div class="library__layout">
      <aside class="library__map" :aria-label="ui.t('muscleMap')">
        <BodyMap :selected="selectedGroups" @select="toggleGroup" />
        <p class="page-hint library__map-hint">{{ ui.t('bodyMapHint') }}</p>
      </aside>

      <div class="library__main">
        <SearchBox v-model="term" />
        <MuscleFilterBar v-model="group" :counts="counts" />

        <ApiStatusBanner :error="store.error" :busy="store.status === 'loading'" @retry="store.load()" />

        <div class="library__summary" aria-live="polite">
          <h2 data-testid="library-heading">{{ heading }}</h2>
          <span v-if="store.status === 'ready'" data-testid="result-count">
            {{ ui.t('exerciseCount', { count: visible.length }) }}
          </span>
        </div>

        <p v-if="store.status === 'loading' && !store.items.length" class="page-hint">{{ ui.t('loading') }}</p>

        <div v-else-if="store.status === 'ready' && !visible.length" class="library__empty" data-testid="empty-state">
          <strong>{{ ui.t('noMatches') }}</strong>
          <span>{{ term ? ui.t('searchHint') : ui.t('emptyFilterHint') }}</span>
        </div>

        <ul v-else class="library__grid">
          <li v-for="exercise in visible" :key="exercise.id">
            <ExerciseCard :exercise="exercise" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.library__layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.library__map {
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.library__map :deep(.body-map) {
  max-width: 360px;
  margin: 0 auto;
}

.library__map-hint {
  margin-top: var(--space-2);
  font-size: 0.8125rem;
  text-align: center;
}

.library__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}

.library__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  color: var(--text-muted);
}

.library__summary h2 {
  color: var(--text);
  font-size: 1.25rem;
}

.library__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.library__empty {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  text-align: center;
}

.library__empty strong {
  color: var(--text);
}

/* 小屏：肌肉图缩小，让搜索框和列表更早出现 */
@media (max-width: 719px) {
  .library__map :deep(.body-map) {
    max-width: 230px;
  }
}

@media (min-width: 720px) {
  .library__grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

/* 1280px：左侧肌肉图，右侧列表 */
@media (min-width: 1120px) {
  .library__layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .library__map {
    position: sticky;
    top: calc(var(--touch) + var(--space-5));
    flex: none;
    width: 340px;
  }

  .library__main {
    flex: 1;
  }
}
</style>
