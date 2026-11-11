// 端到端测试共用：直接调后端接口准备和清理数据
export const API = 'http://127.0.0.1:8000/api'

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

export async function wrongRecords(request) {
  return (await (await request.get(`${API}/wrong-book/`)).json()).data
}
