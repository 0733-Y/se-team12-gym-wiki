import { describe, it, expect } from 'vitest'
import { BODY_REGIONS, FILTER_BY_ID, MUSCLE_FILTERS, MUSCLE_GROUP_IDS, MUSCLE_ID_TO_FILTER } from './muscleFilters.js'
import { SEARCH_ACTIONS, SEARCH_GROUPS } from './searchSynonyms.js'
import { PLAN_FREQUENCIES, PLAN_GOALS, PLAN_SPLITS } from '@/domain/plan/splits.js'

// 与后端 exercises/constants.py 的 MUSCLE_GROUPS 保持一致（ARCHITECTURE.md 4.2）
const BACKEND_IDS = [
  'chest', 'front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps', 'forearms', 'abs',
  'traps', 'erectors', 'lats', 'glutes', 'thighs-front', 'thighs-back', 'calves-front', 'calves-back',
]

describe('muscleFilters', () => {
  it('16 个 id 与后端清单一致', () => {
    expect([...MUSCLE_GROUP_IDS].sort()).toEqual([...BACKEND_IDS].sort())
    expect(MUSCLE_FILTERS).toHaveLength(16)
  })

  it('每个肌群有颜色，且在肌肉图上至少有一块区域', () => {
    for (const filter of MUSCLE_FILTERS) {
      expect(filter.color, filter.id).toMatch(/^#[0-9a-f]{6}$/)
      expect(BODY_REGIONS.some((r) => r.filterId === filter.id), filter.id).toBe(true)
      expect(FILTER_BY_ID[filter.id]).toBe(filter)
    }
  })

  it('小臂正反两面都映射到 forearms', () => {
    const sides = BODY_REGIONS.filter((r) => r.filterId === 'forearms').map((r) => r.side).sort()
    expect(sides).toEqual(['back', 'front'])
    expect(MUSCLE_ID_TO_FILTER['forearm-left']).toBe('forearms')
    expect(MUSCLE_ID_TO_FILTER['forearm-extensors-left']).toBe('forearms')
  })

  it('每块 SVG 部位只属于一个肌群', () => {
    const all = BODY_REGIONS.flatMap((r) => r.muscles)
    expect(all.length).toBeGreaterThan(40)
    expect(new Set(all).size).toBe(all.length)
  })
})

describe('计划分化表', () => {
  it('4 个目标 × 3 种频率都有，天数等于频率，肌群 id 合法', () => {
    expect(PLAN_GOALS.map((g) => g.id)).toEqual(['beginner', 'hypertrophy', 'fatloss', 'strength'])
    expect(PLAN_FREQUENCIES.map((f) => f.value)).toEqual([3, 4, 5])
    for (const { id } of PLAN_GOALS) {
      for (const { value } of PLAN_FREQUENCIES) {
        const days = PLAN_SPLITS[id][value]
        expect(days, `${id}/${value}`).toHaveLength(value)
        for (const day of days) {
          expect(day.groups.length).toBeGreaterThan(0)
          for (const g of day.groups) expect(BACKEND_IDS, `${id}/${value}`).toContain(g)
        }
      }
    }
  })
})

describe('搜索同义词', () => {
  const norm = (value) => value.toLowerCase().replace(/[\s\-_]+/g, '')

  it('每个动作词都有规范词，并且有中、韩、英三种写法', () => {
    for (const action of SEARCH_ACTIONS) {
      expect(action.keywords.length, action.aliases[0]).toBeGreaterThan(0)
      expect(action.aliases.some((a) => /[一-龥]/.test(a)), `${action.keywords[0]} zh`).toBe(true)
      expect(action.aliases.some((a) => /[가-힣]/.test(a)), `${action.keywords[0]} ko`).toBe(true)
      expect(action.aliases.some((a) => /^[a-z\s-]+$/i.test(a)), `${action.keywords[0]} en`).toBe(true)
    }
  })

  it('肌群词指向合法的肌群 id，并且有三种写法', () => {
    for (const entry of SEARCH_GROUPS) {
      for (const id of entry.groups) expect(BACKEND_IDS).toContain(id)
      expect(entry.terms.some((t) => /[一-龥]/.test(t)), entry.groups.join()).toBe(true)
      expect(entry.terms.some((t) => /[가-힣]/.test(t)), entry.groups.join()).toBe(true)
      expect(entry.terms.some((t) => /^[a-z\s-]+$/i.test(t)), entry.groups.join()).toBe(true)
    }
  })

  it('同一个写法不会同时指向两个规范词', () => {
    const seen = new Map()
    const all = [
      ...SEARCH_ACTIONS.flatMap((a) => a.aliases.map((alias) => [norm(alias), a.keywords[0]])),
      ...SEARCH_GROUPS.flatMap((g) => g.terms.map((term) => [norm(term), g.groups.join()])),
    ]
    for (const [alias, target] of all) {
      if (seen.has(alias)) expect(seen.get(alias), alias).toBe(target)
      seen.set(alias, target)
    }
  })
})
