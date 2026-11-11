// 计算器输入校验（F04）。超出范围时返回字段错误，不计算。
// 错误只带代码和上下限，文字由组件按语言生成。

export const RANGES = {
  age: { min: 13, max: 100 },
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 20, max: 300 },
  calories: { min: 800, max: 10000 },
  meals: { min: 1, max: 10 },
  reps: { min: 1, max: 30 },
}

/** 表单值 → 有限数字；空值、非数字返回 null。 */
export function toNumber(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' && value.trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/**
 * 检查一个字段。
 * @param value 表单值
 * @param range { min, max }，用于比较的范围（与 scale 后的值同一单位）
 * @param options.integer 必须是整数
 * @param options.scale 比较前先乘的系数（英制 → 公制）；错误里的上下限会换回输入单位
 * @returns { value } 或 { error }
 */
export function checkRange(value, range, { integer = false, scale = 1 } = {}) {
  const number = toNumber(value)
  if (number === null) return { error: { code: 'required' } }
  if (integer && !Number.isInteger(number)) return { error: { code: 'integer' } }
  const scaled = number * scale
  if (scaled < range.min || scaled > range.max) {
    return { error: { code: 'range', min: range.min / scale, max: range.max / scale } }
  }
  return { value: scaled }
}

export function checkPositive(value) {
  const number = toNumber(value)
  if (number === null) return { error: { code: 'required' } }
  if (number <= 0) return { error: { code: 'positive' } }
  return { value: number }
}

/** 把若干字段的检查结果合成 { ok, values, errors }。 */
export function collect(checks) {
  const values = {}
  const errors = {}
  for (const [field, result] of Object.entries(checks)) {
    if (result.error) errors[field] = result.error
    else values[field] = result.value
  }
  return { ok: Object.keys(errors).length === 0, values, errors }
}
