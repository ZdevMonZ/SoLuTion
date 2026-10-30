/**
 * The language picker's contents.
 *
 * A language is `available` only when every sentence on the page has a table in it.
 * The alternative — switching a label while sentences stay English — would claim a
 * translation that does not exist. The rest are listed because the design lists
 * them and a reader should be able to see the plan; each is drawn in the design's
 * disabled style and does nothing when clicked. Flip a language to `available: true`
 * once its strings, screens and catalogue are all translated; nothing else changes.
 */
import type { Lang } from '../i18n'

export interface Language {
  code: string
  lang: Lang
  native: string
  english: string
  glyph: string
  available: boolean
}

export const LANGUAGES: Language[] = [
  { code: 'EN', lang: 'en', native: 'English', english: 'English', glyph: 'A', available: true },
  { code: 'KO', lang: 'ko', native: '한국어', english: 'Korean', glyph: '가', available: true },
  { code: 'JA', lang: 'ja', native: '日本語', english: 'Japanese', glyph: 'あ', available: true },
  { code: 'ZH', lang: 'zh', native: '中文', english: 'Chinese', glyph: '中', available: true },
]
