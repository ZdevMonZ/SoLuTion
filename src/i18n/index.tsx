/**
 * Which language the page is in, and the one place that decision lives.
 *
 * Kept out of `state/store.tsx` on purpose: the store is the funnel (a reading, a
 * chosen treatment), the language is a preference that outlives it and is read by
 * every component including ones that never touch the funnel. A reload keeps it.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LANGUAGES } from '../data/languages'

export type Lang = 'en' | 'ko' | 'ja' | 'zh'

export const DEFAULT_LANG: Lang = 'en'

/** `<html lang>` values, so a screen reader and the browser's CJK font pick agree. */
const HTML_LANG: Record<Lang, string> = { en: 'en', ko: 'ko', ja: 'ja', zh: 'zh-Hans' }

const LANG_KEY = 'solution.lang.v1'

/** Only a language whose translation is complete counts; a stale choice falls back. */
const isUsable = (v: unknown): v is Lang => LANGUAGES.some((l) => l.lang === v && l.available)

function loadLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (isUsable(v)) return v
  } catch {
    // Storage blocked (private window): fall through to the browser's own language.
  }
  const nav = typeof navigator === 'undefined' ? '' : navigator.language.toLowerCase()
  const guess: Lang | null = nav.startsWith('ko')
    ? 'ko'
    : nav.startsWith('ja')
      ? 'ja'
      : nav.startsWith('zh')
        ? 'zh'
        : null
  return isUsable(guess) ? guess : DEFAULT_LANG
}

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      // Not persisting is fine; the choice still holds for this visit.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang]
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}

/**
 * One block of copy in all four languages.
 *
 * Every language is required, and each table is typed by the English one's shape,
 * so a missing or misspelled key is a compile error rather than a blank label. Write
 * the English table without `as const`, or its literal types would demand the other
 * languages repeat the English word for word.
 */
export type Tables<T> = Record<Lang, T>

/** The table for the page's language. */
export function useCopy<T>(tables: Tables<T>): T {
  return tables[useLang().lang]
}
