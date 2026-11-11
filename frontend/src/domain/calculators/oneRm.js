// 1RM 估算（Brzycki）：w × 36 / (37 − reps)；reps = 1 时即为 w。迁移自旧 App.vue 的 oneRmResult。
import { RANGES, checkPositive, checkRange, collect } from './validate.js'

export const ONE_RM_PERCENTAGES = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95]

/**
 * @param input { weight, reps }。重量的单位（kg / lb）只是标签，结果与输入同单位。
 * @returns { ok: true, oneRm, percentages: [{ percent, weight }] } 或 { ok: false, errors }（未取整）
 */
export function calcOneRm(input) {
  const { ok, values, errors } = collect({
    weight: checkPositive(input.weight),
    reps: checkRange(input.reps, RANGES.reps, { integer: true }),
  })
  if (!ok) return { ok: false, errors }

  const oneRm = values.reps === 1 ? values.weight : (values.weight * 36) / (37 - values.reps)
  return {
    ok: true,
    oneRm,
    percentages: ONE_RM_PERCENTAGES.map((percent) => ({ percent, weight: (oneRm * percent) / 100 })),
  }
}
