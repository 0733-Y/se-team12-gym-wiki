// 日期工具。日期一律用本地时间的 'YYYY-MM-DD' 字符串，由前端显式传给服务器。

const pad = (value) => String(value).padStart(2, '0')

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 'YYYY-MM-DD' → 本地零点的 Date；格式或日期不合法时返回 null。 */
export function parseISO(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''))
  if (!match) return null
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export function todayISO() {
  return toISO(new Date())
}

export function addDays(iso, days) {
  const date = parseISO(iso)
  date.setDate(date.getDate() + days)
  return toISO(date)
}

/** 周一 = 0 … 周日 = 6 */
export function weekdayIndex(iso) {
  return (parseISO(iso).getDay() + 6) % 7
}

export function mondayOf(iso) {
  return addDays(iso, -weekdayIndex(iso))
}

/** 所在周的周一到周日。 */
export function weekDates(iso) {
  const monday = mondayOf(iso)
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index))
}

/** 月历：6 周 42 格，从周一开始。month 为 1–12。 */
export function monthGrid(year, month) {
  const first = toISO(new Date(year, month - 1, 1))
  const start = mondayOf(first)
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index)
    const parsed = parseISO(date)
    return { date, day: parsed.getDate(), inMonth: parsed.getMonth() === month - 1 && parsed.getFullYear() === year }
  })
  return { cells, from: cells[0].date, to: cells[41].date }
}

export function shiftMonth({ year, month }, delta) {
  const date = new Date(year, month - 1 + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}
