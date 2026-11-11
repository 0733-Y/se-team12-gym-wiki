import { beforeEach, describe, it, expect, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '@/api/http.js'
import ko from '@/i18n/ko.js'

vi.mock('@/api/exercises.js', () => ({ fetchExercises: vi.fn(), fetchExercise: vi.fn() }))
vi.mock('@/api/trainingLogs.js', () => ({
  fetchLogRange: vi.fn(), fetchLogDay: vi.fn(), fetchLogStats: vi.fn(),
  completeItem: vi.fn(), uncompleteItem: vi.fn(),
}))
vi.mock('@/api/wrongBook.js', () => ({
  fetchWrongBook: vi.fn(), reportWrong: vi.fn(), reviewWrong: vi.fn(), editWrong: vi.fn(), removeWrong: vi.fn(),
}))

import * as exercisesApi from '@/api/exercises.js'
import * as logsApi from '@/api/trainingLogs.js'
import * as wrongApi from '@/api/wrongBook.js'
import { useExercisesStore } from './exercises.js'
import { usePlanStore } from './plan.js'
import { useTrainingLogStore } from './trainingLog.js'
import { useUiStore } from './ui.js'
import { useWrongBookStore } from './wrongBook.js'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  setActivePinia(createPinia())
})

describe('ui store', () => {
  it('默认中文；切换语言后写入 localStorage 并能恢复', () => {
    const ui = useUiStore()
    expect(ui.lang).toBe('zh')
    ui.setLang('ko')
    expect(ui.t('navLibrary')).toBe(ko.navLibrary)
    expect(localStorage.getItem('gymwiki.lang')).toBe('ko')

    setActivePinia(createPinia())
    expect(useUiStore().lang).toBe('ko')
  })

  it('忽略不支持的语言', () => {
    const ui = useUiStore()
    ui.setLang('fr')
    expect(ui.lang).toBe('zh')
    localStorage.setItem('gymwiki.lang', 'xx')
    setActivePinia(createPinia())
    expect(useUiStore().lang).toBe('zh')
  })

  it('toast 可添加和关闭', () => {
    const ui = useUiStore()
    const id = ui.toast('errNetwork', 'error')
    expect(ui.toasts).toHaveLength(1)
    expect(ui.toasts[0]).toMatchObject({ key: 'errNetwork', type: 'error' })
    ui.dismissToast(id)
    expect(ui.toasts).toHaveLength(0)
  })
})

describe('plan store', () => {
  it('偏好存 localStorage，非法值被忽略', () => {
    const plan = usePlanStore()
    expect([plan.goal, plan.frequency]).toEqual(['beginner', 3])
    plan.setGoal('strength')
    plan.setFrequency(5)
    plan.setGoal('nope')
    plan.setFrequency(9)
    expect(JSON.parse(localStorage.getItem('gymwiki.plan'))).toEqual({ goal: 'strength', frequency: 5 })

    setActivePinia(createPinia())
    const restored = usePlanStore()
    expect([restored.goal, restored.frequency]).toEqual(['strength', 5])
  })
})

describe('exercises store', () => {
  it('加载成功', async () => {
    exercisesApi.fetchExercises.mockResolvedValue([{ id: 1, name: 'Barbell Squat' }])
    const store = useExercisesStore()
    await store.load()
    expect(store.status).toBe('ready')
    expect(store.byId(1).name).toBe('Barbell Squat')
    expect(store.byId('1').name).toBe('Barbell Squat')
  })

  it('加载失败时记录错误，可重试', async () => {
    exercisesApi.fetchExercises.mockRejectedValueOnce(new ApiError('network_error', 0))
    const store = useExercisesStore()
    await store.load()
    expect(store.status).toBe('error')
    expect(store.error.code).toBe('network_error')

    exercisesApi.fetchExercises.mockResolvedValue([])
    await store.load()
    expect(store.status).toBe('ready')
    expect(store.error).toBeNull()
  })
})

describe('trainingLog store', () => {
  const log = { date: '2026-11-09', completed_count: 1, items: [{ exercise_id: 3 }] }

  it('完成：收到成功响应后才更新', async () => {
    let resolve
    logsApi.completeItem.mockReturnValue(new Promise((r) => { resolve = r }))
    const store = useTrainingLogStore()
    const pending = store.complete('2026-11-09', 3, { sets: 4 })
    expect(store.isPending('2026-11-09', 3)).toBe(true)
    expect(store.isCompleted('2026-11-09', 3)).toBe(false)
    resolve(log)
    await pending
    expect(store.isPending('2026-11-09', 3)).toBe(false)
    expect(store.isCompleted('2026-11-09', 3)).toBe(true)
  })

  it('完成失败：状态不变并抛出错误', async () => {
    logsApi.completeItem.mockRejectedValue(new ApiError('server_error', 500))
    const store = useTrainingLogStore()
    await expect(store.complete('2026-11-09', 3, {})).rejects.toBeInstanceOf(ApiError)
    expect(store.isCompleted('2026-11-09', 3)).toBe(false)
    expect(store.isPending('2026-11-09', 3)).toBe(false)
  })

  it('取消最后一项后当天日志被移除', async () => {
    logsApi.completeItem.mockResolvedValue(log)
    logsApi.uncompleteItem.mockResolvedValue(null)
    const store = useTrainingLogStore()
    await store.complete('2026-11-09', 3, {})
    await store.uncomplete('2026-11-09', 3)
    expect(store.logsByDate['2026-11-09']).toBeUndefined()
  })

  it('同一项正在请求时不重复提交', async () => {
    let resolve
    logsApi.completeItem.mockReturnValue(new Promise((r) => { resolve = r }))
    const store = useTrainingLogStore()
    const first = store.complete('2026-11-09', 3, {})
    const second = store.complete('2026-11-09', 3, {})
    resolve(log)
    await Promise.all([first, second])
    expect(logsApi.completeItem).toHaveBeenCalledTimes(1)
  })
})

describe('wrongBook store', () => {
  it('report 后按动作 id 能查到，remove 后消失', async () => {
    const record = { id: 1, exercise: { id: 7 }, mastery_status: 'unfixed' }
    wrongApi.reportWrong.mockResolvedValue(record)
    wrongApi.removeWrong.mockResolvedValue(null)
    const store = useWrongBookStore()
    await store.report(7, { error_category: 'form', user_note: '' })
    expect(store.byExerciseId(7)).toEqual(record)
    expect(store.isUnmastered(7)).toBe(true)
    await store.remove(7)
    expect(store.byExerciseId(7)).toBeNull()
  })

  it('review 用服务器返回值替换记录', async () => {
    wrongApi.fetchWrongBook.mockResolvedValue([{ id: 1, exercise: { id: 7 }, mastery_status: 'practicing' }])
    wrongApi.reviewWrong.mockResolvedValue({ id: 1, exercise: { id: 7 }, mastery_status: 'mastered' })
    const store = useWrongBookStore()
    await store.load()
    await store.review(7, 'fixed')
    expect(store.records).toHaveLength(1)
    expect(store.isUnmastered(7)).toBe(false)
  })
})
