// 四种训练目标的组数 / 次数 / 休息 / 每日动作数（策略模式，ARCHITECTURE.md 6.3）。
// 迁移自旧 App.vue 的 planSetRule；文字（"次"、"秒"）由组件按语言生成。

export const STRATEGIES = {
  beginner: { sets: 3, reps: '10-12', rest: { unit: 's', range: '60-90' }, perDay: 4 },
  hypertrophy: { sets: 4, reps: '8-12', rest: { unit: 's', range: '60-90' }, perDay: 4 },
  fatloss: { sets: 3, reps: '12-15', rest: { unit: 's', range: '30-60' }, perDay: 5 },
  strength: { sets: 5, reps: '3-6', rest: { unit: 'min', range: '2-3' }, perDay: 4 },
}

// 每周频率 → 哪几天训练（周一 = 0）。其余为主动恢复日。
export const TRAINING_DAY_INDEXES = {
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
}

/** 休息时间存进训练日志时用不带语言的写法：'60-90s' / '2-3min'。 */
export function formatRest(rest) {
  return `${rest.range}${rest.unit}`
}

export function parseRest(value) {
  const match = /^(\d+(?:-\d+)?)(s|min)$/.exec(String(value ?? '').trim())
  return match ? { range: match[1], unit: match[2] } : null
}
