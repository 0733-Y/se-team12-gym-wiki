import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// P0：确认应用能挂载并渲染首页
describe('App 骨架', () => {
  it('挂载后显示首页标题', async () => {
    router.push('/')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [createPinia(), router] } })
    expect(wrapper.text()).toContain('GYM WIKI')
  })
})
