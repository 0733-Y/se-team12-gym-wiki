// 端到端测试共用：直接调后端接口准备和清理数据
// 测试专用后端（playwright.config.js 启动，数据库是 db.e2e.sqlite3）。这里的清数据只会动测试库。
export const API = 'http://127.0.0.1:8001/api'

export async function exerciseIdByName(request, name) {
  const body = await (await request.get(`${API}/exercises/`)).json()
  const exercise = body.data.find((item) => item.name === name)
  if (!exercise) throw new Error(`Exercise not found: ${name}. Run "python manage.py import_exercises" first.`)
  return exercise.id
}

// 清空 demo 用户的易错本，保证每个用例从同一状态开始
export async function clearWrongBook(request) {
  const body = await (await request.get(`${API}/wrong-book/`)).json()
  for (const record of body.data) await request.delete(`${API}/wrong-book/${record.exercise.id}/`)
}

export async function reportWrong(request, exerciseId, errorCategory = 'form') {
  await request.post(`${API}/wrong-book/${exerciseId}/report/`, {
    data: { error_category: errorCategory, user_note: '' },
  })
}

const pad = (value) => String(value).padStart(2, '0')
export const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// 以今天为中心前后各 45 天，覆盖本周、本月月历和 28 天统计
export function testWindow() {
  const from = new Date()
  from.setDate(from.getDate() - 45)
  const to = new Date()
  to.setDate(to.getDate() + 45)
  return { from: toISO(from), to: toISO(to) }
}

export async function trainingLogs(request, { from, to } = testWindow()) {
  return (await (await request.get(`${API}/training-logs/?from=${from}&to=${to}`)).json()).data
}

// 清空 demo 用户在测试窗口内的训练日志
export async function clearTrainingLogs(request) {
  for (const log of await trainingLogs(request)) {
    for (const item of log.items) await request.delete(`${API}/training-logs/${log.date}/items/${item.exercise_key}/`)
  }
}

export async function wrongRecords(request) {
  return (await (await request.get(`${API}/wrong-book/`)).json()).data
}
