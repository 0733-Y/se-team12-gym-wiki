// t(key, params)：按语言取界面文字，缺键回退中文。
import zh from './zh.js'
import ko from './ko.js'
import en from './en.js'
import flagChina from '@/assets/flags/china.svg'
import flagKorea from '@/assets/flags/south-korea.svg'
import flagUnitedStates from '@/assets/flags/united-states.svg'

export const DEFAULT_LANG = 'zh'

export const LANGUAGES = [
  { id: 'zh', label: '中文', short: '中', flagSrc: flagChina },
  { id: 'en', label: 'English', short: 'EN', flagSrc: flagUnitedStates },
  { id: 'ko', label: '한국어', short: '한', flagSrc: flagKorea },
]

const DICTIONARIES = { zh, ko, en }

export function isSupportedLang(lang) {
  return Object.hasOwn(DICTIONARIES, lang)
}

export function translate(lang, key, params = {}) {
  const dictionary = DICTIONARIES[lang] || DICTIONARIES[DEFAULT_LANG]
  const text = dictionary[key] ?? DICTIONARIES[DEFAULT_LANG][key] ?? key
  return String(text).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? '')
}
