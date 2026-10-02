/**
 * The measurement arithmetic, over a plain pixel buffer.
 *
 * A line-for-line port of `data/analysis/SkinPixelAnalysis.kt`. The only change is
 * the buffer shape: Android hands over ARGB ints, a browser canvas hands over
 * RGBA bytes, so the channel reads differ and nothing else does. Every constant,
 * every mask, every early return is the Kotlin one — this is the file the app's
 * unit tests pin, so drifting from it would mean the web reading and the phone
 * reading of the same face disagree.
 *
 * ## Where it looks
 *
 * There is no face detector here. The capture screen draws a fixed oval and asks
 * the user to fill it, so the face is assumed to be roughly centred, and
 * everything is sampled from a centred ellipse. Inside that ellipse a YCbCr
 * skin-colour test throws away hair, clothing and background, and `skinCoverage`
 * reports how much survived — that is what tells the caller whether the frame was
 * usable at all.
 *
 * Inside the ellipse the measurements do not all read the same pixels, and the
 * difference matters more than it sounds. Texture and lines run a filter over a
 * neighbourhood, so for those the skin mask is *eroded* until the filter's whole
 * window lands on skin: a pixel one step from an eyebrow still sees the eyebrow
 * through its neighbours. Redness reads one pixel at a time and needs no erosion.
 * Focus is left unmasked on purpose, because a crisp eyebrow is exactly the
 * evidence that the shot is sharp.
 */

/** Raw measurements taken from one frame. Every field is an image statistic. */
export interface SkinMetrics {
  /** Mean |Laplacian| where the whole five-pixel cross is skin, over mean luma. */
  textureEnergy: number
  /** Spread of chroma (Cb/Cr) across skin pixels. Unevenness of tone. */
  toneSpread: number
  /**
   * Share of skin pixels sitting more than a fixed step above that face's own MEAN
   * chroma — so this reads as how *patchy* the redness is, not how much there is.
   * Known-weak, and left that way on purpose: see REDNESS_DELTA below.
   */
  rednessRatio: number
  /** Coarse-scale edge energy over skin in the upper face band. Lines, not pores. */
  lineEnergy: number
  /** Mean luma of the sampled region, 0..1. */
  brightness: number
  /**
   * Variance of |Laplacian| over the whole ellipse — a focus measure.
   *
   * Note the absolute value. This is *not* the textbook variance-of-Laplacian,
   * which is E[L²] − E[L]²; taking |L| first makes it roughly a third of that.
   * Anyone importing a published blur cutoff for BLURRY_SHARPNESS would be off by
   * about 3x — the existing threshold was hand-set against what this returns.
   */
  sharpness: number
  /**
   * Share of the sampled ellipse that passed the skin-colour test, 0..1 — and
   * doubling as the "do not trust any of this" sentinel. 0 does not always mean no
   * skin was found: it is also returned when the eroded populations are starved,
   * which a *fragmented* mask can do with half the ellipse still skin.
   */
  skinCoverage: number
  /** Mean Cr over the same skin pixels — how red the face sits on average. */
  overallRedness: number
  /**
   * `|meanY(left half) − meanY(right half)| / meanY(whole)`, split at the sampling
   * ellipse's own vertical centre line.
   *
   * Not a volume measurement — a flat photo carries no depth. What this reads is
   * which half of the face is brighter, which a real volume difference *can*
   * produce, but so does window light or a camera held off-axis, and that is
   * usually the dominant term. Treat a single high reading as "worth another photo
   * from a different light", not as a finding.
   */
  sideAsymmetry: number
}

// Centred ellipse, sitting a little above the middle the way a framed face does.
// Exported because faceGateRules measures a detected face against this same oval
// and captureGeometry places the on-screen guide from it — three copies of these
// numbers would let the gate accept a face the measurement never looks at.
export const ELLIPSE_CX = 0.5
export const ELLIPSE_CY = 0.45
export const ELLIPSE_RX = 0.34
export const ELLIPSE_RY = 0.32

/**
 * The YCbCr skin test, as one definition.
 *
 * Extracted from the loop below — the expression is the Kotlin's, byte for byte —
 * so `phototype.ts` can read the same pixels this file calls skin without a second
 * copy of the thresholds drifting away from these.
 */
export function isSkinPixel(luma: number, cb: number, cr: number): boolean {
  return luma > 45 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173
}

/**
 * Redness above the face's own mean chroma that counts as inflamed.
 *
 * ## A known limitation, left in deliberately
 *
 * The baseline is the mean of the very pixels being judged, so inflamed skin is
 * inside the average it is compared against and the bar rises with coverage. Past
 * roughly half the face the bar overtakes the redness and a badly inflamed face
 * scores clean. The real fix is a *local* surround, not a different threshold.
 *
 * ## The worse defect, and the one to fix first
 *
 * The skin gate below caps Cr at 173. A pixel red enough to pass that ceiling
 * leaves the skin mask entirely, so it is dropped from this ratio's numerator
 * *and* its denominator — the measure therefore **inverts**, climbing with redness
 * up to the ceiling and then falling back to zero as inflammation worsens. Real
 * lesion pixels reach it: RGB (240,150,140) is Cr 173.8. Carried over from the
 * Android build verbatim, including this note, so the two cannot quietly differ.
 */
