// 各目标 × 每周频率的分化表。迁移自旧 App.vue。纯数据，不依赖 Vue。
export const PLAN_GOALS = [
  { id: 'beginner' },
  { id: 'hypertrophy' },
  { id: 'fatloss' },
  { id: 'strength' },
]

export const PLAN_FREQUENCIES = [
  { value: 3 },
  { value: 4 },
  { value: 5 },
]

export const PLAN_SPLITS = {
  beginner: {
    3: [
      { groups: ['chest', 'lats', 'thighs-front', 'abs'] },
      { groups: ['glutes', 'thighs-back', 'front-delts', 'biceps'] },
      { groups: ['chest', 'lats', 'triceps', 'calves-front'] },
    ],
    4: [
      { groups: ['chest', 'lats', 'front-delts', 'biceps'] },
      { groups: ['thighs-front', 'glutes', 'thighs-back', 'calves-front'] },
      { groups: ['chest', 'front-delts', 'triceps', 'abs'] },
      { groups: ['lats', 'rear-delts', 'biceps', 'erectors'] },
    ],
    5: [
      { groups: ['chest', 'lats', 'abs'] },
      { groups: ['thighs-front', 'glutes', 'calves-front'] },
      { groups: ['front-delts', 'side-delts', 'biceps', 'triceps'] },
      { groups: ['chest', 'lats', 'thighs-front', 'abs'] },
      { groups: ['glutes', 'rear-delts', 'erectors', 'calves-back'] },
    ],
  },
  hypertrophy: {
    3: [
      { groups: ['chest', 'front-delts', 'side-delts', 'triceps'] },
      { groups: ['lats', 'rear-delts', 'traps', 'biceps'] },
      { groups: ['thighs-front', 'thighs-back', 'glutes', 'abs'] },
    ],
    4: [
      { groups: ['chest', 'triceps', 'front-delts'] },
      { groups: ['lats', 'biceps', 'rear-delts'] },
      { groups: ['thighs-front', 'thighs-back', 'glutes', 'calves-front'] },
      { groups: ['front-delts', 'side-delts', 'rear-delts', 'abs'] },
    ],
    5: [
      { groups: ['chest', 'front-delts', 'triceps'] },
      { groups: ['lats', 'rear-delts', 'biceps'] },
      { groups: ['thighs-front', 'glutes', 'thighs-back'] },
      { groups: ['front-delts', 'side-delts', 'biceps', 'triceps'] },
      { groups: ['abs', 'calves-front', 'traps', 'erectors'] },
    ],
  },
  fatloss: {
    3: [
      { groups: ['chest', 'lats', 'thighs-front', 'abs'] },
      { groups: ['glutes', 'thighs-front', 'thighs-back', 'calves-front'] },
      { groups: ['chest', 'lats', 'front-delts', 'triceps', 'biceps'] },
    ],
    4: [
      { groups: ['chest', 'lats', 'thighs-front', 'abs'] },
      { groups: ['glutes', 'thighs-front', 'thighs-back', 'calves-front'] },
      { groups: ['front-delts', 'side-delts', 'lats', 'triceps', 'biceps'] },
      { groups: ['abs', 'erectors', 'calves-back', 'traps'] },
    ],
    5: [
      { groups: ['chest', 'lats', 'thighs-front'] },
      { groups: ['abs', 'calves-front', 'glutes'] },
      { groups: ['front-delts', 'lats', 'thighs-back'] },
      { groups: ['glutes', 'thighs-front', 'calves-back'] },
      { groups: ['chest', 'biceps', 'triceps', 'side-delts'] },
    ],
  },
  strength: {
    3: [
      { groups: ['chest', 'lats', 'front-delts', 'triceps'] },
      { groups: ['thighs-front', 'glutes', 'thighs-back', 'erectors'] },
      { groups: ['chest', 'lats', 'thighs-front', 'abs'] },
    ],
    4: [
      { groups: ['chest', 'front-delts', 'triceps'] },
      { groups: ['thighs-front', 'glutes', 'calves-front'] },
      { groups: ['lats', 'traps', 'rear-delts', 'biceps'] },
      { groups: ['thighs-back', 'glutes', 'erectors', 'abs'] },
    ],
    5: [
      { groups: ['chest', 'front-delts', 'triceps'] },
      { groups: ['thighs-front', 'glutes', 'calves-front'] },
      { groups: ['thighs-back', 'glutes', 'erectors'] },
      { groups: ['lats', 'traps', 'biceps', 'rear-delts'] },
      { groups: ['abs', 'side-delts', 'triceps', 'calves-back'] },
    ],
  },
}
