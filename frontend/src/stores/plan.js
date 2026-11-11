// 计划偏好：目标与每周频率。仅偏好，存 localStorage；完成状态以服务器为准，不在这里。
import { defineStore } from 'pinia'
import { PLAN_FREQUENCIES, PLAN_GOALS } from '@/domain/plan/splits.js'

const PLAN_KEY = 'gymwiki.plan'
const GOAL_IDS = PLAN_GOALS.map((goal) => goal.id)
const FREQUENCY_VALUES = PLAN_FREQUENCIES.map((item) => item.value)

function loadPrefs() {
  const prefs = { goal: GOAL_IDS[0], frequency: FREQUENCY_VALUES[0] }
  try {
    const stored = JSON.parse(localStorage.getItem(PLAN_KEY) || '{}')
    if (GOAL_IDS.includes(stored.goal)) prefs.goal = stored.goal
    if (FREQUENCY_VALUES.includes(stored.frequency)) prefs.frequency = stored.frequency
  } catch {
    // 存的内容损坏时用默认值
  }
  return prefs
}

export const usePlanStore = defineStore('plan', {
  state: () => loadPrefs(),
  actions: {
    setGoal(goal) {
      if (!GOAL_IDS.includes(goal)) return
      this.goal = goal
      this.persist()
    },
    setFrequency(frequency) {
      if (!FREQUENCY_VALUES.includes(frequency)) return
      this.frequency = frequency
      this.persist()
    },
    persist() {
      try {
        localStorage.setItem(PLAN_KEY, JSON.stringify({ goal: this.goal, frequency: this.frequency }))
      } catch {
        // 写不进去时只是下次不记得偏好
      }
    },
  },
})
