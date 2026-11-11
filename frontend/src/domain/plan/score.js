// 动作打分（含易错优先）。沿用旧 App.vue exercisePlanScore 的规则。

const COMPOUND_RE = /barbell|bench|squat|deadlift|row|pull.?up|press|lunge/i
const MACHINE_RE = /machine|cable|dumbbell/i

/**
 * @param exercise 动作（name、muscle_groups、equipment、video）
 * @param groupId 当天要练的细分肌群
 * @param wrongRecord 该动作的易错记录，没有则为 null
 */
export function scoreExercise(exercise, groupId, wrongRecord) {
  const text = `${exercise.name} ${exercise.equipment || ''}`
  let score = 0
  if ((exercise.muscle_groups || []).includes(groupId)) score += 10
  if (wrongRecord?.mastery_status === 'unfixed') score += 8
  if (wrongRecord?.mastery_status === 'practicing') score += 5
  if (wrongRecord?.priority_remind && wrongRecord.mastery_status !== 'mastered') score += 2
  if (COMPOUND_RE.test(text)) score += 4
  if (MACHINE_RE.test(text)) score += 2
  if (exercise.video) score += 1
  return score
}

/** 在易错本里且未掌握 → 计划里标为"优先复习"。 */
export function isReviewRecord(wrongRecord) {
  return Boolean(wrongRecord) && wrongRecord.mastery_status !== 'mastered'
}
