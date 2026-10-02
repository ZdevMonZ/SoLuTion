/**
 * The browser half of the face work — everything the Android build put in
 * `FaceGate.kt` and `LivenessAnalyzer.kt`, which were ML Kit and Android-only.
 *
 * ML Kit does not exist on the web, so the detector underneath is MediaPipe's
 * Face Landmarker, running fully in the page: the model file and the wasm runtime
 * are served from this site's own `public/`, so no frame and no request ever
 * leaves the machine. Two things are read from it, and they are exactly the two
 * things the Kotlin read from ML Kit:
 *
 * - **a bounding box**, for `faceGateRules` — taken from the extremes of the 478
 *   landmarks, which span the same face oval ML Kit's box does (brow line to chin,
 *   cheek edge to cheek edge). Close enough that MIN_FACE_WIDTH, set generously at
 *   0.28, means the same thing on both platforms.
 * - **per-eye open probabilities**, for `blinkRules` — MediaPipe reports
 *   `eyeBlinkLeft` / `eyeBlinkRight` blendshapes, which run the other way round
 *   (0 wide open, 1 shut), so they are inverted here into the "probability the eye
 *   is open" that ML Kit reported and that BlinkRules is written against.
 *
 * ## Two instances, on purpose
 *
 * A Tasks-Vision landmarker is locked to one running mode. The viewfinder needs
 * VIDEO (timestamped, tracking across frames) and the shutter needs IMAGE (one
 * still, no tracking), and flipping the mode on a live instance costs a reload of
 * the graph mid-capture. They share one downloaded model file, so the second
 * instance costs memory and not traffic.
 *
 * ## Failing open
 *
 * `inspect` returns null — the same answer as an accepted capture — for a detector
 * that will not start, a detection that outruns DETECTION_TIMEOUT_MS, or any
 * exception at all. A gate exists to protect the reading from a bad frame, and
 * taking a reading is the only thing this site does, so an infrastructure failure
 * on our side must never be able to lock a user out of it. When the gate cannot
 * judge, MIN_SKIN_COVERAGE is still behind it and the reading carries its own
 * caveats.
 */
import type { FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision'
import { evaluate, type FaceBox } from './faceGateRules'
import type { CaptureRejection } from './types'

/**
 * How long detection may take before the capture is waved through. Far above the
 * tens of milliseconds a warm detection costs; it is a deadlock guard, not a
 * performance budget.
 */
const DETECTION_TIMEOUT_MS = 5_000

/**
 * More than one so MULTIPLE_FACES can actually fire. A detector capped at one face
 * would report a crowd as a single subject and the gate would never see the second.
 */
const MAX_FACES = 3

const base = import.meta.env.BASE_URL
const WASM_PATH = `${base}mediapipe`
const MODEL_PATH = `${base}models/face_landmarker.task`

let videoLandmarker: Promise<FaceLandmarker> | null = null
let imageLandmarker: Promise<FaceLandmarker> | null = null

async function create(runningMode: 'VIDEO' | 'IMAGE'): Promise<FaceLandmarker> {
  // Imported here rather than at the top of the file: Tasks-Vision is half a
  // megabyte, and only the capture screen ever needs it. A static import would put
  // it in the bundle the landing page waits for.
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH)
  const options = {
    baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' as const },
    runningMode,
    numFaces: MAX_FACES,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false,
  }
  try {
    return await FaceLandmarker.createFromOptions(fileset, options)
  } catch (error) {
    // Some laptops (old integrated GPUs, hardware acceleration switched off in the
    // browser) have no usable WebGL context. CPU is slower but present everywhere,
    // and a slower blink check beats a viewfinder that never arms its shutter.
    console.warn('[faceDetector] GPU delegate unavailable, falling back to CPU', error)
    return FaceLandmarker.createFromOptions(fileset, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: 'CPU' as const },
    })
  }
}

/** Warms the viewfinder detector. Safe to call repeatedly — one instance is kept. */
export function loadVideoDetector(): Promise<FaceLandmarker> {
  videoLandmarker ??= create('VIDEO')
  return videoLandmarker
}

function loadImageDetector(): Promise<FaceLandmarker> {
  imageLandmarker ??= create('IMAGE')
  return imageLandmarker
}

