<script setup>
// 训练计划（F03）：按目标和频率生成本周计划，易错未掌握的动作优先；完成状态以服务器为准。
import { computed, onMounted, ref } from 'vue'
import ApiStatusBanner from '@/components/layout/ApiStatusBanner.vue'
import PlanDayCard from '@/components/plan/PlanDayCard.vue'
import PlanSettings from '@/components/plan/PlanSettings.vue'
import WeekStrip from '@/components/plan/WeekStrip.vue'
import { parseISO, todayISO, weekDates } from '@/domain/dates.js'
import { generateWeekPlan, summarizePlan } from '@/domain/plan/generator.js'
import { formatRest } from '@/domain/plan/strategies.js'
import { useExercisesStore } from '@/stores/exercises.js'
import { usePlanStore } from '@/stores/plan.js'
import { useTrainingLogStore } from '@/stores/trainingLog.js'
import { useUiStore } from '@/stores/ui.js'
import { useWrongBookStore } from '@/stores/wrongBook.js'

const ui = useUiStore()
const exercises = useExercisesStore()
const wrongBook = useWrongBookStore()
const logs = useTrainingLogStore()
const planPrefs = usePlanStore()

const today = todayISO()
const dates = weekDates(today)
const selectedDate = ref(today)

function load() {
  exercises.ensureLoaded()
  // 易错本和本周完成状态每次进入都重新取，保证和服务器一致
  wrongBook.load()
  logs.loadRange(dates[0], dates[6])
}
onMounted(load)

const plan = computed(() =>
  generateWeekPlan(planPrefs.goal, planPrefs.frequency, exercises.items, wrongBook.records),
)
const summary = computed(() => summarizePlan(plan.value))

// 完成 = 该日期的日志里有这个动作的条目
const doneCount = (day, date) => day.exercises.filter((item) => logs.isCompleted(date, item.exercise.id)).length

const stripDays = computed(() =>
  plan.value.map((day, index) => ({
    date: dates[index],
    day: parseISO(dates[index]).getDate(),
    rest: day.rest,
    total: day.exercises.length,
    done: doneCount(day, dates[index]),
  })),
)
const weekDone = computed(() => stripDays.value.reduce((total, day) => total + day.done, 0))

const selectedIndex = computed(() => Math.max(0, dates.indexOf(selectedDate.value)))
const selectedDay = computed(() => plan.value[selectedIndex.value])

const loadError = computed(() => exercises.error || logs.error || wrongBook.error)
const loading = computed(() => [exercises.status, logs.status, wrongBook.status].includes('loading'))

async function toggle(item) {
  const date = selectedDate.value
  const day = selectedDay.value
  const exerciseId = item.exercise.id
  try {
    if (logs.isCompleted(date, exerciseId)) {
      await logs.uncomplete(date, exerciseId)
    } else {
      // 存进日志的都是不带语言的值，日志页按当前语言显示
      await logs.complete(date, exerciseId, {
        title: day.groups.slice(0, 2).join('+'),
        plan_goal: planPrefs.goal,
        plan_frequency: planPrefs.frequency,
        total_count: day.exercises.length,
        exercise_name: item.exercise.name,
        focus_label: item.focusGroup,
        sets: item.sets,
        reps: item.reps,
        rest: formatRest(item.rest),
      })
    }
  } catch (err) {
    // 失败：store 没有改动，按钮回到原状
    ui.toastError(err)
  }
}
</script>

<template>
  <section class="page plan">
    <header>
      <h1>{{ ui.t('navPlans') }}</h1>
      <p class="page-hint">{{ ui.t('reviewInPlanHint') }}</p>
    </header>

    <PlanSettings />

    <ApiStatusBanner :error="loadError" :busy="loading" @retry="load" />

    <dl class="plan__summary">
      <div>
        <dt>{{ ui.t('trainingDays') }}</dt>
        <dd>{{ ui.t('daysPerWeek', { count: summary.trainingDays }) }}</dd>
      </div>
      <div>
        <dt>{{ ui.t('weeklyReviewCount') }}</dt>
        <dd data-testid="week-review-count">{{ summary.review }}</dd>
      </div>
      <div>
        <dt>{{ ui.t('completionProgress') }}</dt>
        <dd data-testid="week-progress">{{ weekDone }} / {{ summary.total }}</dd>
      </div>
    </dl>

    <WeekStrip v-model="selectedDate" :days="stripDays" :today="today" />

    <p v-if="exercises.status === 'loading' && !exercises.items.length" class="page-hint">{{ ui.t('loading') }}</p>
    <PlanDayCard
      v-else
      :day="selectedDay"
      :date="selectedDate"
      :goal="planPrefs.goal"
      :is-done="(exerciseId) => logs.isCompleted(selectedDate, exerciseId)"
      :is-pending="(exerciseId) => logs.isPending(selectedDate, exerciseId)"
      @toggle="toggle"
    />

    <p class="page-hint plan__footnote">{{ ui.t('savedOnServer') }}</p>
  </section>
</template>

<style scoped>
.plan header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.plan__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin: 0;
}

.plan__summary > div {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.plan__summary dt {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.plan__summary dd {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.plan__footnote {
  font-size: 0.8125rem;
}
</style>
