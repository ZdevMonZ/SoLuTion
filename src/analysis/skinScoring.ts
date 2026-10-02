/**
 * Turns SkinMetrics into the categories the result screen shows.
 *
 * Port of `data/analysis/SkinScoring.kt`, thresholds included.
 *
 * ## What this is, and what it is not
 *
 * This is **image analysis, not dermatology**. There is no trained model here and
 * no backend behind it, so nothing here can diagnose anything. What it does do is
 * measure the frame the user actually captured — texture, evenness of tone,
 * redness, coarse lines — so the result responds to the face in front of the
 * webcam instead of replaying one scripted answer.
 *
 * The thresholds below are hand-set from test captures, not calibrated against
 * dermatologist-graded data. They are good enough to separate "smooth and even"
 * from "textured and blotchy"; they are not good enough to tell anyone what is
 * wrong with their skin, which is what the screen's own copy already says.
 *
 * LAXITY is the honest exception: a still frame carries no elasticity signal
 * at all, so that one row is derived from the stated age band and nothing else.
 * BALANCE is a lesser version of the same problem — it is measured, but the
 * dominant term in what it measures is lighting direction.
 */
import type { PhototypeReading } from './phototype'
import type { SkinMetrics } from './skinPixelAnalysis'
import {
  SKIN_CATEGORIES,
  levelFromScore,
  type AgeBand,
  type AnalysisNotice,
  type CategoryResult,
  type SkinAnalysisResult,
  type SkinCategory,
  type UserProfile,
} from './types'

/**
 * Below this, the ellipse did not contain a face-sized patch of skin and the
 * caller should fall back to the labelled sample result.
 *
 * A face framed in the guide oval fills most of it — the synthetic faces in the
 * Android test suite measure over 0.9. The bar is set well under that for beards,
 * glasses and loose framing, but high enough to reject a frame that is not a face
 * at all.
 */
export const MIN_SKIN_COVERAGE = 0.3

/** Measured, but not much to go on — worth saying so. */
const LOW_SKIN_COVERAGE = 0.45

const DARK_BRIGHTNESS = 0.2
const BRIGHT_BRIGHTNESS = 0.9
const BLURRY_SHARPNESS = 12

/**
 * Hand-set against the same test captures as every other ramp. A calm, evenly lit
 * face sits close to REDNESS_LOW_CR; the skin gate's own Cr 173 ceiling means
 * REDNESS_HIGH_CR is already close to the highest this metric can read at all.
 */
const REDNESS_LOW_CR = 148
const REDNESS_HIGH_CR = 168

/**
 * Same caveat as sideAsymmetry, doubled: never validated against graded photos,
 * and the signal it ramps is mostly lighting, not anatomy. BALANCE_LOW_RATIO is
 * small enough that ordinary shading from a single window already clears it.
 */
const BALANCE_LOW_RATIO = 0.02
const BALANCE_HIGH_RATIO = 0.14

/** Chosen so the handoff's reference result lands on its published 72. */
const COMPRESSION = 0.55

export function analyse(
  metrics: SkinMetrics,
  profile: UserProfile,
  photoUrl: string | null,
  nowMillis: number,
  phototype: PhototypeReading | null,
): SkinAnalysisResult {
  const band: AgeBand = profile.ageBand ?? 'THIRTIES'

  const scores: Record<SkinCategory, number> = {
    PORES: scoreFor(metrics.textureEnergy, 0.03, 0.115),
    PIGMENT: scoreFor(metrics.toneSpread, 4.0, 16.0),
    ACNE: scoreFor(metrics.rednessRatio, 0.01, 0.17),
    WRINKLES: scoreFor(metrics.lineEnergy, 0.02, 0.09),
    // Not measured. A photograph shows shape, never how skin springs back.
    LAXITY: laxityFromAge(band),
    REDNESS: scoreFor(metrics.overallRedness, REDNESS_LOW_CR, REDNESS_HIGH_CR),
    BALANCE: scoreFor(metrics.sideAsymmetry, BALANCE_LOW_RATIO, BALANCE_HIGH_RATIO),
  }

  const categories: CategoryResult[] = SKIN_CATEGORIES.map((category) => ({
    category,
    level: levelFromScore(scores[category]),
    score: scores[category],
  }))

  return buildResult(categories, profile, photoUrl, nowMillis, noticeFor(metrics), phototype)
}

/**
 * Shared by the measured path and the stand-in result, so both compress the SKIN
 * SCORE and measure the cohort gap the same way.
 *
 * The gap needs a band even when the user skipped the question, so it assumes the
 * middle one; `ageBand` still records that nothing was stated, and the comparison
 * line drops the cohort when it reads null.
 */
