import { describe, it, expect } from 'vitest'
import zh from './zh.js'
import ko from './ko.js'
import en from './en.js'
import { LANGUAGES, translate } from './index.js'
import { MUSCLE_LABELS } from './muscleLabels.js'
import { MUSCLE_GROUP_IDS } from '@/data/muscleFilters.js'

describe('界面文字', () => {
  it('三种语言的键完全一致', () => {
    const keys = Object.keys(zh).sort()
    expect(Object.keys(ko).sort()).toEqual(keys)
    expect(Object.keys(en).sort()).toEqual(keys)
  })

  it('没有空字符串', () => {
    for (const dict of [zh, ko, en]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(String(value).trim(), key).not.toBe('')
      }
    }
  })

  it('LANGUAGES 为 zh / ko / en', () => {
    expect(LANGUAGES.map((l) => l.id).sort()).toEqual(['en', 'ko', 'zh'])
  })
})

describe('translate', () => {
  it('按语言取文字', () => {
    expect(translate('zh', 'navLibrary')).toBe('动作库')
    expect(translate('en', 'navLibrary')).toBe(en.navLibrary)
    expect(translate('ko', 'navLibrary')).toBe(ko.navLibrary)
  })

  it('替换 {参数}', () => {
    expect(translate('zh', 'exerciseCount', { count: 3 })).toBe('3 个动作')
  })

  it('缺键回退中文，中文也没有则返回键名', () => {
    expect(translate('xx', 'navLibrary')).toBe('动作库')
    expect(translate('en', 'noSuchKey')).toBe('noSuchKey')
  })
})

describe('肌群标签', () => {
  it('16 个肌群在三种语言里都有标签', () => {
    for (const lang of ['zh', 'ko', 'en']) {
      expect(Object.keys(MUSCLE_LABELS[lang]).sort(), lang).toEqual([...MUSCLE_GROUP_IDS].sort())
    }
  })
})
