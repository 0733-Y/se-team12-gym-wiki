// 自检与易错本（F02）的纯函数与选项常量。常量迁移自旧 App.vue。
// 这里只处理 id 和结构；界面文字由组件按当前语言生成后传进来。

export const WRONG_REASON_OPTIONS = [
  { id: 'form' },
  { id: 'muscle' },
  { id: 'joint' },
  { id: 'weight' },
  { id: 'path' },
  { id: 'breathing' },
]

// 6 道自检题，每道对应一种错误原因
export const SELF_CHECK_QUESTIONS = [
  { id: 'form', reason: 'form' },
  { id: 'muscle', reason: 'muscle' },
  { id: 'joint', reason: 'joint' },
  { id: 'weight', reason: 'weight' },
  { id: 'path', reason: 'path' },
  { id: 'breathing', reason: 'breathing' },
]

export const SELF_CHECK_ANSWERS = ['yes', 'no', 'unsure']

// 三种语言下自动生成的自检笔记的开头，用来识别"这行是系统生成的"
export const SELF_CHECK_NOTE_PREFIXES = [
  '训练后自检：',
  'Post-training self-check:',
  '훈련 후 자가 점검:',
]

export const MASTERY_STATUS_OPTIONS = [
  { id: 'unfixed' },
  { id: 'practicing' },
  { id: 'mastered' },
]

/**
 * 6 道自检题 → 是否有问题、建议的错误原因。
 * 回答"否"或"不确定"算有问题；建议原因取第一道有问题的题对应的原因。
 * @param answers { 题目 id: 'yes' | 'no' | 'unsure' }
 */
export function evaluateSelfCheck(answers = {}) {
  const valid = SELF_CHECK_QUESTIONS.filter((question) => SELF_CHECK_ANSWERS.includes(answers[question.id]))
  const issues = valid.filter((question) => answers[question.id] !== 'yes')
  return {
    answered: valid.length,
    total: SELF_CHECK_QUESTIONS.length,
    completed: valid.length === SELF_CHECK_QUESTIONS.length,
    issueIds: issues.map((question) => question.id),
    hasIssue: issues.length > 0,
    suggestedReason: issues[0]?.reason ?? null,
  }
}

const isGeneratedLine = (line) => SELF_CHECK_NOTE_PREFIXES.some((prefix) => line.trim().startsWith(prefix))

/** 去掉笔记里系统生成的自检行，只留用户手写的内容。 */
export function stripGeneratedNote(note) {
  return String(note ?? '')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !isGeneratedLine(line))
    .join('\n')
    .trim()
}

/** 手写笔记 + 这次的自检行。旧的自检行会被替换，不会越积越多。 */
export function composeNote(existingNote, generatedLine) {
  const manual = stripGeneratedNote(existingNote)
  return manual ? `${manual}\n${generatedLine}` : generatedLine
}

/** 各错误原因的记录数，顺序固定为 6 种原因。 */
export function reasonStats(records) {
  return WRONG_REASON_OPTIONS.map(({ id }) => ({
    id,
    count: records.filter((record) => record.error_category === id).length,
  }))
}

const STATUS_ORDER = { unfixed: 0, practicing: 1, mastered: 2 }

/** 待复盘顺序：未掌握 → 练习中 → 已掌握；同状态下错误次数多的在前。 */
export function sortRecords(records) {
  return [...records].sort((a, b) => {
    const byStatus = (STATUS_ORDER[a.mastery_status] ?? 3) - (STATUS_ORDER[b.mastery_status] ?? 3)
    return byStatus || (b.error_count || 0) - (a.error_count || 0)
  })
}

export function summarize(records) {
  const counts = { total: records.length, unfixed: 0, practicing: 0, mastered: 0 }
  for (const record of records) {
    if (record.mastery_status in counts) counts[record.mastery_status] += 1
  }
  return counts
}
