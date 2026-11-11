// 导出 docs/translation-review.csv：id, 英文, 中文, 韩文, 是否修改, 说明
// 用法（在仓库根目录）：node scripts/export-translation-review.mjs
// 动作清单取自 frontend/src/domain/search.exercises.fixture.json（数据库导出，id 与数据库一致）。
// "是否修改"= 审校后的名字和审校前（旧翻译表 + P4 补充表）不同。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'frontend/src')
const { exerciseName, unreviewedExerciseName } = await import(path.join(src, 'i18n/exerciseLocale.js').replace(/\\/g, '/').replace(/^([A-Za-z]):/, 'file:///$1:'))
const { REVIEWED } = await import(path.join(src, 'i18n/exerciseNamesReviewed.js').replace(/\\/g, '/').replace(/^([A-Za-z]):/, 'file:///$1:'))

const exercises = JSON.parse(fs.readFileSync(path.join(src, 'domain/search.exercises.fixture.json'), 'utf8'))

const quote = (value) => `"${String(value).replace(/"/g, '""')}"`
const rows = [['id', '英文', '中文', '韩文', '是否修改', '说明']]

for (const exercise of exercises) {
  const zh = exerciseName(exercise, 'zh')
  const ko = exerciseName(exercise, 'ko')
  const oldZh = unreviewedExerciseName(exercise, 'zh')
  const oldKo = unreviewedExerciseName(exercise, 'ko')
  const changes = []
  if (zh !== oldZh) changes.push(`中文：${oldZh} → ${zh}`)
  if (ko !== oldKo) changes.push(`韩文：${oldKo} → ${ko}`)
  const reason = REVIEWED[exercise.name.toLowerCase()]?.[2] || ''
  const note = [...changes, reason && `理由：${reason}`].filter(Boolean).join('；')
  rows.push([exercise.id, exercise.name, zh, ko, changes.length ? '是' : '否', note || '检查后未改'])
}

// 带 BOM，Excel 直接打开不会乱码
const csv = '﻿' + rows.map((row) => row.map(quote).join(',')).join('\r\n') + '\r\n'
fs.writeFileSync(path.join(root, 'docs/translation-review.csv'), csv, 'utf8')
const modified = rows.slice(1).filter((row) => row[4] === '是').length
console.log(`${rows.length - 1} exercises, ${modified} modified -> docs/translation-review.csv`)
