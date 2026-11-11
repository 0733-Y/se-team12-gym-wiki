// T3：4 目标 × 3 频率都能生成；易错未掌握动作被选入并带 isReview（ARCHITECTURE.md 第8节）。
// 动作清单是从后端数据库导出的真实数据。
import { describe, it, expect } from 'vitest'
import exercises from '../search.exercises.fixture.json'
import { generateWeekPlan, summarizePlan } from './generator.js'
import { scoreExercise } from './score.js'
import { PLAN_FREQUENCIES, PLAN_GOALS, PLAN_SPLITS } from './splits.js'
import { STRATEGIES, TRAINING_DAY_INDEXES, formatRest, parseRest } from './strategies.js'

const GOALS = PLAN_GOALS.map((goal) => goal.id)
const FREQUENCIES = PLAN_FREQUENCIES.map((item) => item.value)
const byName = (name) => exercises.find((exercise) => exercise.name === name)
const record = (exercise, overrides = {}) => ({
  exercise: { id: exercise.id },
  mastery_status: 'unfixed',
  priority_remind: true,
  ...overrides,
})

describe('T3 计划生成：4 目标 × 3 频率', () => {
  for (const goal of GOALS) {
    for (const frequency of FREQUENCIES) {
      it(`${goal} / 每周 ${frequency} 天`, () => {
        const plan = generateWeekPlan(goal, frequency, exercises, [])
        expect(plan).toHaveLength(7)

        const training = plan.filter((day) => !day.rest)
        expect(training).toHaveLength(frequency)
        expect(training.map((day) => day.index)).toEqual(TRAINING_DAY_INDEXES[frequency])
        expect(training.map((day) => day.groups)).toEqual(PLAN_SPLITS[goal][frequency].map((split) => split.groups))

        const strategy = STRATEGIES[goal]
        for (const day of training) {
          expect(day.exercises).toHaveLength(strategy.perDay)
          const ids = day.exercises.map((item) => item.exercise.id)
          expect(new Set(ids).size).toBe(ids.length) // 同一天不重复
          for (const item of day.exercises) {
            expect(item.sets).toBe(strategy.sets)
            expect(item.reps).toBe(strategy.reps)
            expect(item.rest).toEqual(strategy.rest)
            expect(item.isReview).toBe(false)
            expect(day.groups).toContain(item.focusGroup)
            expect(item.exercise.muscle_groups).toContain(item.focusGroup)
          }
        }
        for (const day of plan.filter((d) => d.rest)) expect(day.exercises).toEqual([])
      })
    }
  }

  it('每个目标肌群至少有一个对应动作', () => {
    const plan = generateWeekPlan('hypertrophy', 4, exercises, [])
    for (const day of plan.filter((d) => !d.rest)) {
      for (const group of day.groups) {
        expect(day.exercises.some((item) => item.exercise.muscle_groups.includes(group)), group).toBe(true)
      }
    }
  })

  it('同样的输入得到同样的计划', () => {
    const a = generateWeekPlan('strength', 5, exercises, [])
    const b = generateWeekPlan('strength', 5, [...exercises].reverse(), [])
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('返回的数据里没有翻译文字，只有 id 和数值', () => {
    const plan = generateWeekPlan('beginner', 3, exercises, [])
    const text = JSON.stringify(plan.map((day) => ({ ...day, exercises: day.exercises.map(({ exercise, ...rest }) => rest) })))
    expect(/[一-龥가-힣]/.test(text)).toBe(false)
  })
})

describe('T3 易错动作优先', () => {
  // Cable Wrist Curl 平时排不进计划（小臂不在分化表里），Standing Biceps Cable Curl 平时不是二头肌的首选
  const target = byName('Standing Biceps Cable Curl')

  it('平时不在计划里的动作，记为未掌握后被选入并带 isReview', () => {
    for (const goal of GOALS) {
      for (const frequency of FREQUENCIES) {
        const days = PLAN_SPLITS[goal][frequency]
        if (!days.some((split) => split.groups.includes('biceps'))) continue

        const before = generateWeekPlan(goal, frequency, exercises, [])
        expect(before.flatMap((d) => d.exercises).some((item) => item.exercise.id === target.id)).toBe(false)

        const after = generateWeekPlan(goal, frequency, exercises, [record(target)])
        const picked = after.flatMap((d) => d.exercises).filter((item) => item.exercise.id === target.id)
        expect(picked.length, `${goal}/${frequency}`).toBeGreaterThan(0)
        expect(picked.every((item) => item.isReview)).toBe(true)
        // 出现在所有练二头肌的训练日
        const bicepsDays = after.filter((d) => !d.rest && d.groups.includes('biceps'))
        expect(picked).toHaveLength(bicepsDays.length)
      }
    }
  })

  it('练习中的动作也优先并带 isReview；已掌握的不再优先', () => {
    const practicing = generateWeekPlan('hypertrophy', 4, exercises, [record(target, { mastery_status: 'practicing' })])
    const item = practicing.flatMap((d) => d.exercises).find((entry) => entry.exercise.id === target.id)
    expect(item?.isReview).toBe(true)

    const mastered = generateWeekPlan('hypertrophy', 4, exercises, [record(target, { mastery_status: 'mastered' })])
    expect(mastered.flatMap((d) => d.exercises).some((entry) => entry.exercise.id === target.id)).toBe(false)
  })

  it('复习动作排在当天最前面', () => {
    const plan = generateWeekPlan('hypertrophy', 4, exercises, [record(target)])
    for (const day of plan.filter((d) => d.exercises.some((item) => item.isReview))) {
      expect(day.exercises[0].isReview).toBe(true)
    }
  })

  it('summarizePlan 统计一周动作数和复习数', () => {
    const plan = generateWeekPlan('hypertrophy', 4, exercises, [record(target)])
    const summary = summarizePlan(plan)
    expect(summary.total).toBe(16)
    expect(summary.trainingDays).toBe(4)
    expect(summary.review).toBeGreaterThan(0)
  })
})

describe('打分规则', () => {
  const squat = byName('Barbell Squat')
  const curl = byName('Machine Bicep Curl')

  it('属于目标肌群 +10，复合动作 +4，器械/哑铃 +2', () => {
    expect(scoreExercise(squat, 'thighs-front', null)).toBe(14)
    expect(scoreExercise(squat, 'chest', null)).toBe(4)
    expect(scoreExercise(curl, 'biceps', null)).toBe(12)
  })

  it('易错：未掌握 +8，练习中 +5，开启优先提醒且未掌握再 +2，已掌握不加分', () => {
    const base = scoreExercise(curl, 'biceps', null)
    expect(scoreExercise(curl, 'biceps', { mastery_status: 'unfixed', priority_remind: true })).toBe(base + 10)
    expect(scoreExercise(curl, 'biceps', { mastery_status: 'unfixed', priority_remind: false })).toBe(base + 8)
    expect(scoreExercise(curl, 'biceps', { mastery_status: 'practicing', priority_remind: true })).toBe(base + 7)
    expect(scoreExercise(curl, 'biceps', { mastery_status: 'mastered', priority_remind: true })).toBe(base)
  })

  it('有视频 +1', () => {
    expect(scoreExercise({ ...curl, video: '/media/x.mp4' }, 'biceps', null)).toBe(13)
  })
})

describe('策略与休息时间', () => {
  it('四种目标的参数与设计一致', () => {
    expect(STRATEGIES).toEqual({
      beginner: { sets: 3, reps: '10-12', rest: { unit: 's', range: '60-90' }, perDay: 4 },
      hypertrophy: { sets: 4, reps: '8-12', rest: { unit: 's', range: '60-90' }, perDay: 4 },
      fatloss: { sets: 3, reps: '12-15', rest: { unit: 's', range: '30-60' }, perDay: 5 },
      strength: { sets: 5, reps: '3-6', rest: { unit: 'min', range: '2-3' }, perDay: 4 },
    })
  })

  it('formatRest / parseRest 互为逆操作，存进日志的是不带语言的写法', () => {
    expect(formatRest({ unit: 's', range: '60-90' })).toBe('60-90s')
    expect(formatRest({ unit: 'min', range: '2-3' })).toBe('2-3min')
    expect(parseRest('60-90s')).toEqual({ unit: 's', range: '60-90' })
    expect(parseRest('2-3min')).toEqual({ unit: 'min', range: '2-3' })
    expect(parseRest('')).toBeNull()
    expect(parseRest('whatever')).toBeNull()
  })
})
