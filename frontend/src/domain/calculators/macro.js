// 营养素分配。迁移自旧 App.vue 的 MACRO_PLANS / macroResult。
// 每餐克数 = 热量 × 比例 ÷ (碳水 4 / 蛋白质 4 / 脂肪 9 千卡每克) ÷ 餐数
import { RANGES, checkRange, collect } from './validate.js'

// 比例为百分比
export const MACRO_PLANS = [
  { id: 'balanced', carbs: 40, protein: 30, fat: 30 },
  { id: 'low-fat', carbs: 50, protein: 35, fat: 15 },
  { id: 'low-carb', carbs: 25, protein: 40, fat: 35 },
  { id: 'high-protein', carbs: 35, protein: 40, fat: 25 },
]

const KCAL_PER_GRAM = { carbs: 4, protein: 4, fat: 9 }

/**
 * @param input { calories, meals, plan }
 * @returns { ok: true, plan, perDay: {carbs, protein, fat}, perMeal: {...} } 或 { ok: false, errors }（克，未取整）
 */
export function calcMacros(input) {
  const { ok, values, errors } = collect({
    calories: checkRange(input.calories, RANGES.calories),
    meals: checkRange(input.meals, RANGES.meals, { integer: true }),
  })
  if (!ok) return { ok: false, errors }

  const plan = MACRO_PLANS.find((item) => item.id === input.plan) || MACRO_PLANS[0]
  const perDay = {}
  const perMeal = {}
  for (const [nutrient, kcal] of Object.entries(KCAL_PER_GRAM)) {
    perDay[nutrient] = (values.calories * plan[nutrient]) / 100 / kcal
    perMeal[nutrient] = perDay[nutrient] / values.meals
  }
  return { ok: true, plan, perDay, perMeal }
}
