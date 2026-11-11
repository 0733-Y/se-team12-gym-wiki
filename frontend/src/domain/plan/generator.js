// 一周训练计划生成（F03）。纯函数；返回的数据不含翻译文字，文字在组件里按语言生成。
// 迁移自旧 App.vue 的 generatedPlan / buildPlanExercises / pickExercisesForGroups。
import { isReviewRecord, scoreExercise } from './score.js'
import { PLAN_SPLITS } from './splits.js'
import { STRATEGIES, TRAINING_DAY_INDEXES } from './strategies.js'

const DEFAULT_GOAL = 'hypertrophy'
const DEFAULT_FREQUENCY = 4

// 分数高的在前；同分按 id，保证同样的输入得到同样的计划
function ranked(candidates, groupId, recordOf) {
  return [...candidates].sort(
    (a, b) => scoreExercise(b, groupId, recordOf(b)) - scoreExercise(a, groupId, recordOf(a)) || a.id - b.id,
  )
}

function pickForGroups(groups, limit, exercises, recordOf) {
  const selected = []
  const taken = new Set()
  const take = (exercise) => {
    selected.push(exercise)
    taken.add(exercise.id)
  }

  // 先给每个目标肌群挑一个得分最高的
  for (const groupId of groups) {
    const pool = exercises.filter((e) => !taken.has(e.id) && (e.muscle_groups || []).includes(groupId))
    const best = ranked(pool, groupId, recordOf)[0]
    if (best) take(best)
  }

  // 不够数时，从练到这些肌群的其余动作里补
  if (selected.length < limit) {
    const pool = exercises.filter(
      (e) => !taken.has(e.id) && (e.muscle_groups || []).some((id) => groups.includes(id)),
    )
    ranked(pool, groups[0], recordOf).slice(0, limit - selected.length).forEach(take)
  }
  return selected.slice(0, limit)
}

/**
 * @param goal beginner / hypertrophy / fatloss / strength
 * @param frequency 每周 3 / 4 / 5 天
 * @param exercises 动作列表
 * @param wrongRecords 易错本记录（含 exercise.id、mastery_status、priority_remind）
 * @returns 周一到周日 7 天：{ index, rest, groups, exercises: [{ exercise, focusGroup, sets, reps, rest, isReview }] }
 */
export function generateWeekPlan(goal, frequency, exercises, wrongRecords = []) {
  const splits = PLAN_SPLITS[goal]?.[frequency] || PLAN_SPLITS[DEFAULT_GOAL][DEFAULT_FREQUENCY]
  const strategy = STRATEGIES[goal] || STRATEGIES[DEFAULT_GOAL]
  const trainingIndexes = TRAINING_DAY_INDEXES[frequency] || TRAINING_DAY_INDEXES[DEFAULT_FREQUENCY]

  const recordByExercise = new Map(wrongRecords.map((record) => [record.exercise.id, record]))
  const recordOf = (exercise) => recordByExercise.get(exercise.id) || null

  let cursor = 0
  return Array.from({ length: 7 }, (_, index) => {
    if (!trainingIndexes.includes(index)) return { index, rest: true, groups: [], exercises: [] }

    const { groups } = splits[cursor % splits.length]
    cursor += 1
    const picked = pickForGroups(groups, strategy.perDay, exercises, recordOf).map((exercise) => ({
      exercise,
      focusGroup: exercise.muscle_groups.find((id) => groups.includes(id)) || exercise.muscle_groups[0],
      sets: strategy.sets,
      reps: strategy.reps,
      rest: strategy.rest,
      isReview: isReviewRecord(recordOf(exercise)),
    }))
    // 复习动作排在当天最前面（稳定排序，其余顺序不变）
    picked.sort((a, b) => Number(b.isReview) - Number(a.isReview))
    return { index, rest: false, groups, exercises: picked }
  })
}

export function summarizePlan(plan) {
  const items = plan.flatMap((day) => day.exercises)
  return {
    trainingDays: plan.filter((day) => !day.rest).length,
    total: items.length,
    review: items.filter((item) => item.isReview).length,
  }
}
