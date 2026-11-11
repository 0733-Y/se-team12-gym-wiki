// 训练日志：完成状态以服务器为准，不存 localStorage。
// 点击完成 → 进入等待状态 → 请求成功后才用返回数据更新；失败则保持原状并抛出 ApiError。
import { markRaw } from 'vue'
import { defineStore } from 'pinia'
import { toApiError } from '@/api/http.js'
import { completeItem, fetchLogDay, fetchLogRange, fetchLogStats, uncompleteItem } from '@/api/trainingLogs.js'

const pendingKey = (date, exerciseId) => `${date}#${exerciseId}`

export const useTrainingLogStore = defineStore('trainingLog', {
  state: () => ({
    logsByDate: {}, // 'YYYY-MM-DD' → 日志
    stats: null, // { series, summary }
    pending: {}, // 'date#exerciseId' → 进行中的请求（防重复提交）
    status: 'idle',
    error: null,
  }),
  getters: {
    isCompleted: (state) => (date, exerciseId) =>
      Boolean(state.logsByDate[date]?.items.some((item) => item.exercise_id === Number(exerciseId))),
    isPending: (state) => (date, exerciseId) => Boolean(state.pending[pendingKey(date, exerciseId)]),
  },
  actions: {
    setDay(date, log) {
      if (log) this.logsByDate[date] = log
      else delete this.logsByDate[date]
    },
    // 月历、本周完成状态都用它
    async loadRange(from, to) {
      this.status = 'loading'
      this.error = null
      try {
        const logs = await fetchLogRange(from, to)
        // 先清掉区间内的旧数据，再放入服务器返回的
        for (const date of Object.keys(this.logsByDate)) {
          if (date >= from && date <= to) delete this.logsByDate[date]
        }
        for (const log of logs) this.logsByDate[log.date] = log
        this.status = 'ready'
      } catch (err) {
        this.error = toApiError(err)
        this.status = 'error'
      }
    },
    async loadDay(date) {
      this.setDay(date, await fetchLogDay(date))
    },
    async loadStats(days = 28) {
      this.stats = await fetchLogStats(days)
    },
    complete(date, exerciseId, meta) {
      return this.write(date, exerciseId, () => completeItem(date, exerciseId, meta))
    },
    uncomplete(date, exerciseId) {
      return this.write(date, exerciseId, () => uncompleteItem(date, exerciseId))
    },
    write(date, exerciseId, request) {
      const key = pendingKey(date, exerciseId)
      if (this.pending[key]) return this.pending[key]
      // markRaw：Promise 不能被响应式代理包裹
      const promise = markRaw(
        request()
          .then((log) => this.setDay(date, log))
          .finally(() => {
            delete this.pending[key]
          }),
      )
      this.pending[key] = promise
      return promise
    },
  },
})
