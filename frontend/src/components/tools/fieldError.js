// 把 domain/calculators 返回的字段错误（代码 + 上下限）变成当前语言的提示文字。
const KEYS = { required: 'errRequired', integer: 'errInteger', range: 'errRange', positive: 'errPositive' }

// 上下限最多保留一位小数（英制换算后会有小数）
const tidy = (value) => String(Math.round(value * 10) / 10)

export function fieldErrorText(ui, error) {
  if (!error) return ''
  const params = error.code === 'range' ? { min: tidy(error.min), max: tidy(error.max) } : {}
  return ui.t(KEYS[error.code] || 'errRequired', params)
}

export const formatNumber = (value, digits = 0) =>
  Number(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
