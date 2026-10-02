/**
 * The blink state machine, as a pure transition function.
 *
 * Port of `data/analysis/BlinkRules.kt`, thresholds unchanged.
 *
 * ## Why a blink
 *
 * The face gate answers "is this a face"; a detector answers that identically for
 * a face and for a photograph of one, because a still frame carries no evidence of
 * life — a printed photocard passed the gate on a real device. The cheap signal
 * that a single frame cannot fake is *change over time*, and the cheapest change
 * to ask for is a blink.
 *
 * ## What it stops, and what it does not
 *
 * Stops a printed photo, a photocard, a poster, a face on a static screen — the
 * realistic ways junk reaches the analysis. Does **not** stop a video of someone
 * blinking. Defeating that needs a commercial liveness SDK, most of which upload
 * the frames, which would break this app's promise that the image stays in the
 * browser. The threat here is bad data rather than fraud, so that is the right
 * place to stop.
 */

/** How far through a blink the viewfinder has got. */
export type LivenessState =
  /** Nothing to watch, or the face has not shown open eyes yet. */
  | 'NO_FACE'
  /** A face with both eyes open — the state a held-up photograph never leaves. */
  | 'EYES_OPEN'
  /** Eyes have closed since being open. Half a blink. */
  | 'EYES_CLOSED'
  /** Open, closed, open. Someone is actually there. */
  | 'BLINKED'

/**
 * Both eyes must read above this to count as open.
 *
 * Generous in the open direction and strict in the closed direction, because the
 * cost of the two errors is not symmetric: a missed blink asks the user to blink
 * again, while a spurious one would let a photograph through.
 */
export const OPEN_ABOVE = 0.65

/** Both eyes must read below this to count as closed. */
export const CLOSED_BELOW = 0.3

/**
 * Advances the machine by one analysed frame in which a face was found.
 *
 * @param leftOpen probability that the left eye is open, or null when the detector
 *   declined to classify this frame — a head turned too far, mostly.
 * @param rightOpen the same for the right eye.
 */
export function next(
  state: LivenessState,
  leftOpen: number | null,
  rightOpen: number | null,
): LivenessState {
  // A frame the classifier said nothing about is not evidence either way. Treating
  // it as "eyes closed" would let a slow head-turn read as a blink.
  const eyes = [leftOpen, rightOpen].filter((v): v is number => v !== null)
  if (eyes.length === 0) return state

  const open = eyes.every((v) => v > OPEN_ABOVE)
  const closed = eyes.every((v) => v < CLOSED_BELOW)

  // Both eyes, not one: a single eye's probability wanders enough on its own that
  // half the "blinks" would be noise.
  if (state === 'EYES_OPEN' && closed) return 'EYES_CLOSED'
  if (state === 'EYES_CLOSED' && open) return 'BLINKED'
  if (state === 'NO_FACE' && open) return 'EYES_OPEN'
  return state
}

/**
 * Resets when the face leaves the frame.
 *
 * Unconditional, BLINKED included: half a blink from one face and half from
 * another is not a blink, and a photograph swapped in after a live one must not
 * inherit its result.
 */
export const faceLost = (): LivenessState => 'NO_FACE'
