/**
 * Why a treatment sits where it sits in the matched list.
 *
 * Port of `data/model/Ranking.kt`. It exists because the list used to make the
 * same claim in three places that could disagree: the order came from the reading,
 * the highlight came from the position, and the words "TOP MATCH · Pigmentation"
 * came from a phrase typed into the catalogue. Any reading whose worst area was
 * not pigmentation put the badge on one card and the border on another. Ordering
 * and labelling now read the same two functions, so they cannot drift apart again.
 */
import {
  SEVERITY_RANK,
  categoryOf,
  type SkinAnalysisResult,
  type SkinCategory,
} from './types'

/** Wide enough that a level always beats a score — levels run 1..4, scores 0..100. */
const URGENCY_LEVEL_WEIGHT = 1000

/**
 * How loudly one area is asking to be dealt with: severity first, score as the
 * tie-break within a level. A category the reading does not cover returns null
 * rather than a zero, so "not measured" never outranks "measured and fine".
 *
 * The score is subtracted from 100 because a row score now runs the healthy way
 * up, while urgency has to run the other way for `Math.max` below to pick the
 * area that needs the most help.
 */
function urgency(category: SkinCategory, result: SkinAnalysisResult): number | null {
  const row = categoryOf(result, category)
  return row ? SEVERITY_RANK[row.level] * URGENCY_LEVEL_WEIGHT + (100 - row.score) : null
}

/** A treatment is as urgent as the most urgent area it treats. */
export function urgencyOf(targets: SkinCategory[], result: SkinAnalysisResult): number {
  const values = targets
    .map((t) => urgency(t, result))
    .filter((v): v is number => v !== null)
  return values.length === 0 ? 0 : Math.max(...values)
}

/**
 * The single area that earned this treatment its place — the one urgencyOf
 * measured. It is what the card's chip names, so the chip always answers the
 * question the position raises.
 *
 * With no reading there is no earning and no claim to make: the treatment's own
 * first area stands in, and the caller shows no rank.
 */
export function leadCategory(
  targets: SkinCategory[],
  result: SkinAnalysisResult | null,
): SkinCategory | undefined {
  if (targets.length === 0) return undefined
  if (!result) return targets[0]
  let best = targets[0]
  let bestValue = urgency(best, result) ?? -1
  for (const target of targets.slice(1)) {
    const value = urgency(target, result) ?? -1
    if (value > bestValue) {
      best = target
      bestValue = value
    }
  }
  return best
}
