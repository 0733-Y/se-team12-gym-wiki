// 易错本记录。写操作都用服务器返回的记录替换本地记录，失败时抛出 ApiError、本地不变。
import { defineStore } from 'pinia'
import { toApiError } from '@/api/http.js'
import { editWrong, fetchWrongBook, removeWrong, reportWrong, reviewWrong } from '@/api/wrongBook.js'

export const useWrongBookStore = defineStore('wrongBook', {
  state: () => ({
    records: [],
    status: 'idle', // idle | loading | ready | error
    error: null,
  }),
  getters: {
    byExerciseId: (state) => (exerciseId) =>
      state.records.find((record) => record.exercise.id === Number(exerciseId)) || null,
    // 在易错本里且未掌握（计划里优先安排、显示"优先复习"）
    isUnmastered() {
      return (exerciseId) => {
        const record = this.byExerciseId(exerciseId)
        return Boolean(record) && record.mastery_status !== 'mastered'
      }
    },
    // 各掌握状态的数量
    summary: (state) => {
      const counts = { total: state.records.length, unfixed: 0, practicing: 0, mastered: 0 }
      for (const record of state.records) counts[record.mastery_status] += 1
      return counts
    },
  },
  actions: {
    async load() {
      this.status = 'loading'
      this.error = null
      try {
        this.records = await fetchWrongBook()
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
    upsert(record) {
      const index = this.records.findIndex((item) => item.exercise.id === record.exercise.id)
      if (index === -1) this.records.unshift(record)
      else this.records.splice(index, 1, record)
      return record
    },
    async report(exerciseId, body) {
      return this.upsert(await reportWrong(exerciseId, body))
    },
    async review(exerciseId, outcome) {
      return this.upsert(await reviewWrong(exerciseId, outcome))
    },
    async edit(exerciseId, changes) {
      return this.upsert(await editWrong(exerciseId, changes))
    },
    async remove(exerciseId) {
      await removeWrong(exerciseId)
      this.records = this.records.filter((record) => record.exercise.id !== Number(exerciseId))
    },
  },
})