const REDNESS_DELTA = 8

/**
 * Fewer pixels than this and the statistics are not worth reporting. Applied to
 * the eroded populations too, not just to the skin mask: an empty population
 * measures zero, and zero is the best possible score.
 */
export const MIN_SKIN_PIXELS = 200

/** Floor for each half of sideAsymmetry's left/right split. */
const MIN_SIDE_SKIN_PIXELS = 60

const EMPTY_METRICS: SkinMetrics = {
  textureEnergy: 0,
  toneSpread: 0,
  rednessRatio: 0,
  lineEnergy: 0,
  brightness: 0,
  sharpness: 0,
  skinCoverage: 0,
  overallRedness: 0,
  sideAsymmetry: 0,
}

/**
 * @param rgba canvas pixel data, row-major, 4 bytes per pixel, w * h * 4 long.
 */
export function measure(rgba: Uint8ClampedArray, w: number, h: number): SkinMetrics {
  if (rgba.length < w * h * 4) {
    throw new Error(`pixel buffer is smaller than ${w}x${h}`)
  }

  const luma = new Float32Array(w * h)
  const skin = new Uint8Array(w * h)
  const inside = new Uint8Array(w * h)

  const cx = ELLIPSE_CX * w
  const cy = ELLIPSE_CY * h
  const rx = ELLIPSE_RX * w
  const ry = ELLIPSE_RY * h

  let ellipseCount = 0
  let skinCount = 0
  let sumY = 0
  let sumCb = 0
  let sumCr = 0
  let sumCb2 = 0
  let sumCr2 = 0
  // Split at the ellipse's own vertical centre — see SkinMetrics.sideAsymmetry for
  // why that line, not the face's actual midline, is what this compares.
  let sumYLeft = 0
  let sumYRight = 0
  let countLeft = 0
  let countRight = 0

  for (let y = 0; y < h; y++) {
    const dy = (y - cy) / ry
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const p = i * 4
      const r = rgba[p]
      const g = rgba[p + 1]
      const b = rgba[p + 2]

      const yy = 0.299 * r + 0.587 * g + 0.114 * b
      luma[i] = yy

      const dx = (x - cx) / rx
      if (dx * dx + dy * dy > 1) continue
      inside[i] = 1
      ellipseCount++

      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b

      // Standard YCbCr skin gate, plus a floor so deep shadow is not "skin".
      if (isSkinPixel(yy, cb, cr)) {
        skin[i] = 1
        skinCount++
        sumY += yy
        sumCb += cb
        sumCr += cr
        sumCb2 += cb * cb
        sumCr2 += cr * cr
        if (x < cx) {
          sumYLeft += yy
          countLeft++
        } else {
          sumYRight += yy
          countRight++
        }
      }
    }
  }

  if (ellipseCount === 0 || skinCount < MIN_SKIN_PIXELS) return { ...EMPTY_METRICS }

  const meanY = sumY / skinCount
  const meanCr = sumCr / skinCount
  const varCb = Math.max(0, sumCb2 / skinCount - (sumCb / skinCount) ** 2)
  const varCr = Math.max(0, sumCr2 / skinCount - (sumCr / skinCount) ** 2)
  const toneSpread = Math.sqrt(varCb + varCr)

  // --- texture + focus: 4-neighbour Laplacian ---
  // Two populations, deliberately. Focus is judged over the whole ellipse, where a
  // crisp eyebrow is exactly the evidence wanted. Pore texture is judged only where
  // the Laplacian's entire five-pixel cross lands on skin: an eyebrow, an eyelash
  // or a nostril rim is the strongest edge anywhere in a face photo, and sharing
  // one loop between the two meant every one of them was charged to the user's pores.
  let focusSum = 0
  let focusSqSum = 0
  let focusCount = 0
  let skinLapSum = 0
  let skinLapCount = 0
  let redCount = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      if (!inside[i]) continue
      const lap = 4 * luma[i] - luma[i - 1] - luma[i + 1] - luma[i - w] - luma[i + w]
      focusSum += Math.abs(lap)
      focusSqSum += lap * lap
      focusCount++

      if (!skin[i]) continue
      if (skin[i - 1] && skin[i + 1] && skin[i - w] && skin[i + w]) {
        skinLapSum += Math.abs(lap)
        skinLapCount++
      }

      const p = i * 4
      const cr =
        128 + 0.5 * rgba[p] - 0.418688 * rgba[p + 1] - 0.081312 * rgba[p + 2]
      if (cr - meanCr > REDNESS_DELTA) redCount++
    }
  }
  const meanAbsLap = skinLapCount === 0 ? 0 : skinLapSum / skinLapCount
  const focusMean = focusCount === 0 ? 0 : focusSum / focusCount
  const sharpness = focusCount === 0 ? 0 : focusSqSum / focusCount - focusMean * focusMean

  // --- lines: Sobel on a 2x box-downsampled luma, upper face band only ---
  const lineEnergy = upperBandLineEnergy(luma, skin, w, h, meanY)

  // Coverage can look healthy while the eroded populations are empty — see
  // MIN_SKIN_PIXELS. Report the frame as unusable rather than let a measurement
  // that never ran arrive at the result screen as a perfect score.
  if (skinLapCount < MIN_SKIN_PIXELS || lineEnergy === null) return { ...EMPTY_METRICS }

  // Below this on either side, a left/right comparison is noise rather than a
  // reading — a shadow, a turned head or a strand of hair can starve one half long
  // before it starves the whole-ellipse populations above.
  const sideAsymmetry =
    countLeft < MIN_SIDE_SKIN_PIXELS || countRight < MIN_SIDE_SKIN_PIXELS
      ? 0
      : Math.abs(sumYLeft / countLeft - sumYRight / countRight) / meanY

  return {
    textureEnergy: meanY <= 0 ? 0 : meanAbsLap / meanY,
    toneSpread,
    rednessRatio: redCount / skinCount,
    lineEnergy,
    brightness: meanY / 255,
    sharpness,
    skinCoverage: skinCount / ellipseCount,
    overallRedness: meanCr,
    sideAsymmetry,
  }
}

