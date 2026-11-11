import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { ApiError, createHttp, mediaUrl } from './http.js'

// 用假的 axios adapter 代替网络
function httpWith(handler) {
  return createHttp({ baseURL: 'http://test', adapter: async (config) => handler(config) })
}

function reply(config, status, data) {
  const response = { status, statusText: '', data, headers: {}, config }
  if (status >= 200 && status < 300) return response
  throw new AxiosError('Request failed', AxiosError.ERR_BAD_RESPONSE, config, null, response)
}

describe('http 外壳处理', () => {
  it('成功时拆出 data 和 meta', async () => {
    const http = httpWith((c) => reply(c, 200, { data: [1, 2], meta: { days: 7 } }))
    expect(await http.get('/api/x/')).toEqual({ data: [1, 2], meta: { days: 7 } })
  })

  it('204 返回 data: null', async () => {
    const http = httpWith((c) => reply(c, 204, ''))
    expect(await http.delete('/api/x/')).toEqual({ data: null, meta: undefined })
  })

  it('请求地址带上 /api 前缀之外不做改动，并发送 JSON', async () => {
    let seen
    const http = httpWith((c) => { seen = c; return reply(c, 200, { data: {} }) })
    await http.put('/api/training-logs/2026-11-09/items/3/', { sets: 4 })
    expect(seen.baseURL).toBe('http://test')
    expect(seen.method).toBe('put')
    expect(JSON.parse(seen.data)).toEqual({ sets: 4 })
  })
})

describe('http 错误统一成 ApiError', () => {
  async function failure(handler) {
    try {
      await httpWith(handler).get('/api/x/')
    } catch (err) {
      return err
    }
    throw new Error('expected rejection')
  }

  it('400 带字段错误', async () => {
    const body = { error: { code: 'validation_error', message: 'bad', fields: { days: ['x'] } } }
    const err = await failure((c) => reply(c, 400, body))
    expect(err).toBeInstanceOf(ApiError)
    expect(err.code).toBe('validation_error')
    expect(err.status).toBe(400)
    expect(err.fields).toEqual({ days: ['x'] })
    expect(err.messageKey).toBe('errValidation')
  })

  it('404 / 409 / 500', async () => {
    const cases = [[404, 'not_found', 'errNotFound'], [409, 'conflict', 'errConflict'], [500, 'server_error', 'errServer']]
    for (const [status, code, key] of cases) {
      const err = await failure((c) => reply(c, status, { error: { code, message: 'm' } }))
      expect([err.code, err.status, err.messageKey]).toEqual([code, status, key])
    }
  })

  it('错误正文不是统一外壳时按状态码归类', async () => {
    expect((await failure((c) => reply(c, 502, '<html>bad gateway</html>'))).code).toBe('server_error')
    expect((await failure((c) => reply(c, 404, '<html></html>'))).code).toBe('not_found')
    expect((await failure((c) => reply(c, 422, {}))).code).toBe('validation_error')
  })

  it('网络失败与超时归为 network_error', async () => {
    const network = await failure((c) => { throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, c) })
    expect([network.code, network.status, network.messageKey]).toEqual(['network_error', 0, 'errNetwork'])
    const timeout = await failure((c) => { throw new AxiosError('timeout', AxiosError.ECONNABORTED, c) })
    expect(timeout.code).toBe('network_error')
  })
})

describe('mediaUrl', () => {
  it('把 /media/ 路径拼到基础地址后面', () => {
    expect(mediaUrl('/media/exercises/a.jpg', 'http://127.0.0.1:8000')).toBe('http://127.0.0.1:8000/media/exercises/a.jpg')
    expect(mediaUrl('/media/a.jpg', 'http://127.0.0.1:8000/')).toBe('http://127.0.0.1:8000/media/a.jpg')
  })

  it('空值返回空串', () => {
    expect(mediaUrl(null)).toBe('')
    expect(mediaUrl('')).toBe('')
  })
})
