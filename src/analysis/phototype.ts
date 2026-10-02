/**
 * Skin phototype, measured from the photograph.
 *
 * The consulting dermatologist's list named five clinical instruments. This is
 * the only one a 720px uncontrolled selfie can carry honestly, and it is carried
 * here rather than inside `skinPixelAnalysis` on purpose: that file is a
 * line-for-line port of the Android `SkinPixelAnalysis.kt`, and anything added to
 * it makes the web reading and the phone reading of the same face disagree. This
 * module reads the same ellipse through the same skin gate and returns its own
 * answer alongside, so the ported arithmetic stays untouched.
 *
 * ## What is actually computed, and what it is not
 *
 * **ITA°** — the Individual Typology Angle, `arctan((L* - 50) / b*)` in CIE L*a*b*,
 * the standard instrument for reading constitutive skin colour off an image. Its
 * class boundaries (Chardon; Del Bino) are the six steps below, and they line up
 * with Fitzpatrick I-VI closely enough that the literature routinely reports them
 * against each other.
 *
 * They are not the same thing, and the UI must not pretend they are:
 *
 * - **Fitzpatrick is a questionnaire**, not a measurement. It asks how the person
 *   *burns and tans*, which no camera can see. The app has a form screen, so the
 *   real instrument is available as a next step — six questions — and that is the
 *   only way to print the word "Fitzpatrick" without claiming something untrue.
 * - **ITA° reads the skin as lit**, not as pigmented, and the size of that error
 *   was measured rather than assumed. Sweeping one synthetic mid tone across a
 *   plausible indoor exposure range — the app's own TOO_DARK..TOO_BRIGHT window,
 *   nothing extreme — moved the answer across the entire scale:
 *
 *   ```
 *   rgb(90,72,63)    ITA -65.0  VI        rgb(200,160,140)  ITA  49.8  II
 *   rgb(120,96,84)   ITA -34.5  VI        rgb(240,192,168)  ITA  59.2  I
 *   rgb(160,128,112) ITA  24.7  IV        rgb(255,216,189)  ITA  64.9  I
 *   ```
 *
 *   Same skin, six classes, no caveat fired. Noise and a window-shaped shading
 *   gradient move it by under one degree, so exposure is the whole error term.
 *   `lightingUsable` only rules out the two extremes; it cannot rescue the middle.
 *   **This is why the photo reading is never the verdict on its own** — the result
 *   screen shows it beside the self-reported type, which is the instrument, and
 *   says so when the two disagree.
 * - **Tone is not pigmentation.** Phototype says nothing about melasma, sun spots
 *   or post-inflammatory marks, which is what the PIGMENT row is for.
 */
import {
  ELLIPSE_CX,
  ELLIPSE_CY,
  ELLIPSE_RX,
  ELLIPSE_RY,
  MIN_SKIN_PIXELS,
  isSkinPixel,
} from './skinPixelAnalysis'

/**
 * The six ITA° classes, lightest first, each with the Fitzpatrick type it is
 * usually reported against.
 *
 * `above` is the ITA° the class starts at; the lightest class has no ceiling and
 * the darkest no floor.
 */
export const PHOTOTYPES = [
  { type: 'I', name: 'Very light', above: 55 },
  { type: 'II', name: 'Light', above: 41 },
  { type: 'III', name: 'Intermediate', above: 28 },
  { type: 'IV', name: 'Tan', above: 10 },
  { type: 'V', name: 'Brown', above: -30 },
  { type: 'VI', name: 'Dark', above: -Infinity },
] as const

export type Phototype = (typeof PHOTOTYPES)[number]

/** Just the roman numeral — what the user reports about themselves. */
export type FitzpatrickType = Phototype['type']

