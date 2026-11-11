// 动作名、说明、要点的本地化。迁移自旧 App.vue 的 localizedExerciseName 等方法。
// 后端只存英文原文；中文和韩文按"精确翻译 → 词组替换 → 按肌群和器械生成"的顺序取。
import { EXERCISE_NAME_REPLACEMENTS, EXERCISE_NAME_TRANSLATIONS } from './exerciseNames.js'
import { EXTRA_NAME_TRANSLATIONS } from './exerciseNamesExtra.js'
import {
  EXERCISE_CONTENT_TRANSLATIONS,
  EXERCISE_DESCRIPTION_TRANSLATIONS,
  EXERCISE_TEXT_REPLACEMENTS,
} from './exerciseTexts.js'
import { MUSCLE_LABELS } from './muscleLabels.js'

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// 长词组优先替换，避免短词把长词拆散
function applyReplacements(value, replacements) {
  let result = String(value || '')
  replacements
    .slice()
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([source, target]) => {
      result = result.replace(new RegExp(escapeRegExp(source), 'gi'), target)
    })
  return result
}

const hasEnglish = (text) => /[A-Za-z]/.test(String(text || ''))
const contentKey = (exercise) => String(exercise?.name || '').trim().toLowerCase()

export function muscleLabel(groupId, lang) {
  return MUSCLE_LABELS[lang]?.[groupId] || MUSCLE_LABELS.zh[groupId] || groupId
}

// 源数据里的肌肉、器械、难度、动作类型等英文值
const TERM_LABELS = {
  zh: {
    'Primary muscles': '主要肌群', 'Secondary muscles': '辅助肌群', Mechanic: '动作类型',
    abdominals: '腹肌', abductors: '外展肌', adductors: '内收肌', biceps: '肱二头肌', calves: '小腿',
    chest: '胸部', forearms: '前臂', glutes: '臀部', hamstrings: '腘绳肌', lats: '背阔肌',
    'lower back': '下背部', 'middle back': '中背部', neck: '颈部', quadriceps: '股四头肌',
    shoulders: '肩部', traps: '斜方肌', triceps: '肱三头肌', none: '无',
    'body only': '徒手', barbell: '杠铃', dumbbell: '哑铃', cable: '绳索', machine: '器械', bands: '弹力带',
    kettlebells: '壶铃', 'medicine ball': '药球', 'exercise ball': '健身球', 'foam roll': '泡沫轴',
    'e-z curl bar': '曲杆', other: '其他',
    beginner: '初级', intermediate: '中级', expert: '高级',
    compound: '复合动作', isolation: '孤立动作', unknown: '未知',
  },
  ko: {
    'Primary muscles': '주요 근육', 'Secondary muscles': '보조 근육', Mechanic: '동작 유형',
    abdominals: '복근', abductors: '외전근', adductors: '내전근', biceps: '이두근', calves: '종아리',
    chest: '가슴', forearms: '전완근', glutes: '둔근', hamstrings: '햄스트링', lats: '광배근',
    'lower back': '허리', 'middle back': '중부 등', neck: '목', quadriceps: '대퇴사두근',
    shoulders: '어깨', traps: '승모근', triceps: '삼두근', none: '없음',
    'body only': '맨몸', barbell: '바벨', dumbbell: '덤벨', cable: '케이블', machine: '머신', bands: '밴드',
    kettlebells: '케틀벨', 'medicine ball': '메디신볼', 'exercise ball': '짐볼', 'foam roll': '폼롤러',
    'e-z curl bar': 'EZ 바', other: '기타',
    beginner: '초급', intermediate: '중급', expert: '고급',
    compound: '복합 동작', isolation: '고립 동작', unknown: '알 수 없음',
  },
  en: {
    'body only': 'Body only', barbell: 'Barbell', dumbbell: 'Dumbbell', cable: 'Cable', machine: 'Machine',
    bands: 'Bands', kettlebells: 'Kettlebells', 'medicine ball': 'Medicine ball', 'exercise ball': 'Exercise ball',
    'foam roll': 'Foam roll', 'e-z curl bar': 'E-Z curl bar', other: 'Other',
    beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert',
  },
}

