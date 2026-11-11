// 工具页：结果显示、字段错误、以及"输入和结果不发送到服务器、不落盘"（N03）。
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createAppRouter } from '@/router/index.js'
import ToolsView from './ToolsView.vue'

const sources = {
  ...import.meta.glob('../components/tools/*.{vue,js}', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob('./ToolsView.vue', { query: '?raw', import: 'default', eager: true }),
}

async function mountTools(path = '/tools') {
  const router = createAppRouter()
  router.push(path)
  await router.isReady()
  return mount(ToolsView, { global: { plugins: [createPinia(), router] }, attachTo: document.body })
}

const text = (wrapper, testId) => wrapper.get(`[data-testid="${testId}"]`).text()

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = ''
})

describe('卡路里计算器', () => {
  it('默认值（男 25 岁 175 cm 70 kg，久坐，维持）显示 BMR 1,674', async () => {
    const wrapper = await mountTools()
    expect(text(wrapper, 'calorie-bmr')).toBe('1,674')
    expect(text(wrapper, 'calorie-tdee')).toBe('2,009') // 1673.75 × 1.2 = 2008.5
    expect(text(wrapper, 'calorie-target')).toBe('2,009')
  })

  it('越界时显示字段错误并隐藏结果，改回来后恢复', async () => {
    const wrapper = await mountTools()
    await wrapper.get('[data-testid="calorie-age"]').setValue('5')
    expect(text(wrapper, 'calorie-age-error')).toBe('请输入 13–100 之间的数值。')
    expect(wrapper.get('[data-testid="calorie-age"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('[data-testid="calorie-bmr"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="calorie-invalid"]').exists()).toBe(true)

    await wrapper.get('[data-testid="calorie-age"]').setValue('30')
    expect(wrapper.find('[data-testid="calorie-age-error"]').exists()).toBe(false)
    expect(text(wrapper, 'calorie-bmr')).toBe('1,649')
  })

  it('空值提示输入数字', async () => {
    const wrapper = await mountTools()
    await wrapper.get('[data-testid="calorie-weight"]').setValue('')
    expect(text(wrapper, 'calorie-weight-error')).toBe('请输入数字。')
  })

  it('切到英制后单位和范围提示跟着变', async () => {
    const wrapper = await mountTools()
    await wrapper.get('[data-testid="units-imperial"] input').setValue(true)
    expect(wrapper.get('[data-testid="calorie-height"]').element.value).toBe('69')
    expect(wrapper.get('[data-testid="calorie-weight"]').element.value).toBe('154')
    // 154 lb、69 in → 10×69.853 + 6.25×175.26 − 125 + 5 ≈ 1674
    expect(text(wrapper, 'calorie-bmr')).toBe('1,674')
    await wrapper.get('[data-testid="calorie-weight"]').setValue('700')
    expect(text(wrapper, 'calorie-weight-error')).toBe('请输入 44.1–661.4 之间的数值。')
  })
})

describe('营养素与 1RM', () => {
  it('卡路里结果可以带到营养素计算器', async () => {
    const wrapper = await mountTools()
    await wrapper.get('[data-testid="use-in-macros"]').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="macro-calories"]').element.value).toBe('2009')
      expect(wrapper.get('[data-testid="tool-tab-macros"]').attributes('aria-selected')).toBe('true')
    })
  })

  it('2000 千卡、均衡、4 餐 → 每餐碳水 50 g、蛋白质 38 g、脂肪 17 g', async () => {
    const wrapper = await mountTools('/tools?tool=macros')
    await wrapper.get('[data-testid="macro-meals"]').setValue('4')
    const perMeal = (nutrient) => wrapper.get(`[data-nutrient="${nutrient}"] [data-testid="per-meal"]`).text()
    expect([perMeal('carbs'), perMeal('protein'), perMeal('fat')]).toEqual(['50', '38', '17'])
    await wrapper.get('[data-testid="macro-meals"]').setValue('11')
    expect(text(wrapper, 'macro-meals-error')).toBe('请输入 1–10 之间的数值。')
    expect(wrapper.find('[data-testid="macro-invalid"]').exists()).toBe(true)
  })

  it('100 × 5 次 → 112.5；次数越界时报错', async () => {
    const wrapper = await mountTools('/tools?tool=one-rm')
    expect(text(wrapper, 'one-rm-value')).toBe('112.5')
    expect(wrapper.get('[data-percent="80"] td').text()).toBe('90.0')
    await wrapper.get('[data-testid="one-rm-reps"]').setValue('31')
    expect(text(wrapper, 'one-rm-reps-error')).toBe('请输入 1–30 之间的数值。')
    await wrapper.get('[data-testid="one-rm-reps"]').setValue('5')
    await wrapper.get('[data-testid="one-rm-weight"]').setValue('0')
    expect(text(wrapper, 'one-rm-weight-error')).toBe('请输入大于 0 的数值。')
  })
})

describe('N03：计算器的输入和结果不发送、不保存', () => {
  it('工具页和计算器组件不引用接口层，也不读写浏览器存储', () => {
    expect(Object.keys(sources).length).toBeGreaterThanOrEqual(6)
    for (const [path, code] of Object.entries(sources)) {
      expect(/from\s+['"][^'"]*\/api\//.test(code), `${path}: api`).toBe(false)
      expect(/axios|fetch\(|XMLHttpRequest|sendBeacon/.test(code), `${path}: network`).toBe(false)
      expect(/localStorage|sessionStorage|indexedDB|document\.cookie/.test(code), `${path}: storage`).toBe(false)
      const stores = [...code.matchAll(/from\s+['"]@\/stores\/(\w+)\.js['"]/g)].map((match) => match[1])
      expect(stores.every((name) => name === 'ui'), `${path}: stores ${stores}`).toBe(true)
    }
  })

  it('输入数值后浏览器存储没有新增内容，地址栏里也没有数值', async () => {
    const wrapper = await mountTools()
    await wrapper.get('[data-testid="calorie-weight"]').setValue('83.5')
    await wrapper.get('[data-testid="calorie-age"]').setValue('41')
    await wrapper.get('[data-testid="use-in-macros"]').trigger('click')
    await vi.waitFor(() => expect(wrapper.get('[data-testid="tool-tab-macros"]').attributes('aria-selected')).toBe('true'))
    expect(localStorage.length).toBe(0)
    expect(window.location.search).not.toMatch(/83|41|\d{4}/)
  })
})
