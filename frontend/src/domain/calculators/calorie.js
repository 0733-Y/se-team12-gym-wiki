// 卡路里计算（Mifflin-St Jeor）。迁移自旧 App.vue 的 calorieResult。
// BMR = 10w + 6.25h − 5a + 5（男）/ − 161（女）；TDEE = BMR × 活动系数；目标 = max(1000, TDEE + 调整)
import { RANGES, checkRange, collect } from './validate.js'

export const LB_TO_KG = 0.453592
export const IN_TO_CM = 2.54
export const MIN_TARGET_CALORIES = 1000

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', factor: 1.2 },
  { id: 'light', factor: 1.375 },
  { id: 'moderate', factor: 1.55 },
  { id: 'high', factor: 1.725 },
  { id: 'athlete', factor: 1.9 },
]

export const CALORIE_GOALS = [
  { id: 'fatLoss', adjustment: -500 },
  { id: 'maintain', adjustment: 0 },
  { id: 'leanGain', adjustment: 300 },
  { id: 'fastGain', adjustment: 500 },
]

/**
 * @param input { gender: 'male'|'female', units: 'metric'|'imperial', age, height, weight, activity, goal }
 *   英制时 height 为英寸、weight 为磅，先换算成公制再校验和计算。
 * @returns { ok: true, bmr, tdee, target } 或 { ok: false, errors }（数值未取整，显示时再取整）
 */
export function calcCalories(input) {
  const imperial = input.units === 'imperial'
  const { ok, values, errors } = collect({
    age: checkRange(input.age, RANGES.age, { integer: true }),
    height: checkRange(input.height, RANGES.heightCm, { scale: imperial ? IN_TO_CM : 1 }),
    weight: checkRange(input.weight, RANGES.weightKg, { scale: imperial ? LB_TO_KG : 1 }),
  })
  if (!ok) return { ok: false, errors }

  const factor = (ACTIVITY_LEVELS.find((level) => level.id === input.activity) || ACTIVITY_LEVELS[0]).factor
  const adjustment = (CALORIE_GOALS.find((goal) => goal.id === input.goal) || CALORIE_GOALS[1]).adjustment

  const bmr = 10 * values.weight + 6.25 * values.height - 5 * values.age + (input.gender === 'female' ? -161 : 5)
  const tdee = bmr * factor
  return { ok: true, bmr, tdee, target: Math.max(MIN_TARGET_CALORIES, tdee + adjustment), adjustment }
}
