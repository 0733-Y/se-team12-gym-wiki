// 自检与易错本的选项常量。迁移自旧 App.vue。
// 6 道自检题 → 建议原因与笔记的函数在 P5 加入。

export const WRONG_REASON_OPTIONS = [
  { id: 'form' },
  { id: 'muscle' },
  { id: 'joint' },
  { id: 'weight' },
  { id: 'path' },
  { id: 'breathing' },
]

export const SELF_CHECK_QUESTIONS = [
  { id: 'form', reason: 'form' },
  { id: 'muscle', reason: 'muscle' },
  { id: 'joint', reason: 'joint' },
  { id: 'weight', reason: 'weight' },
  { id: 'path', reason: 'path' },
  { id: 'breathing', reason: 'breathing' },
]

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