/**
 * Wrinkles live at a coarser scale than pores, so this halves the resolution first
 * — otherwise the measure just re-reads skin texture. Restricted to the upper half
 * of the face, where the forehead and eye area are.
 *
 * Returns null, not 0, when nothing was measured: 0 is the best possible score.
 */
function upperBandLineEnergy(
  luma: Float32Array,
  skin: Uint8Array,
  w: number,
  h: number,
  meanY: number,
): number | null {
  if (meanY <= 0) return null
  const hw = Math.floor(w / 2)
  const hh = Math.floor(h / 2)
  if (hw < 4 || hh < 4) return null

  const small = new Float32Array(hw * hh)
  const smallSkin = new Uint8Array(hw * hh)
  for (let y = 0; y < hh; y++) {
    for (let x = 0; x < hw; x++) {
      const i0 = 2 * y * w + 2 * x
      small[y * hw + x] = (luma[i0] + luma[i0 + 1] + luma[i0 + w] + luma[i0 + w + 1]) * 0.25
      // All four, not any: a half-skin block straddles a boundary, and the boundary
      // between a dark eyebrow and lit skin is the single steepest gradient in the
      // picture. Letting those blocks in put a ring of them around every brow and
      // hairline, right inside the band this measures.
      smallSkin[y * hw + x] =
        skin[i0] && skin[i0 + 1] && skin[i0 + w] && skin[i0 + w + 1] ? 1 : 0
    }
  }

  const bandTop = Math.trunc(hh * 0.18)
  const bandBottom = Math.trunc(hh * 0.52)
  let sum = 0
  let count = 0
  for (let y = Math.max(1, bandTop); y < Math.min(hh - 1, bandBottom); y++) {
    for (let x = 1; x < hw - 1; x++) {
      const i = y * hw + x
      // The whole 3x3 the Sobel reads, not just its centre. A skin pixel one step
      // from a brow still sees the brow through its neighbours, so testing only the
      // centre left exactly the ring this is trying to drop.
      if (!allSkin3x3(smallSkin, i, hw)) continue
      const gx =
        small[i - hw + 1] +
        2 * small[i + 1] +
        small[i + hw + 1] -
        small[i - hw - 1] -
        2 * small[i - 1] -
        small[i + hw - 1]
      const gy =
        small[i + hw - 1] +
        2 * small[i + hw] +
        small[i + hw + 1] -
        small[i - hw - 1] -
        2 * small[i - hw] -
        small[i - hw + 1]
      sum += Math.sqrt(gx * gx + gy * gy)
      count++
    }
  }
  return count < MIN_SKIN_PIXELS ? null : sum / count / meanY
}

/** True when every pixel a 3x3 Sobel would read at `i` is skin. */
function allSkin3x3(mask: Uint8Array, i: number, stride: number): boolean {
  return !!(
    mask[i] &&
    mask[i - 1] &&
    mask[i + 1] &&
    mask[i - stride] &&
    mask[i - stride - 1] &&
    mask[i - stride + 1] &&
    mask[i + stride] &&
    mask[i + stride - 1] &&
    mask[i + stride + 1]
  )
}
