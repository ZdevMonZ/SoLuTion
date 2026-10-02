/**
 * Turning what is on screen into the image the analysis reads.
 *
 * This file is the web replacement for `PhotoDecoder.kt` + `PhotoSkinAnalyzer.kt`,
 * and it carries one piece of geometry the phone never needed.
 *
 * ## Why there is a crop at all
 *
 * The measurement samples a fixed ellipse — centre (0.50, 0.45), radii 0.34 and
 * 0.32 of the image — because the phone's capture screen drew an oval and asked
 * the user to fill it. A phone photo is portrait, so that ellipse lands on a face.
 * A laptop webcam hands over 16:9 landscape, where the same fractions would spread
 * the ellipse across both shoulders and half the room, and every measurement would
 * be taken over wallpaper.
 *
 * So the frame is cropped to the rectangle the guide oval implies, and the
 * measurement reads that crop. The crop is *derived from* the oval rather than
 * declared next to it: cropWidth = ovalWidth / (2 · ELLIPSE_RX) and the oval's
 * centre is placed at ELLIPSE_CY down the crop. Move the oval in the viewfinder
 * and the sampled region follows it exactly, which is the same discipline the
 * Kotlin used when it made the gate read the measurement's own constants.
 */
import { measurePhototype } from './phototype'
import type { PhototypeReading } from './phototype'
import { ELLIPSE_CX, ELLIPSE_CY, ELLIPSE_RX, ELLIPSE_RY, measure } from './skinPixelAnalysis'
import type { SkinMetrics } from './skinPixelAnalysis'
import type { FaceBox } from './faceGateRules'

/** The viewfinder's shape in the design (`aspect-ratio:16/10`). */
export const PREVIEW_ASPECT = 16 / 10

/**
 * The dashed guide oval, as fractions of the viewfinder box. The design draws it
 * 250 x 326 inside a 936 x 585 well; these are those numbers and nothing else, so
 * the on-screen oval and the sampled crop are one definition.
 */
export const GUIDE_OVAL_W_FRAC = 250 / 936
export const GUIDE_OVAL_H_FRAC = 326 / 585

/** The sampled crop, as fractions of the *visible* part of the video frame. */
const CROP_W_FRAC = GUIDE_OVAL_W_FRAC / (2 * ELLIPSE_RX)
const CROP_H_FRAC = GUIDE_OVAL_H_FRAC / (2 * ELLIPSE_RY)

/** Long edge to decode down to. Small enough to be fast, large enough to keep skin texture. */
const TARGET_EDGE = 720

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Where the analysis looks inside a video frame of `videoW` x `videoH`.
 *
 * Mirrors what the browser does to fit the frame into the viewfinder
 * (`object-fit: cover`): the frame is centre-cropped to the box's aspect first,
 * and the guide oval lives inside what survives.
 */
export function cropRectFor(videoW: number, videoH: number): CropRect {
  const videoAspect = videoW / videoH
  const visW = videoAspect > PREVIEW_ASPECT ? videoH * PREVIEW_ASPECT : videoW
  const visH = videoAspect > PREVIEW_ASPECT ? videoH : videoW / PREVIEW_ASPECT
  const offsetX = (videoW - visW) / 2
  const offsetY = (videoH - visH) / 2

  const width = CROP_W_FRAC * visW
  const height = CROP_H_FRAC * visH
  // The oval sits at the centre of the well, and at ELLIPSE_CX / ELLIPSE_CY of the
  // crop — which is what puts the crop slightly lower than the oval's own middle.
  return {
    x: offsetX + visW / 2 - ELLIPSE_CX * width,
    y: offsetY + visH / 2 - ELLIPSE_CY * height,
    width,
    height,
  }
}

/**
 * Converts a detector box given in fractions of the whole frame into fractions of
 * the sampled crop, which is the coordinate space `faceGateRules` thinks in.
 */
export function regionMapper(
  videoW: number,
  videoH: number,
): (box: FaceBox) => FaceBox {
  const crop = cropRectFor(videoW, videoH)
  return (box) => ({
    left: (box.left * videoW - crop.x) / crop.width,
    right: (box.right * videoW - crop.x) / crop.width,
    top: (box.top * videoH - crop.y) / crop.height,
    bottom: (box.bottom * videoH - crop.y) / crop.height,
  })
}

/** Scale that brings the long edge down to TARGET_EDGE, never up. */
function downscale(width: number, height: number): number {
  return Math.min(1, TARGET_EDGE / Math.max(width, height))
}

/**
 * Grabs the current frame and returns the cropped, downscaled canvas the gate and
 * the measurement both read.
 *
 * Deliberately *not* mirrored. The preview is flipped in CSS because a mirror is
 * what people expect to see of themselves, but the analysis reads the true frame,
 * as the phone's saved JPEG did.
 */
export function grabFrame(video: HTMLVideoElement): HTMLCanvasElement {
  const vw = video.videoWidth
  const vh = video.videoHeight
  const crop = cropRectFor(vw, vh)
  const scale = downscale(crop.width, crop.height)

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(crop.width * scale))
  canvas.height = Math.max(1, Math.round(crop.height * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('2D canvas context is unavailable')
  ctx.drawImage(
    video,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  return canvas
}

/**
 * An uploaded photo, decoded the way `PhotoDecoder.upright` decoded a phone one:
 * whole image, long edge down to 720, no crop.
 *
 * No crop, because an uploaded portrait was already framed by whoever took it —
 * there is no guide oval to line it up against, so the centred ellipse falls on
 * the photo itself exactly as it did on Android.
 */
export function canvasFromImage(image: HTMLImageElement): HTMLCanvasElement {
  const scale = downscale(image.naturalWidth, image.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('2D canvas context is unavailable')
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas
}

/**
 * Hands a canvas's pixels to both readings in one pass over the buffer.
 *
 * Two readings rather than one because they answer different questions and are
 * held to different standards: `metrics` is the ported Android arithmetic, and
 * `phototype` is the web-only tone class, kept out of that port so the two
 * platforms cannot quietly disagree about a face.
 */
export function measureCanvas(
  canvas: HTMLCanvasElement,
): { metrics: SkinMetrics | null; phototype: PhototypeReading | null } {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { metrics: null, phototype: null }
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return { metrics: measure(data, width, height), phototype: measurePhototype(data, width, height) }
}
