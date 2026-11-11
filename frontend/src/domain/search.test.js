// T1：10 个抽检动作 × 韩/中/英三种写法，共 30 个用例（ARCHITECTURE.md 第8节）。
// 动作清单是从后端数据库导出的真实数据（search.exercises.fixture.json）。
import { describe, it, expect } from 'vitest'
import exercises from './search.exercises.fixture.json'
import samples from './search.samples.json'
import { filterByGroup, normalizeTerm, search } from './search.js'

const names = (list) => list.map((exercise) => exercise.name).sort()

describe('T1 三语搜索抽检', () => {
  it('样本为 10 个动作，且都在动作清单里', () => {
    expect(samples).toHaveLength(10)
    for (const sample of samples) {
      expect(exercises.some((e) => e.name === sample.exercise), sample.exercise).toBe(true)
    }
  })

  for (const sample of samples) {
    for (const lang of ['ko', 'zh', 'en']) {
      it(`${sample.exercise} ← ${lang}「${sample[lang]}」`, () => {
        const result = search(exercises, sample[lang], lang)
        expect(names(result)).toContain(sample.exercise)
        // 结果要有筛选意义，不能把整个库都返回
        expect(result.length).toBeLessThan(exercises.length / 2)
      })
    }

    it(`${sample.exercise}：三种语言的同义词得到同一组动作`, () => {
      const [ko, zh, en] = ['ko', 'zh', 'en'].map((lang) => names(search(exercises, sample[lang], lang)))
      expect(zh).toEqual(en)
      expect(ko).toEqual(en)
    })
  }
})

describe('search 规则', () => {
  it('空输入返回全部', () => {
    expect(search(exercises, '', 'zh')).toHaveLength(exercises.length)
    expect(search(exercises, '   ', 'en')).toHaveLength(exercises.length)
  })

  it('大小写、空格、连字符不影响结果', () => {
    const base = names(search(exercises, 'bench press', 'en'))
    expect(names(search(exercises, 'Bench Press', 'en'))).toEqual(base)
    expect(names(search(exercises, ' BENCHPRESS ', 'en'))).toEqual(base)
    expect(names(search(exercises, '벤치 프레스', 'ko'))).toEqual(base)
    expect(names(search(exercises, 'pull-up', 'en'))).toEqual(names(search(exercises, 'pullup', 'en')))
  })

  it('卧推不会把肩推也带出来', () => {
    const result = names(search(exercises, '卧推', 'zh'))
    expect(result).not.toContain('Barbell Shoulder Press')
    expect(result.every((name) => /bench press/i.test(name))).toBe(true)
  })

  it('肌群词按细分肌群筛选，三种语言一致', () => {
    const chest = names(exercises.filter((e) => e.muscle_groups.includes('chest')))
    expect(names(search(exercises, '胸', 'zh'))).toEqual(chest)
    expect(names(search(exercises, '가슴', 'ko'))).toEqual(chest)
    expect(names(search(exercises, 'chest', 'en'))).toEqual(chest)

    const forearms = names(exercises.filter((e) => e.muscle_groups.includes('forearms')))
    expect(names(search(exercises, '小臂', 'zh'))).toEqual(forearms)
    expect(names(search(exercises, '전완근', 'ko'))).toEqual(forearms)
  })

  it('大类词覆盖多个细分肌群', () => {
    const result = search(exercises, '肩', 'zh')
    const groups = new Set(result.flatMap((e) => e.muscle_groups))
    expect(groups.has('front-delts') && groups.has('side-delts') && groups.has('rear-delts')).toBe(true)
    expect(names(search(exercises, '어깨', 'ko'))).toEqual(names(result))
  })

  it('没有同义词时按英文名和当前语言译名做包含匹配', () => {
    expect(names(search(exercises, 'arnold', 'en'))).toEqual(['Arnold Dumbbell Press', 'Kettlebell Arnold Press'])
    const nameOf = (exercise, lang) => (lang === 'zh' && exercise.name === 'Plank' ? '测试用译名' : exercise.name)
    expect(names(search(exercises, '测试用译名', 'zh', { nameOf }))).toEqual(['Plank'])
    // 译名只在当前语言下参与匹配
    expect(search(exercises, '测试用译名', 'ko', { nameOf })).toHaveLength(0)
  })

  it('也能按当前语言的肌群标签匹配', () => {
    const groupLabel = (id, lang) => (lang === 'ko' && id === 'traps' ? '승모근라벨' : id)
    const result = search(exercises, '승모근라벨', 'ko', { groupLabel })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.muscle_groups.includes('traps'))).toBe(true)
  })

  it('找不到时返回空数组', () => {
    expect(search(exercises, 'zzzz-no-such', 'en')).toEqual([])
  })

  it('不修改传入的数组', () => {
    const copy = [...exercises]
    search(exercises, 'squat', 'en')
    expect(exercises).toEqual(copy)
  })
})

describe('normalizeTerm', () => {
  it('小写、去空格和连字符', () => {
    expect(normalizeTerm('  Pull-Up  ')).toBe('pullup')
    expect(normalizeTerm('벤치 프레스')).toBe('벤치프레스')
    expect(normalizeTerm(null)).toBe('')
  })
})

describe('filterByGroup', () => {
  it('按细分肌群筛选；all 或空返回全部', () => {
    expect(filterByGroup(exercises, 'all')).toHaveLength(exercises.length)
    expect(filterByGroup(exercises, '')).toHaveLength(exercises.length)
    const lats = filterByGroup(exercises, 'lats')
    expect(lats.length).toBeGreaterThan(0)
    expect(lats.every((e) => e.muscle_groups.includes('lats'))).toBe(true)
  })
})
