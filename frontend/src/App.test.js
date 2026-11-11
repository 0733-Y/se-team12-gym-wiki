import { beforeEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createAppRouter } from './router'
import zh from './i18n/zh.js'
import ko from './i18n/ko.js'
import en from './i18n/en.js'

// P3 的页面是空壳，不应发请求；这里挡住以防万一
vi.mock('@/api/exercises.js', () => ({ fetchExercises: vi.fn().mockResolvedValue([]), fetchExercise: vi.fn() }))

const PAGES = [
  ['/library', 'navLibrary'],
  ['/correction', 'navCorrection'],
  ['/plans', 'navPlans'],
  ['/logs', 'navLogs'],
  ['/tools', 'navTools'],
]

async function mountApp(path = '/') {
  const router = createAppRouter()
  router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [createPinia(), router] }, attachTo: document.body })
  return { wrapper, router }
}

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = ''
})

describe('App 外壳', () => {
  it('/ 跳转到 /library', async () => {
    const { router } = await mountApp('/')
    expect(router.currentRoute.value.path).toBe('/library')
  })

  it('五个页面可通过导航切换', async () => {
    const { wrapper, router } = await mountApp('/library')
    for (const [path, key] of PAGES) {
      await wrapper.get(`nav a[href="${path}"]`).trigger('click')
      // 页面是懒加载的，等路由切换和组件加载完成
      await vi.waitFor(() => {
        expect(router.currentRoute.value.path).toBe(path)
        expect(wrapper.get('main h1').text()).toBe(zh[key])
      })
    }
  })

  it('动作详情路由存在', async () => {
    const { router, wrapper } = await mountApp('/library/12')
    expect(router.currentRoute.value.name).toBe('exercise-detail')
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('可切换三种语言，导航与页面标题跟着变，并记住选择', async () => {
    const { wrapper } = await mountApp('/plans')
    expect(wrapper.get('main h1').text()).toBe(zh.navPlans)

    await wrapper.get('[data-testid="lang-ko"]').trigger('click')
    expect(wrapper.get('main h1').text()).toBe(ko.navPlans)
    expect(wrapper.get('nav a[href="/logs"]').text()).toContain(ko.navLogs)
    expect(document.documentElement.lang).toBe('ko')

    await wrapper.get('[data-testid="lang-en"]').trigger('click')
    expect(wrapper.get('main h1').text()).toBe(en.navPlans)
    expect(localStorage.getItem('gymwiki.lang')).toBe('en')
  })

  it('未知路径回到动作库', async () => {
    const { router } = await mountApp('/nope')
    expect(router.currentRoute.value.path).toBe('/library')
  })
})
