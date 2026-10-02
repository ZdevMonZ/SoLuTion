/**
 * The language picker's contents.
 *
 * Only English has copy. The other three are listed because the design lists them
 * and because a reader should be able to see the plan, but each is drawn in the
 * design's own disabled style and does nothing when clicked — the alternative,
 * switching a label while every sentence on the page stays English, would claim a
 * translation that does not exist. Give one of these a strings table and it moves
 * to `available: true`; nothing else has to change.
 */
export interface Language {
  code: string
  native: string
  english: string
  glyph: string
  available: boolean
}

export const LANGUAGES: Language[] = [
  { code: 'EN', native: 'English', english: 'English', glyph: 'A', available: true },
  { code: 'KO', native: '한국어', english: 'Korean', glyph: '가', available: false },
  { code: 'JA', native: '日本語', english: 'Japanese', glyph: 'あ', available: false },
  { code: 'ZH', native: '中文', english: 'Chinese', glyph: '中', available: false },
]

/** What the nav and the community header call the language in use. */
export const LANG_LABEL = 'English'
