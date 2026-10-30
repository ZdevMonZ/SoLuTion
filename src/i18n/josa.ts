/**
 * Korean particle (조사) agreement — the web copy of the app's `util/Josa.kt`.
 *
 * Particles change form depending on whether the preceding syllable ends in a
 * consonant (받침). Sentences composed from data — category or treatment names —
 * have to pick the form at runtime, or they read as broken Korean ("색소과 모공는").
 */
const HANGUL_FIRST = 0xac00
const HANGUL_LAST = 0xd7a3
const JONGSEONG_COUNT = 28

/** True when the last character is a Hangul syllable carrying a final consonant. */
export function endsWithConsonant(word: string): boolean {
  const last = word.trimEnd().slice(-1)
  if (!last) return false
  const code = last.charCodeAt(0)
  if (code < HANGUL_FIRST || code > HANGUL_LAST) return false
  return (code - HANGUL_FIRST) % JONGSEONG_COUNT !== 0
}

export const attach = (word: string, afterConsonant: string, afterVowel: string): string =>
  word + (endsWithConsonant(word) ? afterConsonant : afterVowel)

/** 모공 → 모공과, 색소 → 색소와 */
export const and = (word: string) => attach(word, '과', '와')
/** 모공 → 모공은, 색소 → 색소는 */
export const topic = (word: string) => attach(word, '은', '는')
/** 모공 → 모공이, 색소 → 색소가 */
export const subject = (word: string) => attach(word, '이', '가')
/** 모공 → 모공을, 색소 → 색소를 */
export const object = (word: string) => attach(word, '을', '를')

/** "모공과 색소"; three or more comma the list and join only the final pair. */
export function joinAnd(words: string[]): string {
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]
  if (words.length === 2) return `${and(words[0])} ${words[1]}`
  return (
    words
      .slice(0, -2)
      .map((w) => `${w}, `)
      .join('') + `${and(words[words.length - 2])} ${words[words.length - 1]}`
  )
}
