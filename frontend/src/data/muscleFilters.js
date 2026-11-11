// 16 个细分肌群：id、颜色、肌肉图 SVG 部位映射。迁移自旧 App.vue MUSCLE_FILTERS。
// id 清单与后端 exercises/constants.py 一致（ARCHITECTURE.md 4.2）。标签在 i18n/muscleLabels.js。
import { MUSCLE_GROUPS } from 'body-muscles'

export const MUSCLE_FILTERS = [
  { id: 'chest', color: '#e11d48' },
  { id: 'front-delts', color: '#f97316' },
  { id: 'side-delts', color: '#f59e0b' },
  { id: 'rear-delts', color: '#c026d3' },
  { id: 'biceps', color: '#2563eb' },
  { id: 'triceps', color: '#4f46e5' },
  { id: 'forearms', color: '#0891b2' },
  { id: 'abs', color: '#7c3aed' },
  { id: 'traps', color: '#0f766e' },
  { id: 'erectors', color: '#475569' },
  { id: 'lats', color: '#0284c7' },
  { id: 'glutes', color: '#db2777' },
  { id: 'thighs-front', color: '#16a34a' },
  { id: 'thighs-back', color: '#15803d' },
  { id: 'calves-front', color: '#65a30d' },
  { id: 'calves-back', color: '#4d7c0f' },
]

export const MUSCLE_GROUP_IDS = MUSCLE_FILTERS.map((filter) => filter.id)

// 肌肉图上的可点击区域。旧代码里小臂正反面是两个筛选项，这里两块区域都指向 forearms。
export const BODY_REGIONS = [
  { side: 'front', filterId: 'chest', muscles: MUSCLE_GROUPS.Chest },
  { side: 'front', filterId: 'front-delts', muscles: ['shoulder-front-left', 'shoulder-front-right'] },
  { side: 'front', filterId: 'side-delts', muscles: ['shoulder-side-left', 'shoulder-side-right'] },
  { side: 'front', filterId: 'biceps', muscles: ['biceps-left', 'biceps-right'] },
  { side: 'front', filterId: 'forearms', muscles: ['forearm-left', 'forearm-right'] },
  { side: 'front', filterId: 'abs', muscles: MUSCLE_GROUPS.Abdominals },
  {
    side: 'front',
    filterId: 'thighs-front',
    muscles: ['quads-left', 'quads-right', 'adductors-left', 'adductors-right', 'hip-flexor-left', 'hip-flexor-right'],
  },
  { side: 'front', filterId: 'calves-front', muscles: ['tibialis-anterior-left', 'tibialis-anterior-right'] },
  {
    side: 'back',
    filterId: 'traps',
    muscles: [
      'traps-upper-left', 'traps-mid-left', 'traps-lower-left',
      'traps-upper-right', 'traps-mid-right', 'traps-lower-right',
    ],
  },
  {
    side: 'back',
    filterId: 'erectors',
    muscles: [
      'lower-back-erectors-left', 'lower-back-ql-left',
      'lower-back-erectors-right', 'lower-back-ql-right', 'spine',
    ],
  },
  {
    side: 'back',
    filterId: 'lats',
    muscles: [
      'lats-upper-left', 'lats-mid-left', 'lats-lower-left',
      'lats-upper-right', 'lats-mid-right', 'lats-lower-right',
    ],
  },
  { side: 'back', filterId: 'rear-delts', muscles: ['deltoid-rear-left', 'deltoid-rear-right'] },
  {
    side: 'back',
    filterId: 'triceps',
    muscles: ['triceps-long-left', 'triceps-lateral-left', 'triceps-long-right', 'triceps-lateral-right'],
  },
  {
    side: 'back',
    filterId: 'forearms',
    muscles: [
      'forearm-flexors-left', 'forearm-extensors-left',
      'forearm-flexors-right', 'forearm-extensors-right',
    ],
  },
  {
    side: 'back',
    filterId: 'glutes',
    muscles: [
      'gluteus-medius-left', 'gluteus-maximus-left',
      'gluteus-medius-right', 'gluteus-maximus-right',
    ],
  },
  {
    side: 'back',
    filterId: 'thighs-back',
    muscles: [
      'hamstrings-medial-left', 'hamstrings-lateral-left',
      'hamstrings-medial-right', 'hamstrings-lateral-right',
    ],
  },
  {
    side: 'back',
    filterId: 'calves-back',
    muscles: [
      'calves-gastroc-medial-left', 'calves-gastroc-lateral-left', 'calves-soleus-left',
      'calves-gastroc-medial-right', 'calves-gastroc-lateral-right', 'calves-soleus-right',
    ],
  },
]

export const FILTER_BY_ID = Object.fromEntries(MUSCLE_FILTERS.map((filter) => [filter.id, filter]))

export const MUSCLE_ID_TO_FILTER = Object.fromEntries(
  BODY_REGIONS.flatMap((region) => region.muscles.map((muscleId) => [muscleId, region.filterId])),
)