// 器械、难度等单个值的标签；没有对应翻译时返回原值
export function termLabel(value, lang) {
  const key = String(value ?? '').trim()
  if (!key) return ''
  return TERM_LABELS[lang]?.[key] ?? TERM_LABELS[lang]?.[key.toLowerCase()] ?? key
}

const ACTION_NAMES = [
  [/bench press|chest press|press/, { zh: '推举', ko: '프레스' }],
  [/fly|flye/, { zh: '飞鸟', ko: '플라이' }],
  [/pull-up|pull up|pullups?|chin-up/, { zh: '引体向上', ko: '풀업' }],
  [/pulldown/, { zh: '下拉', ko: '풀다운' }],
  [/\brows?\b/, { zh: '划船', ko: '로우' }],
  [/curl/, { zh: '弯举', ko: '컬' }],
  [/extension/, { zh: '伸展', ko: '익스텐션' }],
  [/knee raise|leg raise|hip raise/, { zh: '举腿', ko: '레그 레이즈' }],
  [/calf/, { zh: '提踵', ko: '카프 레이즈' }],
  [/raise/, { zh: '平举', ko: '레이즈' }],
  [/crunch/, { zh: '卷腹', ko: '크런치' }],
  [/squat/, { zh: '深蹲', ko: '스쿼트' }],
  [/lunge|split squat/, { zh: '箭步蹲', ko: '런지' }],
  [/deadlift/, { zh: '硬拉', ko: '데드리프트' }],
  [/bridge|hip thrust/, { zh: '臀桥', ko: '힙 브리지' }],
  [/shrug/, { zh: '耸肩', ko: '슈러그' }],
  [/walk|carry|drag/, { zh: '行走训练', ko: '워크' }],
]

const FALLBACK_ACTION = { zh: '训练动作', ko: '운동' }

function inferredAction(name, lang) {
  const value = String(name || '').toLowerCase()
  const match = ACTION_NAMES.find(([pattern]) => pattern.test(value))
  return match ? match[1][lang] : FALLBACK_ACTION[lang]
}

function equipmentLabel(exercise, lang) {
  const value = String(exercise?.equipment || '').toLowerCase()
  if (!value || value === 'other') return ''
  return termLabel(value, lang)
}

// 翻译表和替换规则都覆盖不到时，用"器械 + 主肌群 + 动作类型"拼一个名字
function generatedName(exercise, lang) {
  const focus = exercise?.muscle_groups?.[0] ? muscleLabel(exercise.muscle_groups[0], lang) : ''
  const parts = [equipmentLabel(exercise, lang), focus, inferredAction(exercise?.name, lang)].filter(Boolean)
  if (!parts.length) return FALLBACK_ACTION[lang]
  return lang === 'ko' ? parts.join(' ') : parts.join('')
}

export function exerciseName(exercise, lang) {
  const rawName = String(exercise?.name || '').trim()
  if (!rawName || lang === 'en' || !EXERCISE_NAME_REPLACEMENTS[lang]) return rawName
  const key = contentKey(exercise)
  const exact = EXERCISE_NAME_TRANSLATIONS[lang]?.[key] || EXTRA_NAME_TRANSLATIONS[lang]?.[key]
  if (exact) return exact
  const replaced = applyReplacements(rawName, EXERCISE_NAME_REPLACEMENTS[lang])
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()
  return hasEnglish(replaced) ? generatedName(exercise, lang) : replaced
}

// "1. xxx\n2. xxx" 或 "1.xxx\n\n2.xxx" → ['xxx', 'xxx']
function splitSteps(text) {
  return String(text || '')
    .split(/\r?\n+/)
    .map((line) => line.trim().replace(/^\d+\.\s*/, ''))
    .filter(Boolean)
}

