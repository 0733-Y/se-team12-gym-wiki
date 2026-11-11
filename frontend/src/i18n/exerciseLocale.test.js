import { describe, it, expect } from 'vitest'
import exercises from '@/domain/search.exercises.fixture.json'
import { exerciseKeyPoints, exerciseName, exerciseSteps, muscleLabel, termLabel } from './exerciseLocale.js'

const squat = {
  name: 'Barbell Squat',
  muscle_groups: ['thighs-front', 'glutes'],
  equipment: 'barbell',
  description: '1. Step under the bar.\n2. Squat down.',
  key_points: 'Primary muscles: quadriceps\nSecondary muscles: glutes, hamstrings\nMechanic: compound\nKeep the movement controlled and stop if pain appears.',
}

describe('exerciseName', () => {
  it('英文返回原名', () => {
    expect(exerciseName(squat, 'en')).toBe('Barbell Squat')
  })

  it('数据库里的每个动作都有不含英文字母的中文名和韩文名（EZ 除外）', () => {
    for (const lang of ['zh', 'ko']) {
      for (const exercise of exercises) {
        const name = exerciseName(exercise, lang)
        expect(name, `${lang}: ${exercise.name}`).toBeTruthy()
        expect(/[A-Za-z]/.test(name.replace(/EZ/g, '')), `${lang}: ${exercise.name} → ${name}`).toBe(false)
      }
    }
  })

  it('译名在同一语言内不重复', () => {
    for (const lang of ['zh', 'ko']) {
      const seen = new Map()
      for (const exercise of exercises) {
        const name = exerciseName(exercise, lang)
        expect(seen.get(name), `${lang}: 「${name}」 ${seen.get(name)} / ${exercise.name}`).toBeUndefined()
        seen.set(name, exercise.name)
      }
    }
  })

  it('翻译表里没有的动作按器械、肌群、动作类型生成名字', () => {
    const unknown = { name: 'Zottman Machine Curl', muscle_groups: ['biceps'], equipment: 'machine' }
    expect(exerciseName(unknown, 'zh')).toBe('器械肱二头肌弯举')
    expect(exerciseName(unknown, 'ko')).toBe('머신 이두근 컬')
  })
})

describe('exerciseSteps', () => {
  it('英文：去掉序号后的原文', () => {
    expect(exerciseSteps(squat, 'en')).toEqual({ steps: ['Step under the bar.', 'Squat down.'], generated: false })
  })

  it('中文和韩文：有人工翻译时用翻译', () => {
    for (const lang of ['zh', 'ko']) {
      const { steps, generated } = exerciseSteps({ ...squat, name: 'Face Pull' }, lang)
      expect(generated).toBe(false)
      expect(steps.length).toBeGreaterThan(1)
    }
  })

  it('没有翻译时生成通用说明并标记 generated', () => {
    const { steps, generated } = exerciseSteps({ ...squat, name: 'Zottman Machine Curl', muscle_groups: ['biceps'] }, 'ko')
    expect(generated).toBe(true)
    expect(steps).toHaveLength(5)
    expect(steps[0]).toContain('이두근')
  })
})

describe('exerciseKeyPoints', () => {
  it('把结构化要点翻成当前语言', () => {
    const custom = { ...squat, name: 'Zottman Machine Curl' }
    expect(exerciseKeyPoints(custom, 'en')).toHaveLength(4)
    expect(exerciseKeyPoints(custom, 'zh')).toEqual([
      '主要肌群: 股四头肌',
      '辅助肌群: 臀部、腘绳肌',
      '动作类型: 复合动作',
      '保持动作受控；如果出现疼痛，请立即停止。',
    ])
    expect(exerciseKeyPoints(custom, 'ko')[1]).toBe('보조 근육: 둔근, 햄스트링')
  })
})

describe('标签', () => {
  it('muscleLabel / termLabel', () => {
    expect(muscleLabel('lats', 'ko')).toBe('광배근')
    expect(muscleLabel('lats', 'xx')).toBe('背阔肌')
    expect(termLabel('barbell', 'zh')).toBe('杠铃')
    expect(termLabel('intermediate', 'ko')).toBe('중급')
    expect(termLabel('beginner', 'en')).toBe('Beginner')
    expect(termLabel('', 'zh')).toBe('')
    expect(termLabel('something new', 'zh')).toBe('something new')
  })
})
