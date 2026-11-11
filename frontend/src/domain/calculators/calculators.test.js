// T5：计算器基准值、边界值、英制换算、越界输入（ARCHITECTURE.md 6.3 与第8节）。
import { describe, it, expect } from 'vitest'
import { ACTIVITY_LEVELS, CALORIE_GOALS, IN_TO_CM, LB_TO_KG, calcCalories } from './calorie.js'
import { MACRO_PLANS, calcMacros } from './macro.js'
import { ONE_RM_PERCENTAGES, calcOneRm } from './oneRm.js'
import { RANGES, toNumber } from './validate.js'

// 误差 ≤ 1%
const within1Percent = (actual, expected) => expect(Math.abs(actual - expected) / expected).toBeLessThanOrEqual(0.01)

const base = { gender: 'male', units: 'metric', age: 25, height: 175, weight: 70, activity: 'sedentary', goal: 'maintain' }

describe('卡路里（Mifflin-St Jeor）', () => {
  it('基准值：男 25 岁 175 cm 70 kg → BMR 1673.75，取整 1674', () => {
    const result = calcCalories(base)
    expect(result.ok).toBe(true)
    expect(result.bmr).toBeCloseTo(1673.75, 6)
    expect(Math.round(result.bmr)).toBe(1674)
  })

  it('女性比同条件男性低 166', () => {
    const female = calcCalories({ ...base, gender: 'female' })
    expect(female.bmr).toBeCloseTo(1673.75 - 166, 6) // 10w + 6.25h − 5a − 161
  })

  it('TDEE = BMR × 活动系数', () => {
    const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725, athlete: 1.9 }
    expect(Object.fromEntries(ACTIVITY_LEVELS.map((level) => [level.id, level.factor]))).toEqual(factors)
    for (const [activity, factor] of Object.entries(factors)) {
      within1Percent(calcCalories({ ...base, activity }).tdee, 1673.75 * factor)
    }
  })

  it('目标 = TDEE + 调整', () => {
    expect(Object.fromEntries(CALORIE_GOALS.map((goal) => [goal.id, goal.adjustment]))).toEqual({
      fatLoss: -500, maintain: 0, leanGain: 300, fastGain: 500,
    })
    const tdee = 1673.75 * 1.55
    within1Percent(calcCalories({ ...base, activity: 'moderate', goal: 'fatLoss' }).target, tdee - 500)
    within1Percent(calcCalories({ ...base, activity: 'moderate', goal: 'leanGain' }).target, tdee + 300)
    within1Percent(calcCalories({ ...base, activity: 'moderate', goal: 'fastGain' }).target, tdee + 500)
  })

  it('目标热量不低于 1000', () => {
    const small = calcCalories({ ...base, gender: 'female', age: 100, height: 100, weight: 20, goal: 'fatLoss' })
    expect(small.ok).toBe(true)
    expect(small.tdee - 500).toBeLessThan(1000)
    expect(small.target).toBe(1000)
  })

  it('英制换算：1 lb = 0.453592 kg，1 in = 2.54 cm', () => {
    expect(LB_TO_KG).toBe(0.453592)
    expect(IN_TO_CM).toBe(2.54)
    // 154.324 lb ≈ 70 kg，68.898 in ≈ 175 cm
    const imperial = calcCalories({ ...base, units: 'imperial', weight: 154.324, height: 68.898 })
    expect(imperial.ok).toBe(true)
    within1Percent(imperial.bmr, 1673.75)
    // 同样的数字按英制算，结果应该不同
    expect(calcCalories({ ...base, units: 'imperial', weight: 150, height: 69 }).bmr).toBeCloseTo(
      10 * 150 * 0.453592 + 6.25 * 69 * 2.54 - 5 * 25 + 5, 6,
    )
  })

  it('边界值在范围内', () => {
    for (const patch of [{ age: 13 }, { age: 100 }, { height: 100 }, { height: 250 }, { weight: 20 }, { weight: 300 }]) {
      expect(calcCalories({ ...base, ...patch }).ok, JSON.stringify(patch)).toBe(true)
    }
  })

  it('越界输入返回字段错误，不计算', () => {
    const cases = [
      [{ age: 12 }, 'age'], [{ age: 101 }, 'age'], [{ height: 99 }, 'height'], [{ height: 251 }, 'height'],
      [{ weight: 19.9 }, 'weight'], [{ weight: 300.1 }, 'weight'],
    ]
    for (const [patch, field] of cases) {
      const result = calcCalories({ ...base, ...patch })
      expect(result.ok, JSON.stringify(patch)).toBe(false)
      expect(result.bmr).toBeUndefined()
      expect(result.errors[field].code).toBe('range')
    }
    expect(calcCalories({ ...base, age: 12 }).errors.age).toEqual({ code: 'range', min: 13, max: 100 })
  })

  it('英制下按换算后的值判断范围，错误里给出英制的上下限', () => {
    // 700 lb ≈ 317.5 kg，超过 300 kg
    const result = calcCalories({ ...base, units: 'imperial', height: 69, weight: 700 })
    expect(result.ok).toBe(false)
    expect(result.errors.weight.code).toBe('range')
    expect(result.errors.weight.max).toBeCloseTo(300 / 0.453592, 0)
    expect(result.errors.height).toBeUndefined()
    // 69 in ≈ 175 cm 合法；但 175 in 不合法
    expect(calcCalories({ ...base, units: 'imperial', height: 175, weight: 150 }).errors.height.code).toBe('range')
  })

  it('空值、非数字、小数年龄', () => {
    expect(calcCalories({ ...base, age: '' }).errors.age.code).toBe('required')
    expect(calcCalories({ ...base, weight: 'abc' }).errors.weight.code).toBe('required')
    expect(calcCalories({ ...base, height: null }).errors.height.code).toBe('required')
    expect(calcCalories({ ...base, age: 25.5 }).errors.age.code).toBe('integer')
    // 表单里拿到的是字符串
    expect(calcCalories({ ...base, age: '25', height: '175', weight: '70' }).bmr).toBeCloseTo(1673.75, 6)
  })

  it('多个字段同时出错时都报出来', () => {
    const result = calcCalories({ ...base, age: 5, height: 10, weight: 1 })
    expect(Object.keys(result.errors).sort()).toEqual(['age', 'height', 'weight'])
  })
})