function generatedSteps(exercise, lang) {
  const name = exerciseName(exercise, lang)
  const focus = (exercise?.muscle_groups || []).slice(0, 2).map((id) => muscleLabel(id, lang))
  const tool = equipmentLabel(exercise, lang) || (lang === 'ko' ? '필요한 장비' : '所需器械')
  if (lang === 'ko') {
    const target = focus.join(', ')
    return [
      `${tool}을(를) 준비하고 ${name}의 시작 자세를 잡습니다. 주요 목표 근육은 ${target}입니다.`,
      '코어를 고정하고 관절을 안정적으로 유지하며, 먼저 가벼운 중량으로 동작 경로를 확인합니다.',
      `${target}이(가) 주도적으로 수축하는 느낌에 집중하며 동작 이름에 맞는 경로로 힘을 냅니다.`,
      '반동, 어깨 들림, 몸통 흔들림 없이 천천히 시작 자세로 돌아옵니다.',
      '계획된 반복 횟수만큼 수행하고 통증이나 자세 붕괴가 느껴지면 즉시 중단합니다.',
    ]
  }
  const target = focus.join('、')
  return [
    `准备${tool}，进入${name}的起始姿势，并确认主要目标是${target}。`,
    '保持核心收紧、关节稳定，先用较轻重量熟悉动作轨迹。',
    `按动作名称对应的轨迹完成发力阶段，集中感受${target}主动收缩。`,
    '缓慢回到起始位置，避免借助惯性、耸肩或身体摆动代偿。',
    '按计划次数重复；如果出现疼痛、失控或明显不适，请立即停止。',
  ]
}

/** 动作步骤，返回字符串数组（不带序号）。generated 为 true 表示是按模板生成的通用说明。 */
export function exerciseSteps(exercise, lang) {
  const original = splitSteps(exercise?.description)
  if (lang === 'en' || !EXERCISE_TEXT_REPLACEMENTS[lang]) return { steps: original, generated: false }

  const key = contentKey(exercise)
  const translated = EXERCISE_DESCRIPTION_TRANSLATIONS[lang]?.[key]
  if (translated?.length) return { steps: [...translated], generated: false }

  const content = EXERCISE_CONTENT_TRANSLATIONS[key]?.[lang]?.description
  if (content) return { steps: splitSteps(content), generated: false }

  const replaced = original.map((step) =>
    applyReplacements(step, EXERCISE_TEXT_REPLACEMENTS[lang]).replace(/\s+([,.])/g, '$1').trim(),
  )
  if (replaced.length && !replaced.some(hasEnglish)) return { steps: replaced, generated: false }
  return { steps: generatedSteps(exercise, lang), generated: true }
}

const SAFETY_TIP = 'Keep the movement controlled and stop if pain appears.'
const SAFETY_TIP_TRANSLATIONS = {
  zh: '保持动作受控；如果出现疼痛，请立即停止。',
  ko: '동작을 통제하며 수행하고 통증이 나타나면 즉시 중단하세요.',
}

/** 核心要点，返回字符串数组。 */
export function exerciseKeyPoints(exercise, lang) {
  const content = EXERCISE_CONTENT_TRANSLATIONS[contentKey(exercise)]
  const curated = content?.[lang]?.key_points || content?.en?.key_points
  if (curated) return splitSteps(curated)

  const lines = String(exercise?.key_points || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lang === 'en' || !SAFETY_TIP_TRANSLATIONS[lang]) return lines

  const separator = lang === 'ko' ? ', ' : '、'
  return lines.map((line) => {
    if (line === SAFETY_TIP) return SAFETY_TIP_TRANSLATIONS[lang]
    const match = line.match(/^([^:]+):\s*(.*)$/)
    if (!match) return line
    const values = match[2].split(',').map((value) => termLabel(value, lang)).join(separator)
    return `${termLabel(match[1], lang)}: ${values}`
  })
}
