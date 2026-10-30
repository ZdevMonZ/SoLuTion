/**
 * The shared parts' own words — only the funnel's progress label. Everything else a
 * primitive draws is handed to it by the screen, already in the page's language.
 *
 * The wording is the Android app's `BasicInfoStrings.stepOf`.
 */
import type { Tables } from './index'

const en = {
  /** Beside the rule over a funnel screen. The screen passes its own place in it. */
  stepOf: (step: number, of: number) => `Step ${step} of ${of}`,
}

export const PRIMITIVES: Tables<typeof en> = {
  en,
  ko: {
    stepOf: (step, of) => `${of}단계 중 ${step}단계`,
  },
  ja: {
    stepOf: (step, of) => `ステップ ${step}/${of}`,
  },
  zh: {
    stepOf: (step, of) => `第 ${step} 步，共 ${of} 步`,
  },
}
