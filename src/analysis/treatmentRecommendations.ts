import type { Treatment } from '../data/catalog'
import { classificationFor, concernTier } from '../data/treatmentConcerns'
import { urgencyOf, leadCategory } from './ranking'
import { rankedCategories, type SkinAnalysisResult } from './types'

/** Only reviewed concern links participate; consultation-only items remain browsable. */
export function rankTreatments(treatments: Treatment[], result: SkinAnalysisResult): Treatment[] {
  return [...treatments].sort((a, b) => {
    const targetsA = classificationFor(a.id).matchTargets
    const targetsB = classificationFor(b.id).matchTargets
    const urgency = urgencyOf(targetsB, result) - urgencyOf(targetsA, result)
    if (urgency) return urgency
    const leadA = leadCategory(targetsA, result)
    const leadB = leadCategory(targetsB, result)
    return (leadA ? concernTier(a.id, leadA) : 3) - (leadB ? concernTier(b.id, leadB) : 3)
  })
}
export function matchesLeadingConcern(id: string, result: SkinAnalysisResult | null): boolean {
  if (!result) return false
  const lead = rankedCategories(result)[0]?.category
  const rule = classificationFor(id)
  return !rule.manualOnly && !!lead && rule.matchTargets.includes(lead)
}
