/**
 * The one layout switch: a laptop gets the design as drawn, a phone gets the same
 * screens stacked into a single column.
 */
import { useSyncExternalStore } from 'react'

/**
 * Phone width. The design is drawn for a laptop, so below this every two-column
 * screen stacks into one, and the page gutter drops from 32px to 16px.
 */
const NARROW_QUERY = '(max-width: 760px)'

function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia(NARROW_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/**
 * True on a phone-sized viewport. Read synchronously from `matchMedia`, so the
 * first paint is already the right layout rather than the desktop one corrected.
 */
export function useNarrow(): boolean {
  return useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  )
}

/**
 * A screen's outer padding: the design's own on a laptop; on a phone the 16px
 * gutter, with the vertical breathing room cut to fit a short screen.
 */
export function screenPadding(narrow: boolean, top: number, bottom: number): string {
  return narrow
    ? `${Math.round(top * 0.5)}px 16px ${Math.round(bottom * 0.6)}px`
    : `${top}px 32px ${bottom}px`
}

/** A two-column grid's columns, which stack into one on a phone. */
export function columns(narrow: boolean, desktop: string): string {
  return narrow ? 'minmax(0,1fr)' : desktop
}