describe('营养素', () => {
  it('每餐克数 = 热量 × 比例 ÷ (4 / 4 / 9) ÷ 餐数', () => {
    const result = calcMacros({ calories: 2000, meals: 4, plan: 'balanced' }) // 碳水 40 / 蛋白 30 / 脂肪 30
    expect(result.ok).toBe(true)
    expect(result.perMeal.carbs).toBeCloseTo((2000 * 0.4) / 4 / 4, 6) // 50
    expect(result.perMeal.protein).toBeCloseTo((2000 * 0.3) / 4 / 4, 6) // 37.5
    expect(result.perMeal.fat).toBeCloseTo((2000 * 0.3) / 9 / 4, 6) // 16.67
    expect(result.perDay.carbs).toBeCloseTo(200, 6)
    expect(result.perDay.protein).toBeCloseTo(150, 6)
  })

  it('四种方案的比例各自合计 100%，算出的热量与输入相符', () => {
    expect(MACRO_PLANS.map((plan) => plan.id)).toEqual(['balanced', 'low-fat', 'low-carb', 'high-protein'])
    for (const plan of MACRO_PLANS) {
      expect(plan.carbs + plan.protein + plan.fat).toBe(100)
      const { perDay } = calcMacros({ calories: 2500, meals: 3, plan: plan.id })
      within1Percent(perDay.carbs * 4 + perDay.protein * 4 + perDay.fat * 9, 2500)
    }
  })

  it('边界值：热量 800 / 10000，餐数 1 / 10', () => {
    for (const patch of [{ calories: 800 }, { calories: 10000 }, { meals: 1 }, { meals: 10 }]) {
      expect(calcMacros({ calories: 2000, meals: 3, plan: 'balanced', ...patch }).ok).toBe(true)
    }
    const one = calcMacros({ calories: 2000, meals: 1, plan: 'balanced' })
    expect(one.perMeal).toEqual(one.perDay)
  })

  it('越界输入返回字段错误', () => {
    const input = { calories: 2000, meals: 3, plan: 'balanced' }
    expect(calcMacros({ ...input, calories: 799 }).errors.calories).toEqual({ code: 'range', min: 800, max: 10000 })
    expect(calcMacros({ ...input, calories: 10001 }).errors.calories.code).toBe('range')
    expect(calcMacros({ ...input, meals: 0 }).errors.meals).toEqual({ code: 'range', min: 1, max: 10 })
    expect(calcMacros({ ...input, meals: 11 }).errors.meals.code).toBe('range')
    expect(calcMacros({ ...input, meals: 2.5 }).errors.meals.code).toBe('integer')
    expect(calcMacros({ ...input, calories: '' }).errors.calories.code).toBe('required')
    expect(calcMacros({ ...input, calories: 799 }).perMeal).toBeUndefined()
  })

  it('未知方案按均衡处理', () => {
    expect(calcMacros({ calories: 2000, meals: 4, plan: 'nope' }).perMeal.carbs).toBeCloseTo(50, 6)
  })
})