/** What one frame said about skin tone. */
export interface PhototypeReading {
  /** Individual Typology Angle, degrees. Higher is lighter. */
  itaDegrees: number
  /** Mean CIE L* over the skin mask, 0..100. */
  lightness: number
  /** Mean CIE b* over the skin mask. Positive is yellow. */
  yellowness: number
  phototype: Phototype
  /**
   * False when the frame's exposure sits where ITA° stops meaning anything —
   * the same cutoffs the result screen's TOO_DARK / TOO_BRIGHT caveats use, so a
   * frame that earns one of those warnings is also the frame whose tone reading
   * is withheld.
   */
  lightingUsable: boolean
  /** Mean luma over the skin mask, 0..1 — what the class is most sensitive to. */
  brightness: number
  /** How many pixels the class was averaged over. */
  skinPixels: number
}

/** Matches `noticeFor`'s brightness caveats — see `lightingUsable`. */
const DARK_BRIGHTNESS = 0.2
const BRIGHT_BRIGHTNESS = 0.9

/** The D65 white point the L*a*b* conversion normalises against. X is unused — see below. */
const WHITE_Y = 1.0
const WHITE_Z = 1.08883

/** sRGB companding, per channel byte. Built once — it is the expensive half. */
const LINEAR = new Float32Array(256)
for (let i = 0; i < 256; i++) {
  const c = i / 255
  LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** The CIE L*a*b* nonlinearity, with its linear tail for near-black. */
function pivot(t: number): number {
  return t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29
}

export function classify(itaDegrees: number): Phototype {
  // PHOTOTYPES is ordered lightest first, so the first floor cleared is the class.
  return PHOTOTYPES.find((p) => itaDegrees > p.above) ?? PHOTOTYPES[PHOTOTYPES.length - 1]
}

/**
 * Mean ITA° over the sampled ellipse's skin pixels.
 *
 * Averaged as L* and b* and converted once, rather than converting per pixel and
 * averaging the angles: ITA° is an arctangent, so the mean of the angles is not
 * the angle of the mean, and every published boundary is stated against the
 * latter.
 *
 * @returns null when too few skin pixels survived to average over — the same
 *   floor the rest of the measurement uses, so a frame that produces no reading
 *   here produced no reading there either.
 */
export function measurePhototype(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
): PhototypeReading | null {
  if (rgba.length < w * h * 4) {
    throw new Error(`pixel buffer is smaller than ${w}x${h}`)
  }

  const cx = ELLIPSE_CX * w
  const cy = ELLIPSE_CY * h
  const rx = ELLIPSE_RX * w
  const ry = ELLIPSE_RY * h

  let count = 0
  let sumL = 0
  let sumB = 0
  let sumY = 0

  for (let y = 0; y < h; y++) {
    const dy = (y - cy) / ry
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / rx
      if (dx * dx + dy * dy > 1) continue

      const p = (y * w + x) * 4
      const r = rgba[p]
      const g = rgba[p + 1]
      const b = rgba[p + 2]

      const yy = 0.299 * r + 0.587 * g + 0.114 * b
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
      if (!isSkinPixel(yy, cb, cr)) continue

      const lr = LINEAR[r]
      const lg = LINEAR[g]
      const lb = LINEAR[b]
      // No X term: ITA° needs L* and b* only, and a* would cost a third matrix row
      // and a third cube root on every pixel of every frame.
      const fy = pivot((0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb) / WHITE_Y)
      const fz = pivot((0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb) / WHITE_Z)

      sumL += 116 * fy - 16
      sumB += 200 * (fy - fz)
      sumY += yy
      count++
    }
  }

  if (count < MIN_SKIN_PIXELS) return null

  const lightness = sumL / count
  const yellowness = sumB / count
  // atan2 rather than atan: b* is positive for every real skin tone, where the two
  // agree, but a white-balance failure can drive it negative and atan would then
  // fold a blue cast onto the light end of the scale instead of off the scale.
  const itaDegrees = (Math.atan2(lightness - 50, yellowness) * 180) / Math.PI
  const brightness = sumY / count / 255

  return {
    itaDegrees,
    lightness,
    yellowness,
    phototype: classify(itaDegrees),
    lightingUsable: brightness > DARK_BRIGHTNESS && brightness < BRIGHT_BRIGHTNESS,
    brightness,
    skinPixels: count,
  }
}
