// 营养素比例方案（百分比）。迁移自旧 App.vue MACRO_PLANS。计算函数在 P7 加入。
export const MACRO_PLANS = [
  { id: 'balanced', carbs: 40, protein: 30, fat: 30 },
  { id: 'low-fat', carbs: 50, protein: 35, fat: 15 },
  { id: 'low-carb', carbs: 25, protein: 40, fat: 35 },
  { id: 'high-protein', carbs: 35, protein: 40, fat: 25 },
]
