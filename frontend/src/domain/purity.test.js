import { describe, it, expect } from 'vitest'

// domain/ 是纯函数：不 import Vue、store、api，不读写 localStorage，不调用 t()（CLAUDE.md 硬性约束）
const sources = import.meta.glob('./**/*.js', { query: '?raw', import: 'default', eager: true })

const FORBIDDEN = [
  [/from\s+['"]vue['"]/, 'import vue'],
  [/from\s+['"]pinia['"]/, 'import pinia'],
  [/from\s+['"][^'"]*\/stores\//, 'import store'],
  [/from\s+['"][^'"]*\/api\//, 'import api'],
  [/from\s+['"][^'"]*\/i18n\//, 'import i18n'],
  [/localStorage|sessionStorage/, 'web storage'],
  [/\bt\(/, 't()'],
]

describe('domain 纯度', () => {
  const files = Object.entries(sources).filter(([path]) => !path.endsWith('.test.js'))

  it('能扫描到 domain 文件', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const [path, code] of files) {
    it(`${path} 没有禁止的依赖`, () => {
      for (const [pattern, label] of FORBIDDEN) {
        expect(pattern.test(code), `${path}: ${label}`).toBe(false)
      }
    })
  }
})
