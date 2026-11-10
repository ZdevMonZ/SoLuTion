import translations from './treatmentText.json'
import type { Lang } from './index'
import type { Treatment } from '../data/catalog'
import { classificationFor } from '../data/treatmentConcerns'

const columns = { en: 0, ja: 1, zh: 2 } as const
const words: Readonly<Record<string, readonly string[]>> = translations.translations

/** Exact source-text keys keep translations attached when CSV rows are reordered. */
export function treatmentText(text: string, lang: Lang): string {
  if (!text || lang === 'ko') return text
  const translated = words[text]?.[columns[lang]]
  if (!translated && import.meta.env.DEV) console.warn('[treatments] Missing translation:', lang, text)
  return translated ?? text
}

/** Translate display copy only; keep source provenance, prices and matching IDs intact. */
export function localizeTreatment(treatment: Treatment, lang: Lang): Treatment {
  if (!treatment.source || lang === 'ko') return treatment
  const text = (value: string) => treatmentText(value, lang)
  const original = treatment.source
  const source = {
    ...original,
    name: text(original.name),
    category: text(original.category),
    effects: text(original.effects),
    overview: text(original.overview),
    advantages: original.advantages.map(text),
    recommendedFor: original.recommendedFor.map(text),
    cautions: original.cautions.map(text),
    packages: original.packages.map((item) => ({ ...item, name: text(item.name), description: text(item.description) })),
    faqs: original.faqs.map((faq) => ({ question: text(faq.question), answer: text(faq.answer) })),
  }
  return {
    ...treatment,
    source,
    name: source.name,
    shortName: source.name,
    tag: source.category,
    summary: source.overview,
    cardSummary: text(classificationFor(treatment.id).summary),
    goodFor: source.recommendedFor,
    cautions: source.cautions,
  }
}
