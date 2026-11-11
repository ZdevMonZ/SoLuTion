import research from './treatmentClassification.json'
import { SKIN_CATEGORIES, type SkinCategory } from '../analysis/types'

export const TREATMENT_CONCERNS = ['PORES', 'ACNE', 'SCARS', 'PIGMENT', 'WRINKLES', 'LAXITY', 'HYDRATION', 'CONTOUR', 'REDNESS', 'BALANCE', 'CONSULT'] as const
export type TreatmentConcern = (typeof TREATMENT_CONCERNS)[number]
export type ConcernFilter = 'all' | TreatmentConcern
/** Visible on mobile and desktop; retain the full taxonomy for treatment metadata. */
export const TREATMENT_BROWSE_CATEGORIES = SKIN_CATEGORIES.filter((category) => category !== 'BALANCE')
export type BrowseFilter = 'all' | (typeof TREATMENT_BROWSE_CATEGORIES)[number]
export interface TreatmentClassification {
  primary: TreatmentConcern[]
  secondary: TreatmentConcern[]
  conditional: TreatmentConcern[]
  matchTargets: SkinCategory[]
  summary: string
  note: string
  sourceIds: string[]
  manualOnly: boolean
}
export const CLASSIFICATION_REVIEWED_AT = research.reviewedAt
export const CLASSIFICATION_SOURCES: Record<string, { title: string; url: string; kind: string }> = research.sources
const rules = research.treatments as Record<string, TreatmentClassification>
const fallback: TreatmentClassification = {
  primary: ['CONSULT'], secondary: [], conditional: [], matchTargets: [],
  summary: '', note: '', sourceIds: [], manualOnly: true,
}
export const classificationFor = (id: string): TreatmentClassification => rules[id] ?? fallback
export const concernTier = (id: string, concern: TreatmentConcern): number => {
  const rule = classificationFor(id)
  if (rule.primary.includes(concern)) return 0
  if (rule.secondary.includes(concern)) return 1
  if (rule.conditional.includes(concern)) return 2
  return 3
}
/** Primary uses first, related uses second, conditional uses last; ties retain ranking. */
export function filterTreatments<T extends { id: string }>(list: T[], filter: ConcernFilter): T[] {
  if (filter === 'all') return list
  return list.filter((t) => concernTier(t.id, filter) < 3)
    .sort((a, b) => concernTier(a.id, filter) - concernTier(b.id, filter))
}