/** What one analysed preview frame told us. */
export interface FrameReading {
  /** The largest face in the frame, in fractions of the *analysed region*. */
  face: FaceBox | null
  /** Probability the subject's left eye is open, or null if not classified. */
  leftEyeOpen: number | null
  rightEyeOpen: number | null
}

/**
 * Landmark extremes as a box, in fractions of the image the detector was handed.
 *
 * MediaPipe reports landmarks normalised to that image already, so this is a min /
 * max and nothing else.
 */
function boxOf(landmarks: { x: number; y: number }[]): FaceBox {
  let left = 1
  let right = 0
  let top = 1
  let bottom = 0
  for (const p of landmarks) {
    if (p.x < left) left = p.x
    if (p.x > right) right = p.x
    if (p.y < top) top = p.y
    if (p.y > bottom) bottom = p.y
  }
  return { left, top, right, bottom }
}

const area = (b: FaceBox) => (b.right - b.left) * (b.bottom - b.top)

function blendshape(result: FaceLandmarkerResult, index: number, name: string): number | null {
  const shapes = result.faceBlendshapes?.[index]?.categories
  if (!shapes) return null
  const hit = shapes.find((c) => c.categoryName === name)
  return hit ? hit.score : null
}

/**
 * Maps a detector result onto the region the analysis actually reads.
 *
 * @param toRegion converts a point given in fractions of the *whole frame* into
 *   fractions of the sampled crop. The gate has to speak about the same rectangle
 *   the measurement does, or FACE_OFF_CENTRE means two different things.
 */
function readFrame(
  result: FaceLandmarkerResult,
  toRegion: (box: FaceBox) => FaceBox,
): FrameReading {
  if (!result.faceLandmarks?.length) {
    return { face: null, leftEyeOpen: null, rightEyeOpen: null }
  }

  // The largest box, not the first: a bystander wandering through the background
  // must not get a say in whether the subject blinked.
  let index = 0
  let best = -1
  const boxes = result.faceLandmarks.map(boxOf)
  boxes.forEach((box, i) => {
    const size = area(box)
    if (size > best) {
      best = size
      index = i
    }
  })

  const blinkLeft = blendshape(result, index, 'eyeBlinkLeft')
  const blinkRight = blendshape(result, index, 'eyeBlinkRight')

  return {
    face: toRegion(boxes[index]),
    // MediaPipe reports how *shut* the eye is; BlinkRules is written against how
    // open it is, as ML Kit reported. One subtraction is the whole adaptation.
    leftEyeOpen: blinkLeft === null ? null : 1 - blinkLeft,
    rightEyeOpen: blinkRight === null ? null : 1 - blinkRight,
  }
}

/**
 * One preview frame, for the blink machine.
 *
 * Never throws: a detector that will not start, a frame it refuses, an exception
 * from anywhere is logged and the caller is told nothing was seen. If detection
 * never recovers the machine simply stays where it is and the user meets the
 * viewfinder's "still no blink" prompt, which is a poor experience but a
 * recoverable one.
 */
export async function readVideoFrame(
  video: HTMLVideoElement,
  timestampMs: number,
  toRegion: (box: FaceBox) => FaceBox,
): Promise<FrameReading> {
  try {
    const detector = await loadVideoDetector()
    const result = detector.detectForVideo(video, timestampMs)
    return readFrame(result, toRegion)
  } catch (error) {
    console.warn('[faceDetector] preview frame skipped', error)
    return { face: null, leftEyeOpen: null, rightEyeOpen: null }
  }
}

/**
 * The shutter-time gate. Runs on the *cropped* canvas the measurement will read,
 * so the gate and the measurement can only ever be talking about the same pixels.
 *
 * @returns the reason to send the user back, or null to accept the capture.
 */
export async function inspect(image: HTMLCanvasElement): Promise<CaptureRejection | null> {
  if (image.width <= 0 || image.height <= 0) {
    // A zero-sized canvas would normalise every box to Infinity, and the user would
    // be sent back for what is really our arithmetic.
    console.warn('[faceDetector] empty canvas, skipping the face check')
    return null
  }

  try {
    const detector = await withTimeout(loadImageDetector(), DETECTION_TIMEOUT_MS)
    // No result means detection ran out of time, which is not a verdict.
    if (!detector) return null
    const result = detector.detect(image)
    const boxes = (result.faceLandmarks ?? []).map(boxOf)
    return evaluate(boxes)
  } catch (error) {
    console.warn('[faceDetector] face check failed, letting the capture through', error)
    return null
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}
