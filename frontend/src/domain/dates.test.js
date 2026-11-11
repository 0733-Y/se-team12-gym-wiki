import { describe, it, expect } from 'vitest'
import { addDays, monthGrid, mondayOf, parseISO, shiftMonth, toISO, weekDates, weekdayIndex } from './dates.js'

describe('dates', () => {
  it('toISO 用本地日期，不受时区换算影响', () => {
    expect(toISO(new Date(2026, 10, 9, 0, 5))).toBe('2026-11-09')
    expect(toISO(new Date(2026, 0, 1, 23, 59))).toBe('2026-01-01')
  })

  it('parseISO 得到本地零点；非法输入返回 null', () => {
    const date = parseISO('2026-11-09')
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 10, 9, 0])
    expect(parseISO('2026-02-30')).toBeNull()
    expect(parseISO('11/09/2026')).toBeNull()
    expect(parseISO(null)).toBeNull()
  })

  it('weekdayIndex：周一 = 0，周日 = 6', () => {
    expect(weekdayIndex('2026-11-09')).toBe(0)
    expect(weekdayIndex('2026-11-15')).toBe(6)
  })

  it('mondayOf 返回所在周的周一（周日属于前一个周一开始的那周）', () => {
    expect(mondayOf('2026-11-09')).toBe('2026-11-09')
    expect(mondayOf('2026-11-11')).toBe('2026-11-09')
    expect(mondayOf('2026-11-15')).toBe('2026-11-09')
    expect(mondayOf('2026-11-01')).toBe('2026-10-26') // 跨月
    expect(mondayOf('2027-01-01')).toBe('2026-12-28') // 跨年
  })

  it('weekDates 返回周一到周日 7 天', () => {
    expect(weekDates('2026-11-11')).toEqual([
      '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15',
    ])
  })

  it('addDays 跨月、跨年、闰年', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('monthGrid 是 6 周 42 格，从周一开始', () => {
    const grid = monthGrid(2026, 11)
    expect(grid.cells).toHaveLength(42)
    expect(grid.from).toBe('2026-10-26')
    expect(grid.to).toBe('2026-12-06')
    expect(grid.cells[0]).toEqual({ date: '2026-10-26', day: 26, inMonth: false })
    expect(grid.cells.filter((cell) => cell.inMonth)).toHaveLength(30)
    expect(grid.cells.find((cell) => cell.date === '2026-11-01').inMonth).toBe(true)
  })

  it('shiftMonth 前后翻月', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
    expect(shiftMonth({ year: 2026, month: 11 }, -1)).toEqual({ year: 2026, month: 10 })
  })
})
