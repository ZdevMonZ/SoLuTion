/**
 * Every colour and gradient literal in the site, transcribed from
 * `web_design/Solution.dc.html` rather than approximated.
 *
 * Nothing in the screens mixes its own — the same discipline the Android build's
 * `ui/theme/Color.kt` kept, and for the same reason: a palette that is correct in
 * nine places and improvised in the tenth reads as the wrong design.
 */
export const C = {
  /** Page ground and surfaces. */
  page: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F9FC',
  surfaceFaint: '#FCFDFE',
  chip: '#EFF4FB',
  chipAlt: '#F3F6FA',

  /** Lines. */
  border: '#E4E8EF',
  borderStrong: '#CFD7E4',
  borderBlue: '#DCE7F7',
  borderFaint: '#EFF1F5',
  rule: '#EAEEF4',
  track: '#EDF0F5',

  /** Ink. */
  ink: '#14203A',
  inkSoft: '#2A344A',
  body: '#4C566E',
  bodyMuted: '#5C6680',
  bodyFaint: '#3F4A61',
  muted: '#8A93A6',
  faint: '#B4BCCB',

  /** Brand blues. */
  blue: '#2E5AAC',
  blueDark: '#24488C',
  blueMid: '#5B8FD4',
  blueLight: '#8FB8E8',
  navy: '#0B1E3D',
  navyText: '#CFE0F6',
} as const

/**
 * `--cjk` is set in index.css on a Korean, Japanese or Chinese page: that language's
 * own system faces, right after the Latin one. Unset, each stack is the design's.
 *
 * The mono stack names Consolas so Latin stays monospaced on Windows rather than
 * falling through to a CJK face, which carries Latin of its own; and it puts the CJK
 * faces ahead of the generic because on a CJK page Windows resolves `monospace` to
 * MS Gothic, GulimChe or NSimSun.
 */
export const FONT_DISPLAY = "'Manrope', var(--cjk, system-ui), sans-serif"
export const FONT_MONO = 'ui-monospace, Menlo, Consolas, var(--cjk, monospace), monospace'

/**
 * Mono for *words* — a caption or note that is translated — rather than for numbers.
 * A mono face's word space is about twice a CJK face's, so a Korean caption set in
 * it reads as split in two ("점수  42"); on a CJK page this resolves to the page's own
 * face instead (`--mono-text` in index.css). English keeps the design's mono.
 */
export const FONT_MONO_TEXT = `var(--mono-text, ${FONT_MONO})`

/**
 * The health-checkup mode's own three. The design has no warning colour — skin
 * levels are all shades of blue — but a checkup value past the "disease suspected"
 * line has to read as different in kind, not just darker. Kept muted to sit with
 * the blues.
 */
export const HEALTH = {
  attention: '#D2553F',
  attentionBg: '#FBEDEA',
  borderline: '#D08A1E',
  borderlineBg: '#FBF3E4',
  normal: '#2E7D5B',
  normalBg: '#EAF5EF',
  /** The body model's dots. */
  body: '#2E5AAC',
} as const

/** A checkup level's look, by level: in range, borderline, past the suspected line. */
export const HEALTH_LEVELS = [
  { color: HEALTH.normal, bg: HEALTH.normalBg },
  { color: HEALTH.borderline, bg: HEALTH.borderlineBg },
  { color: HEALTH.attention, bg: HEALTH.attentionBg },
] as const

/** The gradient every severity/score bar is filled with. */
export const BAR_FILL = `linear-gradient(90deg,${C.blueLight},${C.blue} 68%,${C.navy})`

export const SHADOW_CTA = '0 10px 22px rgba(46,90,172,.22)'
export const SHADOW_CARD = '0 14px 32px rgba(20,32,58,.07)'
export const SHADOW_PANEL = '0 16px 40px rgba(46,90,172,.09)'

/**
 * The two in-world houses. SOLION is daytime and light, LUNION is night and dark,
 * and a paired-product card wears its own house — so a LUNION night product is a
 * dark navy card sitting inside a light screen. That contrast is the point, and it
 * is the thing most easily lost by theming the card from the screen instead of
 * from the product.
 */
