import { http } from './http.js'

export async function fetchWrongBook() {
  return (await http.get('/api/wrong-book/')).data
}

// body: { error_category, user_note }
export async function reportWrong(exerciseId, body) {
  return (await http.post(`/api/wrong-book/${exerciseId}/report/`, body)).data
}

// outcome: 'fixed' | 'recurred'
export async function reviewWrong(exerciseId, outcome) {
  return (await http.post(`/api/wrong-book/${exerciseId}/review/`, { outcome })).data
}

// changes: { error_category?, user_note?, mastery_status?, priority_remind? }
export async function editWrong(exerciseId, changes) {
  return (await http.patch(`/api/wrong-book/${exerciseId}/`, changes)).data
}

export async function removeWrong(exerciseId) {
  return (await http.delete(`/api/wrong-book/${exerciseId}/`)).data
}
