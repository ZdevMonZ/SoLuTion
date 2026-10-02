/**
 * The Fitzpatrick question, as the instrument actually asks it.
 *
 * Fitzpatrick is a *questionnaire*, not an image measurement: it classifies skin
 * by how it reacts to sun — how readily it burns and how readily it tans. That is
 * information no camera can recover, which is why every attempt to read a
 * Fitzpatrick type off a photograph is really reading something else (see
 * `analysis/phototype.ts`, which reads ITA° and says so).
 *
 * The six rows below are the classification table itself: each type is defined by
 * its burn/tan pair, so asking the pair once is the whole instrument. Clinical use
 * usually spreads the same information over several scored questions to guard
 * against self-report bias; this is the short form, which is honest for a
 * prototype as long as nothing downstream treats the answer as a diagnosis.
 */
import type { FitzpatrickType } from '../analysis/phototype'

export interface SunReaction {
  type: FitzpatrickType
  /** What happens with an hour of midday sun, unprotected. */
  burn: string
  /** What is left a week later. */
  tan: string
}

export const SUN_REACTIONS: SunReaction[] = [
  { type: 'I', burn: 'Always burns, painfully', tan: 'Never tans' },
  { type: 'II', burn: 'Usually burns', tan: 'Tans a little, with difficulty' },
  { type: 'III', burn: 'Burns mildly at first', tan: 'Tans gradually and evenly' },
  { type: 'IV', burn: 'Rarely burns', tan: 'Tans easily' },
  { type: 'V', burn: 'Very rarely burns', tan: 'Tans deeply and quickly' },
  { type: 'VI', burn: 'Never burns', tan: 'Deeply pigmented already' },
]

export const sunReactionFor = (type: FitzpatrickType): SunReaction =>
  SUN_REACTIONS.find((r) => r.type === type) ?? SUN_REACTIONS[2]
