import { describe, it, expect } from 'vitest'
import {
  SELF_CHECK_QUESTIONS,
  composeNote,
  evaluateSelfCheck,
  reasonStats,
  sortRecords,
  stripGeneratedNote,
  summarize,
} from './selfCheck.js'

const allYes = Object.fromEntries(SELF_CHECK_QUESTIONS.map((q) => [q.id, 'yes']))

describe('evaluateSelfCheck', () => {
  it('没回答时', () => {
    expect(evaluateSelfCheck({})).toEqual({
      answered: 0, total: 6, completed: false, issueIds: [], hasIssue: false, suggestedReason: null,
    })
  })

  it('全部回答"是"：完成且没有问题', () => {
    const result = evaluateSelfCheck(allYes)
    expect(result).toMatchObject({ answered: 6, completed: true, hasIssue: false, suggestedReason: null })
  })

  it('"否"和"不确定"都算有问题，建议原因取第一道有问题的题', () => {
    const result = evaluateSelfCheck({ ...allYes, joint: 'no', path: 'unsure' })
    expect(result.issueIds).toEqual(['joint', 'path'])
    expect(result.hasIssue).toBe(true)
    expect(result.suggestedReason).toBe('joint')
  })

  it('只回答了一部分也能给出建议', () => {
    const result = evaluateSelfCheck({ breathing: 'no' })
    expect(result).toMatchObject({ answered: 1, completed: false, hasIssue: true, suggestedReason: 'breathing' })
  })

  it('忽略无效的答案和题目', () => {
    const result = evaluateSelfCheck({ form: 'maybe', bogus: 'no' })
    expect(result).toMatchObject({ answered: 0, hasIssue: false })
  })

  it('6 道题对应 6 种错误原因', () => {
    expect(SELF_CHECK_QUESTIONS.map((q) => q.reason)).toEqual(['form', 'muscle', 'joint', 'weight', 'path', 'breathing'])
  })
})

describe('自检笔记', () => {
  const zhLine = '训练后自检：关节是否舒服？。系统建议错误原因：关节不舒服。'
  const koLine = '훈련 후 자가 점검: 관절이 편안했나요?. 권장 오류 원인: 관절 불편.'

  it('stripGeneratedNote 去掉三种语言下系统生成的行，保留手写内容', () => {
    expect(stripGeneratedNote(`手肘外翻\n${zhLine}`)).toBe('手肘外翻')
    expect(stripGeneratedNote(`${koLine}\n내 메모`)).toBe('내 메모')
    expect(stripGeneratedNote('Post-training self-check: x. y.')).toBe('')
    expect(stripGeneratedNote(null)).toBe('')
  })

  it('composeNote 把手写笔记和新的自检行合在一起，不重复累加旧的自检行', () => {
    expect(composeNote('', zhLine)).toBe(zhLine)
    expect(composeNote('手肘外翻', zhLine)).toBe(`手肘外翻\n${zhLine}`)
    expect(composeNote(`手肘外翻\n${koLine}`, zhLine)).toBe(`手肘外翻\n${zhLine}`)
  })
})

describe('纠正中心汇总', () => {
  const records = [
    { id: 1, error_category: 'form', mastery_status: 'mastered', error_count: 9 },
    { id: 2, error_category: 'joint', mastery_status: 'unfixed', error_count: 1 },
    { id: 3, error_category: 'form', mastery_status: 'practicing', error_count: 2 },
    { id: 4, error_category: 'path', mastery_status: 'unfixed', error_count: 4 },
  ]

  it('reasonStats 按 6 种原因计数', () => {
    const stats = reasonStats(records)
    expect(stats.map((s) => s.id)).toEqual(['form', 'muscle', 'joint', 'weight', 'path', 'breathing'])
    expect(Object.fromEntries(stats.map((s) => [s.id, s.count]))).toEqual({
      form: 2, muscle: 0, joint: 1, weight: 0, path: 1, breathing: 0,
    })
  })

  it('sortRecords：未掌握 → 练习中 → 已掌握，同状态下错误次数多的在前', () => {
    expect(sortRecords(records).map((r) => r.id)).toEqual([4, 2, 3, 1])
    expect(records.map((r) => r.id)).toEqual([1, 2, 3, 4]) // 不改原数组
  })

  it('summarize 统计各状态数量', () => {
    expect(summarize(records)).toEqual({ total: 4, unfixed: 2, practicing: 1, mastered: 1 })
    expect(summarize([])).toEqual({ total: 0, unfixed: 0, practicing: 0, mastered: 0 })
  })
})
