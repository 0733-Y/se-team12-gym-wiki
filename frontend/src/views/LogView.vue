<script setup>
// 训练日志（F03）：月历、单日记录、最近 4 周趋势与汇总。数据全部来自服务器。
import { computed, onMounted, ref } from 'vue'
import ApiStatusBanner from '@/components/layout/ApiStatusBanner.vue'
import DayLogPanel from '@/components/log/DayLogPanel.vue'
import MonthCalendar from '@/components/log/MonthCalendar.vue'
import TrendChart from '@/components/log/TrendChart.vue'
import { toApiError } from '@/api/http.js'
import { monthGrid, parseISO, shiftMonth, todayISO } from '@/domain/dates.js'
import { useExercisesStore } from '@/stores/exercises.js'
import { useTrainingLogStore } from '@/stores/trainingLog.js'
import { useUiStore } from '@/stores/ui.js'

const STATS_DAYS = 28

const ui = useUiStore()
const logs = useTrainingLogStore()
const exercises = useExercisesStore()

const today = todayISO()
const todayDate = parseISO(today)
const current = ref({ year: todayDate.getFullYear(), month: todayDate.getMonth() + 1 })
const selectedDate = ref(today)
const statsError = ref(null)

function loadMonth() {
  const grid = monthGrid(current.value.year, current.value.month)
  return logs.loadRange(grid.from, grid.to)
}

async function loadStats() {
  statsError.value = null
  try {
    await logs.loadStats(STATS_DAYS)
  } catch (err) {
    statsError.value = toApiError(err)
  }
}

function load() {
  exercises.ensureLoaded() // 用来按当前语言显示动作名
  loadMonth()
  loadStats()
}
onMounted(load)

function shift(delta) {
  current.value = shiftMonth(current.value, delta)
  loadMonth()
}

const summary = computed(() => logs.stats?.summary || { workout_days: 0, completed_total: 0, streak: 0 })
const series = computed(() => logs.stats?.series || [])
const loadError = computed(() => logs.error || statsError.value)
</script>

<template>
  <section class="page log">
    <header>
      <h1>{{ ui.t('navLogs') }}</h1>
      <p class="page-hint">{{ ui.t('logHeroSubtitle') }}</p>
    </header>

    <ApiStatusBanner :error="loadError" :busy="logs.status === 'loading'" @retry="load" />

    <div class="log__layout">
      <MonthCalendar
        v-model="selectedDate"
        :year="current.year"
        :month="current.month"
        :logs-by-date="logs.logsByDate"
        :today="today"
        @shift="shift"
      />
      <DayLogPanel :date="selectedDate" :log="logs.logsByDate[selectedDate] || null" />
    </div>

    <section class="log__trend">
      <header>
        <h2>{{ ui.t('lastFourWeeks') }}</h2>
      </header>
      <dl class="log__stats" data-testid="log-stats">
        <div data-stat="workout_days">
          <dt>{{ ui.t('workoutDays') }}</dt>
          <dd>{{ summary.workout_days }}</dd>
        </div>
        <div data-stat="completed_total">
          <dt>{{ ui.t('completedTotal') }}</dt>
          <dd>{{ summary.completed_total }}</dd>
        </div>
        <div data-stat="streak">
          <dt>{{ ui.t('streak') }}</dt>
          <dd>{{ summary.streak }} {{ ui.t('days') }}</dd>
        </div>
      </dl>
      <TrendChart v-if="series.length" :series="series" />
    </section>
  </section>
</template>

<style scoped>
.log header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.log__layout {
  display: grid;
  gap: var(--space-3);
  align-items: start;
}

.log__trend {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.log__trend h2 {
  font-size: 1.125rem;
}

.log__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin: 0;
}

.log__stats dt {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.log__stats dd {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

@media (min-width: 1120px) {
  .log__layout {
    grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
  }
}
</style>
