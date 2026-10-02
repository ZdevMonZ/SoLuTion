/**
 * Domain model, ported from the Android app's `data/model/` package.
 *
 * Every name and every constant here is the Kotlin one. Where the Kotlin used an
 * enum with an ordinal (SeverityLevel.rank, SkinCategory declaration order) the
 * port keeps that explicit, because the ordering drives the result screen and the
 * treatment ranking.
 */

import type { FitzpatrickType, PhototypeReading } from './phototype'

/**
 * The diagnosis categories shown on the result screen.
 *
 * The first 5 are the design's own display order. REDNESS and BALANCE were added
 * afterwards and are appended rather than interleaved so the original rows keep
 * their exact positions.
 *
 * LAXITY was called ELASTICITY until the consulting dermatologist's review: a
 * photograph shows slackening, never how skin springs back, and elasticity is a
 * Cutometer reading. The row still carries no pixel measurement at all — see
 * `laxityFromAge` — so the name change is the honest half of that finding and the
 * measurement is still owed.
 */
export const SKIN_CATEGORIES = [
  'PORES',
  'LAXITY',
  'WRINKLES',
  'ACNE',
  'PIGMENT',
  'REDNESS',
  'BALANCE',
] as const
export type SkinCategory = (typeof SKIN_CATEGORIES)[number]

/**
 * 4-level scale from the design. Deliberately not clinical and not red/green:
 * a low row means "look at this first", never "something is wrong".
 */
export type SeverityLevel = 'EASE' | 'NORMAL' | 'ATTENTION' | 'FOCUS'

export const SEVERITY_RANK: Record<SeverityLevel, number> = {
  EASE: 1,
  NORMAL: 2,
  ATTENTION: 3,
  FOCUS: 4,
}

/** A caveat about the capture itself, surfaced under the score. */
export type AnalysisNotice =
  | 'SMALL_FACE'
  | 'TOO_DARK'
  | 'TOO_BRIGHT'
  | 'BLURRY'
  /** Nothing face-shaped in the frame; the reference result stood in. */
  | 'NO_FACE_FOUND'
  /** Capture was skipped entirely; the reference result stood in. */
  | 'NO_PHOTO'

/**
 * Why a capture was sent back to the viewfinder.
 *
 * Deliberately separate from AnalysisNotice. A notice is a caveat printed on a
 * reading the user is allowed to keep; a rejection means no reading was made at
 * all, and the frame is discarded.
 */
export type CaptureRejection =
  | 'NO_FACE'
  | 'MULTIPLE_FACES'
  | 'FACE_TOO_SMALL'
  | 'FACE_OFF_CENTRE'

export const AGE_BANDS = ['TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES', 'FIFTIES_PLUS'] as const
export type AgeBand = (typeof AGE_BANDS)[number]

export const GENDERS = ['FEMALE', 'MALE', 'OTHER'] as const
export type Gender = (typeof GENDERS)[number]

/** Info-form output. District is optional — the flow must work without it. */
export interface UserProfile {
  ageBand: AgeBand | null
  gender: Gender | null
  /** Which Seoul district the user is staying in; drives the clinic list and map. */
  districtKey: string | null
  /**
   * Fitzpatrick skin type as the user reported it.
   *
   * The instrument itself: Fitzpatrick is a question about how skin burns and
   * tans, which is why it is here on the profile and not in the measurement. The
   * photo's ITA° reading is kept separately on the result and compared against
   * this one — never substituted for it.
   */
  fitzpatrick: FitzpatrickType | null
}

/** One row on the result screen. `ratio` 0..1 drives the gradient bar. */
export interface CategoryResult {
  category: SkinCategory
  level: SeverityLevel
  /**
   * 0..100 — how well this area is doing. **Higher is better**, the same
   * direction as the SKIN SCORE headline, so nothing on the result screen runs
   * two ways at once.
   *
   * The measurements underneath still climb with the problem (more texture, more
   * redness, more lines); `scoreFor` in `skinScoring.ts` is the single place that
   * turns them round, so the arithmetic stays in the direction the sensors report
   * and only the presentation is flipped.
   */
  score: number
}

/**
 * The analysis payload.
 *
 * Deliberately holds no prose. Every sentence the result screen shows is derived
 * from these numbers at render time by `data/strings.ts`.
 */
export interface SkinAnalysisResult {
  categories: CategoryResult[]
  /** SKIN SCORE headline, 0..100. Higher is healthier, as the rows now are too. */
  overallScore: number
  ageBand: AgeBand | null
  gender: Gender | null
  /** overallScore minus that cohort's average. Signed. */
  cohortDiff: number
  notice: AnalysisNotice | null
  /** Object URL of the frame this reading was taken from, or null. */
  capturedPhotoUrl: string | null
  /**
   * What the photograph's own colour said about skin tone, or null when the frame
   * carried too little skin to average over. Not a row: it is a tone class, not an
   * amount of attention, so it cannot share the 0..100 scale the rows use.
   */
  phototype: PhototypeReading | null
  analyzedAtMillis: number
}

/**
 * How much of the bar is filled, 0..1 — the score itself, so a full bar is a
 * healthy row and a short one is the row to look at.
 */
export const ratioOf = (row: CategoryResult): number =>
  Math.min(1, Math.max(0, row.score / 100))

export const categoryOf = (
  result: SkinAnalysisResult,
  category: SkinCategory,
): CategoryResult | undefined => result.categories.find((c) => c.category === category)

/** Most attention needed first. Drives treatment ordering. */
export const rankedCategories = (result: SkinAnalysisResult): CategoryResult[] =>
  [...result.categories].sort(
    // Ascending on score within a level: the lower score is now the worse row.
    (a, b) => SEVERITY_RANK[b.level] - SEVERITY_RANK[a.level] || a.score - b.score,
  )

/** Categories at ATTENTION or worse, most urgent first. Drives the headline. */
export const focusCategories = (result: SkinAnalysisResult): SkinCategory[] =>
  result.categories
    .filter((c) => SEVERITY_RANK[c.level] >= SEVERITY_RANK.ATTENTION)
    .sort((a, b) => a.score - b.score)
    .map((c) => c.category)

/**
 * Port of `AnalysisDtoMapper.levelFromScore` — the single place a 0..100 row score
 * becomes one of the four rungs.
 *
 * The cutoffs are the Kotlin's, mirrored: the port graded an attention score
 * (<35 / <60 / <80), and the row now runs the other way, so each boundary is
 * `100 - x` and the comparisons turn round with it. Every rung therefore still
 * covers exactly the measurements it covered before.
 */
export const levelFromScore = (score: number): SeverityLevel => {
  if (score > 65) return 'EASE'
  if (score > 40) return 'NORMAL'
  if (score > 20) return 'ATTENTION'
  return 'FOCUS'
}
