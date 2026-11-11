// 语言与 toast。语言是偏好，存 localStorage。
import { defineStore } from 'pinia'
import { DEFAULT_LANG, isSupportedLang, translate } from '@/i18n/index.js'

const LANG_KEY = 'gymwiki.lang'

function loadLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    return isSupportedLang(stored) ? stored : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

let nextToastId = 1

export const useUiStore = defineStore('ui', {
  state: () => ({
    lang: loadLang(),
    toasts: [], // { id, key, params, type }
  }),
  actions: {
    setLang(lang) {
      if (!isSupportedLang(lang)) return
      this.lang = lang
      try {
        localStorage.setItem(LANG_KEY, lang)
      } catch {
        // 隐私模式下写不进去，只影响下次打开时的默认语言
      }
    },
    t(key, params) {
      return translate(this.lang, key, params)
    },
    // key 是界面文字键；type: 'info' | 'success' | 'error'
    toast(key, type = 'info', params = {}) {
      const id = nextToastId++
      this.toasts.push({ id, key, params, type })
      return id
    },
    // 写操作失败时的统一提示
    toastError(err) {
      return this.toast(err?.messageKey || 'actionFailed', 'error')
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
})
