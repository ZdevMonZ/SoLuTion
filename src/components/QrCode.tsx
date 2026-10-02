/**
 * The redemption code.
 *
 * Deliberately *not* a real QR encoder: nothing in this prototype issues a code a
 * scanner could resolve, so the module draws the design's own fixed pattern — three
 * finders, the timing rows, and a deterministic fill — and the screen around it
 * says plainly that it is a prototype. A real code would be the one thing on the
 * page a clinic could act on, and it would resolve to nothing.
 */
import { C } from '../theme'

const N = 21
const FINDERS: [number, number][] = [
  [0, 0],
  [0, 14],
  [14, 0],
]

/** Inside a finder: the 7x7 eye, ring filled except its one-module gap. */
function finderCell(row: number, col: number): boolean | null {
  for (const [fr, fc] of FINDERS) {
    const dr = row - fr
    const dc = col - fc
    if (dr >= 0 && dr < 7 && dc >= 0 && dc < 7) {
      return Math.max(Math.abs(dr - 3), Math.abs(dc - 3)) !== 2
    }
  }
  return null
}

/** The design's own LCG, seed included, so the pattern never changes between builds. */
function cells(): boolean[] {
  let seed = 20260919
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const out: boolean[] = []
  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      const finder = finderCell(row, col)
      const timing = row === 6 || col === 6
      out.push(finder !== null ? finder : timing ? (row + col) % 2 === 0 : rand() > 0.52)
    }
  }
  return out
}

const CELLS = cells()

export function QrCode({ module = 12 }: { module?: number }) {
  const side = N * module
  return (
    <div
      role="img"
      aria-label="Redemption code, for the clinic front desk"
      style={{ display: 'flex', flexWrap: 'wrap', width: side, height: side }}
    >
      {CELLS.map((dark, i) => (
        <div
          key={i}
          style={{ width: module, height: module, background: dark ? C.ink : C.surface }}
        />
      ))}
    </div>
  )
}
