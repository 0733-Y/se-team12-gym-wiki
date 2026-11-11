import { http } from './http.js'

// from / to：YYYY-MM-DD，由前端显式传入
export async function fetchLogRange(from, to) {
  return (await http.get('/api/training-logs/', { params: { from, to } })).data
}

// 没有记录时返回 null
export async function fetchLogDay(date) {
  return (await http.get(`/api/training-logs/${date}/`)).data
}

// 返回 { series, summary }
export async function fetchLogStats(days = 28) {
  const { data, meta } = await http.get('/api/training-logs/stats/', { params: { days } })
  return { series: data, summary: meta }
}

// 幂等。返回当天日志
export async function completeItem(date, exerciseId, meta) {
  return (await http.put(`/api/training-logs/${date}/items/${exerciseId}/`, meta)).data
}

// 返回当天日志；当天没有条目了则为 null
export async function uncompleteItem(date, exerciseId) {
  return (await http.delete(`/api/training-logs/${date}/items/${exerciseId}/`)).data
}
