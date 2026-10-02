/**
 * Decides whether a capture is worth measuring, given what a face detector found.
 *
 * Port of `data/analysis/FaceGateRules.kt`. Pure arithmetic for the same reason
 * the Kotlin was: this is the part with thresholds worth testing, and the detector
 * itself lives in faceLandmarker.ts.
 *
 * ## Why this is not the skin-coverage check
 *
 * MIN_SKIN_COVERAGE asks "were enough skin-coloured pixels inside the oval", which
 * a hand, a forearm, a beige wall and a face on a screen all pass. It stays as the
 * second line of defence — it catches a real face too dark or too washed out to
 * read — but it was never a test for a face.
 *
 * ## Thresholds
 *
 * Deliberately generous. A false reject sends a real user back to the viewfinder
 * with nothing to fix, which is worse than letting a marginal frame through to a
 * reading that already carries its own caveats.
 */
import { ELLIPSE_CX, ELLIPSE_CY, ELLIPSE_RX, ELLIPSE_RY } from './skinPixelAnalysis'
import type { CaptureRejection } from './types'

/**
 * One detected face, in fractions of the analysed image: 0 is the left/top edge,
 * 1 the right/bottom. Normalised on purpose — the rules must not care whether the
 * detector ran on a 520px crop or on the full sensor frame.
 */
export interface FaceBox {
  left: number
  top: number
  right: number
  bottom: number
}

export const boxWidth = (f: FaceBox) => f.right - f.left
export const boxCentreX = (f: FaceBox) => (f.left + f.right) / 2
export const boxCentreY = (f: FaceBox) => (f.top + f.bottom) / 2

/**
 * Narrowest face, as a fraction of the image width, still worth measuring.
 *
 * A face filling the capture oval is about 0.68 wide, so this only rejects from
 * around two and a half times that distance, where pores are already below the
 * resolution of the 720px decode.
 */
export const MIN_FACE_WIDTH = 0.28

/**
 * How far the face's centre may drift from the centre of the ellipse the analysis
 * samples, measured in ellipse radii: 0 is dead centre, 1 sits on the ellipse's
 * own edge. At 1 the analysis is reading more background than face.
 */
export const MAX_CENTRE_OFFSET = 1.0

/** @returns the reason to send the user back, or null to accept the capture. */
export function evaluate(faces: FaceBox[]): CaptureRejection | null {
  if (faces.length === 0) return 'NO_FACE'
  if (faces.length > 1) return 'MULTIPLE_FACES'
  const face = faces[0]

  // Size before position: a distant face is usually off-centre too, and "come
  // closer" is the more useful of the two things to be told.
  if (boxWidth(face) < MIN_FACE_WIDTH) return 'FACE_TOO_SMALL'
  if (centreOffset(face) > MAX_CENTRE_OFFSET) return 'FACE_OFF_CENTRE'
  return null
}

/**
 * Distance from the sampling ellipse's centre in radii.
 *
 * The same expression skinPixelAnalysis uses to decide which pixels are inside
 * that ellipse, reading the same constants — so the gate and the measurement can
 * never disagree about where the face is supposed to be.
 */
export function centreOffset(face: FaceBox): number {
  const dx = (boxCentreX(face) - ELLIPSE_CX) / ELLIPSE_RX
  const dy = (boxCentreY(face) - ELLIPSE_CY) / ELLIPSE_RY
  return Math.sqrt(dx * dx + dy * dy)
}