export function buildResult(
  categories: CategoryResult[],
  profile: UserProfile,
  photoUrl: string | null,
  nowMillis: number,
  notice: AnalysisNotice | null = null,
  phototype: PhototypeReading | null = null,
): SkinAnalysisResult {
  const band: AgeBand = profile.ageBand ?? 'THIRTIES'
  const overall = overallFor(categories.map((c) => c.score))

  return {
    categories,
    overallScore: overall,
    ageBand: profile.ageBand,
    gender: profile.gender,
    cohortDiff: overall - cohortAverage(band),
    notice,
    capturedPhotoUrl: photoUrl,
    phototype,
    analyzedAtMillis: nowMillis,
  }
}

/**
 * Honest caveats about the capture, surfaced under the score. The sentence for
 * each is written at render time — this layer only names which one applies.
 */
function noticeFor(metrics: SkinMetrics): AnalysisNotice | null {
  if (metrics.skinCoverage < LOW_SKIN_COVERAGE) return 'SMALL_FACE'
  if (metrics.brightness < DARK_BRIGHTNESS) return 'TOO_DARK'
  if (metrics.brightness > BRIGHT_BRIGHTNESS) return 'TOO_BRIGHT'
  if (metrics.sharpness < BLURRY_SHARPNESS) return 'BLURRY'
  return null
}

/**
 * SKIN SCORE from the row scores.
 *
 * Not a plain mean: the handoff's own reference row set — 26/52/72/78/14 here,
 * 74/48/28/22/86 in the design's own attention direction — leaves 51.6 of
 * attention, which as a plain inverse would read 48, yet the mock-up shows **72**.
 * Its scale is compressed — the number is a reassurance, not a grade.
 */
export function overallFor(scores: number[]): number {
  if (scores.length === 0) return 0
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  // `scores` now runs the healthy way up, so the compression is applied to the
  // attention left over (100 - mean). Algebraically identical to the Kotlin's
  // `100 - COMPRESSION * attentionMean`, which is why the reference row set still
  // lands on its published 72.
  return Math.min(100, Math.max(0, Math.round(100 - COMPRESSION * (100 - mean))))
}

/** Linear ramp between two anchors, expressed on the 0..100 attention scale. */
function ramp(value: number, low: number, high: number): number {
  return Math.trunc(Math.min(1, Math.max(0, (value - low) / (high - low))) * 100)
}

/**
 * One measurement, as the row's 0..100 score.
 *
 * Every sensor underneath climbs with the problem: more texture, more redness,
 * more line energy. The row reads the other way — 100 is the best this area can
 * look, 0 the worst, matching the SKIN SCORE headline — so the turn happens here,
 * once, rather than at seven call sites where one of them would eventually be
 * missed.
 *
 * One consequence worth naming: a measurement that never clears its low anchor
 * now prints **100**, where it used to print 0. The meaning has not changed — it
 * still reads "nothing above the floor was detected", which is not the same as
 * "this area is healthy" — but the number it wears is now the most reassuring one
 * on the scale instead of the least.
 */
function scoreFor(value: number, low: number, high: number): number {
  return 100 - ramp(value, low, high)
}

function laxityFromAge(band: AgeBand): number {
  // Each value is 100 minus the attention figure the Kotlin returned, so the rung
  // every age band lands on is unchanged.
  switch (band) {
    case 'TEENS':
      return 86
    case 'TWENTIES':
      return 74
    case 'THIRTIES':
      return 54
    case 'FORTIES':
      return 37
    case 'FIFTIES_PLUS':
      return 23
  }
}

function cohortAverage(band: AgeBand): number {
  switch (band) {
    case 'TEENS':
      return 78
    case 'TWENTIES':
      return 74
    case 'THIRTIES':
      return 68
    case 'FORTIES':
      return 62
    case 'FIFTIES_PLUS':
      return 56
  }
}

/**
 * The design handoff's reference result: SKIN SCORE 72, pigmentation the one row
 * at FOCUS. Port of `data/mock/MockAnalysis.kt`.
 *
 * Used when there is nothing to measure — the capture was skipped, or the frame
 * turned out to be unreadable. Those cases pass a notice so the screen says the
 * numbers are a sample rather than a reading of the user's face.
 *
 * REDNESS and BALANCE are not part of that handoff, so their 45 and 50 are plain
 * placeholders, picked to land on NORMAL and keep the reference result's SKIN
 * SCORE and focus rows exactly as the design shows them.
 */
const REFERENCE_SCORES: Record<SkinCategory, number> = {
  PORES: 26,
  LAXITY: 52,
  WRINKLES: 72,
  ACNE: 78,
  PIGMENT: 14,
  REDNESS: 55,
  BALANCE: 50,
}

export function referenceResult(
  profile: UserProfile,
  photoUrl: string | null,
  nowMillis: number,
  notice: AnalysisNotice | null,
): SkinAnalysisResult {
  const categories: CategoryResult[] = SKIN_CATEGORIES.map((category) => ({
    category,
    level: levelFromScore(REFERENCE_SCORES[category]),
    score: REFERENCE_SCORES[category],
  }))
  return buildResult(categories, profile, photoUrl, nowMillis, notice)
}