export interface HouseTheme {
  bg: string
  border: string
  chipBg: string
  chipColor: string
  dot: string
  name: string
  body: string
  btnBg: string
  btnColor: string
  hero: string
  frameBorder: string
  glow: string
  ring: string
  bottle: string
  cap: string
  chrome: string
  label: string
}

export const SOLION: HouseTheme = {
  bg: '#FFFFFF',
  border: '#DCE7F7',
  chipBg: '#EFF4FB',
  chipColor: '#2E5AAC',
  dot: '#2E5AAC',
  name: '#14203A',
  body: '#5C6680',
  btnBg: '#2E5AAC',
  btnColor: '#FFFFFF',
  hero: 'linear-gradient(170deg,#FFFFFF,#F2F6FC 60%,#E8EFF8)',
  frameBorder: '#E4E8EF',
  glow: 'radial-gradient(circle at 50% 50%, rgba(46,90,172,.16) 0%, rgba(143,184,232,.14) 44%, rgba(143,184,232,0) 72%)',
  ring: 'rgba(143,184,232,.45)',
  bottle: 'linear-gradient(150deg,#FFFFFF 0%,#EAF1FB 48%,#CFDFF4 100%)',
  cap: 'linear-gradient(150deg,#DDE8F7,#B9CFEC)',
  chrome: '#2E5AAC',
  label: '#2E5AAC',
}

export const LUNION: HouseTheme = {
  bg: '#0B1E3D',
  border: '#0B1E3D',
  chipBg: 'rgba(143,184,232,.16)',
  chipColor: '#9EC2EC',
  dot: '#8FB8E8',
  name: '#F4F7FB',
  body: 'rgba(206,218,236,.88)',
  btnBg: '#8FB8E8',
  btnColor: '#0B1E3D',
  hero: 'linear-gradient(170deg,#16305A,#0E2245 55%,#0B1E3D)',
  frameBorder: '#0B1E3D',
  glow: 'radial-gradient(circle at 50% 50%, rgba(143,184,232,.3) 0%, rgba(91,143,212,.2) 44%, rgba(11,30,61,0) 72%)',
  ring: 'rgba(143,184,232,.3)',
  bottle: 'linear-gradient(150deg,#1D3762 0%,#122B50 48%,#0A1B36 100%)',
  cap: 'linear-gradient(150deg,#A9BEDC,#7A90B4)',
  chrome: '#9EC2EC',
  label: '#5B8FD4',
}

export const houseOf = (brand: 'SOLION' | 'LUNION'): HouseTheme =>
  brand === 'LUNION' ? LUNION : SOLION

/**
 * The three weights a result card wears, by how much attention the row needs.
 *
 * Four discrete looks rather than one ramp scaled by severity: scaling a single
 * ramp washes every card out to the same pale blue.
 */
export interface Tone {
  iconBg: string
  iconColor: string
  levelBg: string
  levelColor: string
  border: string
}

export const TONES: Record<'deep' | 'mid' | 'light', Tone> = {
  deep: {
    iconBg: '#E5EDF9',
    iconColor: '#0B1E3D',
    levelBg: '#0B1E3D',
    levelColor: '#CFE0F6',
    border: '#DCE7F7',
  },
  mid: {
    iconBg: '#EFF4FB',
    iconColor: '#2E5AAC',
    levelBg: '#EFF4FB',
    levelColor: '#2E5AAC',
    border: '#E4E8EF',
  },
  light: {
    iconBg: '#F3F6FA',
    iconColor: '#5B8FD4',
    levelBg: '#F3F6FA',
    levelColor: '#5C6680',
    border: '#E4E8EF',
  },
}

/** FOCUS gets the deep plate, ATTENTION the mid one, the calm two stay light. */
export const toneFor = (level: 'EASE' | 'NORMAL' | 'ATTENTION' | 'FOCUS'): Tone =>
  level === 'FOCUS' ? TONES.deep : level === 'ATTENTION' ? TONES.mid : TONES.light
