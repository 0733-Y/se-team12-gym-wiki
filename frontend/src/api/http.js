// axios 实例：拆响应外壳；把网络失败、超时、4xx、5xx 统一成 ApiError{code, fields}。
import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

// error.code → 界面文字键。前端按 code 显示三语提示，不直接显示服务器的 message。
const MESSAGE_KEYS = {
  validation_error: 'errValidation',
  not_found: 'errNotFound',
  conflict: 'errConflict',
  server_error: 'errServer',
  network_error: 'errNetwork',
}

export class ApiError extends Error {
  constructor(code, status = 0, fields = null, message = '') {
    super(message || code)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.fields = fields
  }

  get messageKey() {
    return MESSAGE_KEYS[this.code] || MESSAGE_KEYS.server_error
  }
}

function codeFromStatus(status) {
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status >= 500) return 'server_error'
  return 'validation_error'
}

export function toApiError(err) {
  if (err instanceof ApiError) return err
  const response = err?.response
  if (!response) return new ApiError('network_error', 0, null, err?.message)
  const body = response.data?.error
  if (body && Object.hasOwn(MESSAGE_KEYS, body.code)) {
    return new ApiError(body.code, response.status, body.fields || null, body.message)
  }
  return new ApiError(codeFromStatus(response.status), response.status)
}

export function createHttp(options = {}) {
  const instance = axios.create({ baseURL: API_BASE, timeout: 10000, ...options })
  instance.interceptors.response.use(
    (response) => {
      const body = response.data
      const hasEnvelope = body && typeof body === 'object'
      return { data: hasEnvelope ? body.data ?? null : null, meta: hasEnvelope ? body.meta : undefined }
    },
    (err) => Promise.reject(toApiError(err)),
  )
  return instance
}

export const http = createHttp()

// 后端返回的图片路径始终以 /media/ 开头，这里统一拼基础地址
export function mediaUrl(path, base = API_BASE) {
  if (!path) return ''
  return `${base.replace(/\/+$/, '')}${path}`
}
