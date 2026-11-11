import { http } from './http.js'

export async function fetchExercises(group) {
  const { data } = await http.get('/api/exercises/', { params: group ? { group } : undefined })
  return data
}

export async function fetchExercise(id) {
  const { data } = await http.get(`/api/exercises/${id}/`)
  return data
}
