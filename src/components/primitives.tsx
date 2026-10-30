/**
 * The parts every screen repeats.
 *
 * The design draws its buttons and cards as styled `div`s with `tabindex`, which
 * a mouse cannot tell from a real control and a keyboard very much can. Every
 * clickable thing here is a real `<button>` instead, stripped back to the
 * design's own look in `index.css`, so Enter, Space and the focus ring arrive for
 * free rather than being re-implemented per screen.
 */
import type { CSSProperties, ReactNode } from 'react'
import { useNarrow } from './layout'
import { BAR_FILL, C, FONT_DISPLAY, FONT_MONO_TEXT, SHADOW_CTA } from '../theme'
import { useCopy, useLang } from '../i18n'
import { PRIMITIVES } from '../i18n/primitives'

/** The page's content column. Every screen in the design sits in this box. */
export function Shell({
  children,
  width = 1320,
  style,
}: {
  children: ReactNode
  width?: number
  style?: CSSProperties
}) {
  return <div style={{ maxWidth: width, margin: '0 auto', ...style }}>{children}</div>
}

export function Pressable({
  onClick,
  children,
  style,
  className,
  disabled,
  label,
}: {
  onClick?: () => void
  children: ReactNode
  style?: CSSProperties
  className?: string
  disabled?: boolean
  /** Screen-reader name, for a control whose visible content is an icon. */
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={[className, disabled ? 'is-disabled' : null].filter(Boolean).join(' ')}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({
  onClick,
  children,
  height = 54,
  padding = 30,
  fontSize = 16,
  full,
  disabled,
}: {
  onClick?: () => void
  children: ReactNode
  height?: number
  padding?: number
  fontSize?: number
  full?: boolean
  disabled?: boolean
}) {
  return (
    <Pressable
      onClick={onClick}
      disabled={disabled}
      className="btn-primary"
      style={{
        height,
        width: full ? '100%' : undefined,
        padding: `0 ${padding}px`,
        borderRadius: 11,
        background: disabled ? C.faint : C.blue,
        color: '#fff',
        fontFamily: FONT_DISPLAY,
        fontSize,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxShadow: disabled ? 'none' : SHADOW_CTA,
      }}
    >
      {children}
    </Pressable>
  )
}

export function GhostButton({
  onClick,
  children,
  height = 52,
  padding = 22,
  fontSize = 15,
  full,
}: {
  onClick?: () => void
  children: ReactNode
  height?: number
  padding?: number
  fontSize?: number
  full?: boolean
}) {
  return (
    <Pressable
      onClick={onClick}
      className="btn-ghost"
      style={{
        height,
        width: full ? '100%' : undefined,
        padding: `0 ${padding}px`,
        borderRadius: 11,
        border: `1px solid ${C.borderStrong}`,
        background: C.surface,
        color: C.inkSoft,
        fontFamily: FONT_DISPLAY,
        fontSize,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
      }}
    >
      {children}
    </Pressable>
  )
}

/**
 * Letter-spacing for a caps label, given the design's Latin value.
 *
 * Wide tracking is a device for Latin capitals. Hangul, kana and hanzi spread that
 * far read as loose characters rather than a label — and in Korean it blurs the
 * spaces between words — so on those pages a label keeps only a hint of it.
 */
export function useTracking(): (latin: string) => string {
  const { lang } = useLang()
  return (latin) => (lang === 'en' || parseFloat(latin) <= 0.04 ? latin : '.04em')
}

/** The letter-spaced blue label above a heading. */
export function Eyebrow({
  children,
  color = C.blue,
  spacing = '.14em',
  size = 12,
}: {
  children: ReactNode
  color?: string
  spacing?: string
  size?: number
}) {
  const tracking = useTracking()
  return (
    <div style={{ fontSize: size, fontWeight: 600, letterSpacing: tracking(spacing), color }}>
      {children}
    </div>
  )
}

/** The small grey caps label over a field. */
export function FieldLabel({ children }: { children: ReactNode }) {
  const tracking = useTracking()
  return (
    <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: tracking('.1em'), color: C.muted }}>
      {children}
    </div>
  )
}

