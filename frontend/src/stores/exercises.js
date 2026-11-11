// 动作列表：加载状态、按 id 查。
import { defineStore } from 'pinia'
import { fetchExercises } from '@/api/exercises.js'
import { toApiError } from '@/api/http.js'

export const useExercisesStore = defineStore('exercises', {
  state: () => ({
    items: [],
    status: 'idle', // idle | loading | ready | error
    error: null, // ApiError
  }),
  getters: {
    byId: (state) => (id) => state.items.find((item) => item.id === Number(id)) || null,
  },
  actions: {
    async load() {
      if (this.status === 'loading') return
      this.status = 'loading'
      this.error = null
      try {
        this.items = await fetchExercises()
        this.status = 'ready'
      } catch (err) {
        this.error = toApiError(err)
        this.status = 'error'
      }
    },
    // 已加载过就不重复请求
    async ensureLoaded() {
      if (this.status === 'idle' || this.status === 'error') await this.load()
    },
  },
})
