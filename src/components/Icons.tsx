/**
 * The line-icon set, transcribed path-for-path from the design's `PATHS`,
 * `METRIC_PATHS` and `DISTRICT_PATHS` tables.
 *
 * One stroke weight family, one 24-unit box, `currentColor` throughout — so an
 * icon takes the colour of the plate it sits on and nothing here needs a variant
 * per surface.
 */
import type { SkinCategory } from '../analysis/types'

export const PATHS = {
  arrow: 'M4 12h15M13 6l6 6-6 6',
  globe:
    'M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6M3.4 12h17.2M12 3.2c2.3 2.3 3.5 5.3 3.5 8.8s-1.2 6.5-3.5 8.8c-2.3-2.3-3.5-5.3-3.5-8.8S9.7 5.5 12 3.2',
  camera:
    'M3.5 8.8a2 2 0 0 1 2-2h1.9l1.3-2.1h6.6l1.3 2.1h1.9a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V8.8zM12 16.4a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  cameraOff:
    'M3 3l18 18M8.6 6.7l.9-1.4h6l1.3 2.1h1.7a2 2 0 0 1 2 2v7.1M18.4 20H5.5a2 2 0 0 1-2-2V8.8a2 2 0 0 1 2-2M9.6 10.2a3.5 3.5 0 0 0 4.9 4.9',
  retake: 'M20.5 12a8.5 8.5 0 1 1-2.6-6.1M20.5 4.2v4.6h-4.6',
  light:
    'M12 3v2.2M4.9 6.1l1.6 1.6M2.6 13.5h2.2M19.2 13.5h2.2M17.5 6.1l-1.6 1.6M9 19.4h6M9.8 16.6a4.6 4.6 0 1 1 4.4 0v1.3h-4.4v-1.3z',
  download: 'M12 4v10M8 10.4l4 3.9 4-3.9M4.5 19.5h15',
  check: 'M4.5 12.4l4.8 4.8L19.5 7',
  verified:
    'M12 3.2l2.4 1.8 3-.2 1 2.8 2.4 1.8-1 2.9 1 2.9-2.4 1.8-1 2.8-3-.2L12 20.8l-2.4-1.8-3 .2-1-2.8-2.4-1.8 1-2.9-1-2.9 2.4-1.8 1-2.8 3 .2zM8.9 12.2l2.1 2.1 4.1-4.2',
  like: 'M12 20.4s-7.6-4.7-7.6-9.9A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.6 2.3c0 5.2-7.6 9.9-7.6 9.9z',
  comment: 'M4.4 6.4a2 2 0 0 1 2-2h11.2a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2H10l-5.6 4V6.4z',
  bookmark: 'M6.4 4.5h11.2v15.8L12 16.2l-5.6 4.1V4.5z',
  eye: 'M2.6 12S6.4 5.8 12 5.8 21.4 12 21.4 12 17.6 18.2 12 18.2 2.6 12 2.6 12zM12 15.1a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2z',
  pin: 'M12 21.2c4.2-4.7 6.3-8.1 6.3-11.1A6.3 6.3 0 0 0 5.7 10c0 3 2.1 6.4 6.3 11.2zM12 12.3a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  spark:
    'M12 3.4l1.9 5.1 5.1 1.9-5.1 1.9L12 17.4l-1.9-5.1L5 10.4l5.1-1.9zM18.6 16.6l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z',
} as const

/**
 * One glyph per measured category. The first five are the design's own; redness
 * and balance are drawn in the same hand for the two rows it never showed —
 * redness a droplet over a cheek curve, balance a pair of scales.
 */
const METRIC_PATHS: Record<SkinCategory, string> = {
  PORES: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17M9 9.5h.6M14.4 9h.6M11.4 13h.6M15 14.4h.6M8.4 14.4h.6',
  LAXITY: 'M4 16.5c3-6.5 13-6.5 16 0M12 4.5v6M9.5 7L12 4.5 14.5 7',
  WRINKLES:
    'M4 8c2.5-2 5.5-2 8 0s5.5 2 8 0M4 13c2.5-2 5.5-2 8 0s5.5 2 8 0M4 18c2.5-2 5.5-2 8 0s5.5 2 8 0',
  ACNE: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17M9.2 10.4a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M13.6 14.4a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 1 0-2.4 0',
  PIGMENT: 'M7 15a3.6 3.6 0 0 1 .9-7 4.2 4.2 0 0 1 7.8-.6A3.8 3.8 0 0 1 17 15H7zM9.8 18.4h.8M13.4 18.4h.8',
  REDNESS:
    'M12 3.6c2.9 3.4 4.6 6 4.6 8.2a4.6 4.6 0 0 1-9.2 0c0-2.2 1.7-4.8 4.6-8.2zM9.6 16.8a4.6 4.6 0 0 0 4.8 0',
  BALANCE:
    'M12 4v16M5 8h14M7.6 8l-2.8 5.4a3 3 0 0 0 5.6 0zM16.4 8l-2.8 5.4a3 3 0 0 0 5.6 0z',
}

const DISTRICT_PATHS: Record<string, string> = {
  myeongdong: 'M4 9h16l-1.5 11h-13L4 9zm4 0V6a4 4 0 0 1 8 0v3',
  hongdae: 'M14 4l6 6-1.5 1.5M9.5 9.5l5 5-6 6a3.5 3.5 0 1 1-5-5l6-6z',
  gangnam: 'M4 20V9l6-4v15M10 20V11l9-4v13M13 12h3M13 16h3',
}

export function Icon({
  path,
  size = 22,
  weight = 1.5,
}: {
  path: string
  size?: number
  weight?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
      aria-hidden
    >
      <path d={path} />
    </svg>
  )
}

export const CategoryIcon = ({ category, size = 24 }: { category: SkinCategory; size?: number }) => (
  <Icon path={METRIC_PATHS[category]} size={size} />
)

export const DistrictIcon = ({ districtKey, size = 26 }: { districtKey: string; size?: number }) => (
  <Icon path={DISTRICT_PATHS[districtKey] ?? DISTRICT_PATHS.myeongdong} size={size} />
)