describe('1RM（Brzycki）', () => {
  it('基准值：100 kg × 5 次 → 112.5', () => {
    const result = calcOneRm({ weight: 100, reps: 5 })
    expect(result.ok).toBe(true)
    expect(result.oneRm).toBeCloseTo(112.5, 6)
  })

  it('次数为 1 时就是该重量', () => {
    expect(calcOneRm({ weight: 142.5, reps: 1 }).oneRm).toBe(142.5)
  })

  it('w × 36 / (37 − reps)', () => {
    within1Percent(calcOneRm({ weight: 80, reps: 10 }).oneRm, (80 * 36) / 27)
    within1Percent(calcOneRm({ weight: 60, reps: 30 }).oneRm, (60 * 36) / 7)
  })

  it('百分比表从 50% 到 95%', () => {
    const { percentages } = calcOneRm({ weight: 100, reps: 5 })
    expect(percentages.map((row) => row.percent)).toEqual(ONE_RM_PERCENTAGES)
    expect(ONE_RM_PERCENTAGES).toEqual([50, 55, 60, 65, 70, 75, 80, 85, 90, 95])
    expect(percentages.find((row) => row.percent === 80).weight).toBeCloseTo(90, 6)
  })

  it('越界输入返回字段错误', () => {
    expect(calcOneRm({ weight: 0, reps: 5 }).errors.weight.code).toBe('positive')
    expect(calcOneRm({ weight: -10, reps: 5 }).errors.weight.code).toBe('positive')
    expect(calcOneRm({ weight: '', reps: 5 }).errors.weight.code).toBe('required')
    expect(calcOneRm({ weight: 100, reps: 0 }).errors.reps).toEqual({ code: 'range', min: 1, max: 30 })
    expect(calcOneRm({ weight: 100, reps: 31 }).errors.reps.code).toBe('range')
    expect(calcOneRm({ weight: 100, reps: 5.5 }).errors.reps.code).toBe('integer')
    expect(calcOneRm({ weight: 100, reps: 31 }).oneRm).toBeUndefined()
  })

  it('磅和公斤只是单位标签，数值不换算', () => {
    expect(calcOneRm({ weight: 225, reps: 5 }).oneRm).toBeCloseTo(253.125, 6)
  })
})

describe('validate 工具', () => {
  it('toNumber：字符串转数字，空值和非数字得到 null', () => {
    expect(toNumber('70.5')).toBe(70.5)
    expect(toNumber(' 70 ')).toBe(70)
    expect(toNumber(0)).toBe(0)
    for (const bad of ['', '  ', null, undefined, 'abc', NaN, Infinity]) expect(toNumber(bad)).toBeNull()
  })

  it('输入范围与设计一致', () => {
    expect(RANGES).toEqual({
      age: { min: 13, max: 100 }, heightCm: { min: 100, max: 250 }, weightKg: { min: 20, max: 300 },
      calories: { min: 800, max: 10000 }, meals: { min: 1, max: 10 }, reps: { min: 1, max: 30 },
    })
  })
})
