// 三语搜索（F01）。纯函数。
// 输入先归一化（小写、去空格和连字符）→ 经同义词表归一成规范词 → 与动作匹配。
// 三种语言的同义写法归到同一个规范词，所以一定得到同一组动作。
import { SEARCH_ACTIONS, SEARCH_GROUPS } from '../data/searchSynonyms.js'

export function normalizeTerm(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\-_]+/g, '')
}

// 归一化后的别名 → 规范条目，只建一次
const ACTION_BY_ALIAS = new Map()
for (const action of SEARCH_ACTIONS) {
  const keywords = action.keywords.map(normalizeKeyword)
  for (const alias of action.aliases) ACTION_BY_ALIAS.set(normalizeTerm(alias), keywords)
}

const GROUPS_BY_TERM = new Map()
for (const { groups, terms } of SEARCH_GROUPS) {
  for (const term of terms) GROUPS_BY_TERM.set(normalizeTerm(term), groups)
}

// 关键词前面带空格（如 ' row'）表示要从单词开头匹配，避免 "narrow"、"throw" 被算进去
function normalizeKeyword(keyword) {
  return { text: normalizeTerm(keyword), wordStart: keyword.startsWith(' ') }
}

function nameWords(name) {
  return String(name ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function nameMatchesKeyword(exercise, keyword) {
  if (!keyword.wordStart) return normalizeTerm(exercise.name).includes(keyword.text)
  return nameWords(exercise.name).some((word) => word === keyword.text || word === `${keyword.text}s`)
}

export function filterByGroup(exercises, groupId) {
  if (!groupId || groupId === 'all') return [...exercises]
  return exercises.filter((exercise) => (exercise.muscle_groups || []).includes(groupId))
}

/**
 * @param exercises 动作列表（含 name、muscle_groups）
 * @param term 用户输入
 * @param lang 当前语言 zh / ko / en
 * @param options.nameOf(exercise, lang) 当前语言的动作译名（由调用方提供，domain 不依赖翻译表）
 * @param options.groupLabel(groupId, lang) 当前语言的肌群标签
 */
export function search(exercises, term, lang, options = {}) {
  const query = normalizeTerm(term)
  if (!query) return [...exercises]

  // 1. 动作词：英文名包含规范词
  const keywords = ACTION_BY_ALIAS.get(query)
  if (keywords) {
    return exercises.filter((exercise) => keywords.some((keyword) => nameMatchesKeyword(exercise, keyword)))
  }

  // 2. 肌群词：属于对应的细分肌群
  const groups = GROUPS_BY_TERM.get(query)
  if (groups) {
    return exercises.filter((exercise) => (exercise.muscle_groups || []).some((id) => groups.includes(id)))
  }

  // 3. 其余：英文名、当前语言译名、肌群标签做包含匹配
  const { nameOf, groupLabel } = options
  return exercises.filter((exercise) => {
    if (normalizeTerm(exercise.name).includes(query)) return true
    if (nameOf && normalizeTerm(nameOf(exercise, lang)).includes(query)) return true
    return (exercise.muscle_groups || []).some(
      (id) => normalizeTerm(id).includes(query) || (groupLabel && normalizeTerm(groupLabel(id, lang)).includes(query)),
    )
  })
}