export function Display({
  children,
  size = 34,
  weight = 300,
  color = C.ink,
  style,
}: {
  children: ReactNode
  size?: number
  weight?: number
  color?: string
  style?: CSSProperties
}) {
  const narrow = useNarrow()
  return (
    <div
      // Hooks the CJK line-breaking rules in index.css.
      className="headline"
      style={{
        fontFamily: FONT_DISPLAY,
        // A laptop headline set at 60px breaks one word per line on a phone.
        fontSize: narrow && size > 24 ? Math.max(24, Math.round(size * 0.72)) : size,
        fontWeight: weight,
        lineHeight: 1.25,
        letterSpacing: '-.02em',
        color,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Card({
  children,
  style,
  className,
}: {
  children: ReactNode
  style?: CSSProperties
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 20,
        background: C.surface,
        border: `1px solid ${C.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** The inset note panel — the design's `#F7F9FC` well. */
export function Well({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        padding: '24px 26px',
        borderRadius: 16,
        background: C.surfaceMuted,
        border: `1px solid ${C.rule}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * The severity bar. `ratio` is 0..1 rather than a percentage string, because every
 * caller has a number and the one that did not would be the one that slipped.
 */
export function Bar({ ratio, height = 3 }: { ratio: number; height?: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100)
  return (
    <div
      style={{
        height,
        borderRadius: 2,
        background: C.track,
        overflow: 'hidden',
      }}
    >
      <div style={{ width: `${pct}%`, height, borderRadius: 2, background: BAR_FILL }} />
    </div>
  )
}

/**
 * The score dial.
 *
 * A conic gradient masked to a ring: the sweep stops at the score, and the rest of
 * the circle is track. One element, so it cannot go out of step with its number.
 */
export function ScoreRing({
  value,
  max = 100,
  size = 150,
  thickness = 0.14,
  numeral,
  caption,
  numeralSize = 48,
  numeralWeight = 300,
}: {
  value: number
  max?: number
  size?: number
  /** Ring width as a fraction of the radius. */
  thickness?: number
  numeral: string
  caption: string
  numeralSize?: number
  numeralWeight?: number
}) {
  const tracking = useTracking()
  const filled = Math.min(1, Math.max(0, value / max)) * 100
  const inner = (100 - thickness * 100).toFixed(0)
  // `closest-side`, not the design's bare `circle`: that one measures to the box's
  // corner, which puts the opaque band outside the circle, and the dial draws no
  // ring at all. Keep this across design syncs.
  const mask = `radial-gradient(circle closest-side, transparent ${inner}%, #000 ${Number(inner) + 1}%)`
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(from 220deg, ${C.blueLight} 0%, ${C.blue} ${filled * 0.8}%, ${C.navy} ${filled}%, #EEF2F7 ${filled}%, #EEF2F7 100%)`,
          mask,
          WebkitMask: mask,
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: numeralSize,
            fontWeight: numeralWeight,
            lineHeight: 1,
            color: C.ink,
          }}
        >
          {numeral}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 10.5,
            letterSpacing: tracking('.2em'),
            color: C.muted,
            fontFamily: FONT_MONO_TEXT,
          }}
        >
          {caption}
        </div>
      </div>
    </div>
  )
}

/** "Step 1 of 3" and its rule. */
export function StepProgress({ step, of = 3, width }: { step: number; of?: number; width?: number }) {
  const copy = useCopy(PRIMITIVES)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: width }}>
      <div style={{ flex: 1, height: 3, borderRadius: 2, background: C.border }}>
        <div
          style={{
            width: `${Math.round((step / of) * 100)}%`,
            height: 3,
            borderRadius: 2,
            background: C.blue,
          }}
        />
      </div>
      <div style={{ fontSize: 13, color: C.muted, whiteSpace: 'nowrap' }}>
        {copy.stepOf(step, of)}
      </div>
    </div>
  )
}

export function BackLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Pressable
      onClick={onClick}
      className="link-quiet"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13.5,
        color: C.bodyMuted,
      }}
    >
      ← {children}
    </Pressable>
  )
}

/** The small pill a card wears — "TOP MATCH", "Pigmentation", "LOWEST". */
export function Tag({
  children,
  bg = C.chip,
  color = C.blue,
  bold,
  border,
}: {
  children: ReactNode
  bg?: string
  color?: string
  bold?: boolean
  border?: string
}) {
  const tracking = useTracking()
  return (
    <div
      style={{
        padding: bold ? '4px 10px' : '5px 11px',
        borderRadius: 7,
        background: bg,
        border: border ? `1px solid ${border}` : undefined,
        fontSize: bold ? 10.5 : 11.5,
        fontWeight: bold ? 700 : 600,
        letterSpacing: bold ? tracking('.08em') : undefined,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  )
}

/** A line of small print, in the design's grey. */
export function Note({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: 13, lineHeight: 1.7, color: C.muted, ...style }}>{children}</div>
  )
}

export function Prose({
  children,
  size = 15.5,
  color = C.bodyMuted,
  style,
}: {
  children: ReactNode
  size?: number
  color?: string
  style?: CSSProperties
}) {
  return (
    <div style={{ fontSize: size, lineHeight: 1.75, color, ...style }}>{children}</div>
  )
}

/** The small blue dot that opens a bullet row. */
export function Dot({ color = C.blueLight, size = 6, top = 8 }: { color?: string; size?: number; top?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        marginTop: top,
        flex: 'none',
      }}
    />
  )
}
