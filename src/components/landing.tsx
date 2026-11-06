/**
 * The pieces the two front pages share: the skin check's (01 Landing) and the
 * health checkup's (H0). Both are drawn from `main.png` — one hero, one sample
 * card, four steps, one closing call — so the two modes read as one site, and a
 * change to the frame lands on both.
 */
import type { ReactNode } from 'react'
import { Icon, PATHS } from './Icons'
import { Card, Display, Eyebrow, Note, PrimaryButton, Prose, Shell } from './primitives'
import { columns, useNarrow } from './layout'
import { C, FONT_DISPLAY, FONT_MONO_TEXT } from '../theme'

/** The slow glow and the turning ring behind the hero. */
export function HeroBackdrop() {
  const layer = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -120,
    height: 760,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  } as const
  return (
    <>
      <div aria-hidden style={layer}>
        <div
          style={{
            width: 900,
            maxWidth: '130%',
            aspectRatio: '1',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 50%, rgba(46,90,172,.16) 0%, rgba(143,184,232,.14) 38%, rgba(143,184,232,0) 68%)',
            animation: 'glowPulse 9s ease-in-out infinite',
          }}
        />
      </div>
      <div aria-hidden style={layer}>
        <div
          style={{
            width: 520,
            maxWidth: '80%',
            aspectRatio: '1',
            borderRadius: '50%',
            border: '1px solid rgba(143,184,232,.4)',
            animation: 'glowSpin 60s linear infinite',
            background:
              'conic-gradient(from 0deg, rgba(46,90,172,0) 0%, rgba(46,90,172,.08) 30%, rgba(143,184,232,0) 64%)',
          }}
        />
      </div>
    </>
  )
}

/** The hero: the words on the left, the sample card on the right. */
export function Hero({ copy, card }: { copy: ReactNode; card: ReactNode }) {
  const narrow = useNarrow()
  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${C.border}` }}>
      <HeroBackdrop />
      <Shell
        style={{
          position: 'relative',
          padding: narrow ? '40px 16px 56px' : '96px 32px 104px',
          display: 'grid',
          gridTemplateColumns: columns(narrow, 'minmax(0,1.05fr) minmax(0,.95fr)'),
          gap: narrow ? 40 : 64,
          alignItems: 'center',
        }}
      >
        <div>{copy}</div>
        <div style={{ position: 'relative' }}>{card}</div>
      </Shell>
    </section>
  )
}

/** The pill above the headline, with its dot. */
export function HeroPill({ children, dot = C.blue }: { children: ReactNode; dot?: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        padding: '7px 14px',
        borderRadius: 20,
        background: C.chip,
        border: `1px solid ${C.borderBlue}`,
      }}
    >
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
      <Eyebrow size={12.5} spacing=".02em">
        {children}
      </Eyebrow>
    </div>
  )
}

export function HeroHeadline({ headline, body }: { headline: string; body: string }) {
  const narrow = useNarrow()
  return (
    <>
      <Display size={60} style={{ marginTop: narrow ? 20 : 26, lineHeight: 1.08, letterSpacing: '-.025em' }}>
        {headline}
      </Display>
      <Prose
        size={narrow ? 16 : 18}
        color={C.body}
        style={{ marginTop: narrow ? 18 : 24, maxWidth: 560, lineHeight: 1.7 }}
      >
        {body}
      </Prose>
    </>
  )
}

/** The two calls under the hero copy: stacked full width on a phone. */
export function HeroActions({ children }: { children: ReactNode }) {
  const narrow = useNarrow()
  return (
    <div
      style={{
        marginTop: narrow ? 28 : 36,
        display: narrow ? 'grid' : 'flex',
        flexWrap: 'wrap',
        gap: narrow ? 10 : 14,
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  )
}

/** The primary call with its arrow. */
export function StartButton({ label, onClick }: { label: string; onClick: () => void }) {
  const narrow = useNarrow()
  return (
    <PrimaryButton onClick={onClick} height={56} fontSize={16.5} full={narrow}>
      <span>{label}</span>
      <span style={{ display: 'flex' }}>
        <Icon path={PATHS.arrow} size={19} weight={1.7} />
      </span>
    </PrimaryButton>
  )
}

export function StatRow({ stats }: { stats: { value: string; label: string }[] }) {
  const narrow = useNarrow()
  return (
    <div style={{ marginTop: 34, display: 'flex', flexWrap: 'wrap', gap: narrow ? 22 : 28 }}>
      {stats.map((s) => (
        <div key={s.label}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, color: C.ink }}>{s.value}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

/** The hero's card: a titled header, the sample itself, and a note under it. */
export function SampleCard({
  title,
  preview,
  note,
  children,
}: {
  title: string
  preview: string
  note: ReactNode
  children: ReactNode
}) {
  return (
    <Card style={{ borderRadius: 22, boxShadow: '0 30px 70px rgba(20,32,58,.1)', overflow: 'hidden' }}>
      <div
        style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${C.borderFaint}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14.5, fontWeight: 600, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted }}>{preview}</div>
      </div>
      {children}
      <div
        style={{
          margin: '20px 24px 24px',
          padding: '16px 18px',
          borderRadius: 14,
          background: C.surfaceMuted,
          border: `1px solid ${C.rule}`,
          fontSize: 13,
          lineHeight: 1.65,
          color: C.body,
        }}
      >
        {note}
      </div>
    </Card>
  )
}

export interface Step {
  n: string
  path: string
  title: string
  body: string
}

export function StepGrid({ eyebrow, title, steps }: { eyebrow: string; title: string; steps: Step[] }) {
  const narrow = useNarrow()
  return (
    <Shell style={{ padding: narrow ? '48px 16px' : '88px 32px' }}>
      <div style={{ maxWidth: 620 }}>
        <Eyebrow size={12.5}>{eyebrow}</Eyebrow>
        <Display size={38} style={{ marginTop: 16, lineHeight: 1.2 }}>
          {title}
        </Display>
      </div>
      <div
        style={{
          marginTop: narrow ? 28 : 44,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))',
          gap: 20,
        }}
      >
        {steps.map((s) => (
          <Card key={s.n} className="card-hover" style={{ padding: '28px 24px', borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: C.chip,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: C.blue,
                }}
              >
                <Icon path={s.path} size={22} />
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600, color: '#C3CBD9' }}>{s.n}</div>
            </div>
            <div style={{ marginTop: 20, fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: C.ink }}>
              {s.title}
            </div>
            <Prose size={14} style={{ marginTop: 9, lineHeight: 1.7 }}>
              {s.body}
            </Prose>
          </Card>
        ))}
      </div>
    </Shell>
  )
}

/** The tinted band between the steps and the closing call: words left, cards right. */
export function FeatureBand({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children: ReactNode
}) {
  const narrow = useNarrow()
  return (
    <section style={{ borderTop: `1px solid ${C.border}`, background: C.surfaceMuted }}>
      <Shell
        style={{
          padding: narrow ? '48px 16px' : '80px 32px',
          display: 'grid',
          gridTemplateColumns: columns(narrow, 'minmax(0,1fr) minmax(0,1fr)'),
          gap: narrow ? 28 : 56,
          alignItems: 'center',
        }}
      >
        <div>
          <Eyebrow size={12.5}>{eyebrow}</Eyebrow>
          <Display size={34} style={{ marginTop: 16 }}>
            {title}
          </Display>
          <Prose size={16} color={C.body} style={{ marginTop: 18, maxWidth: 520 }}>
            {body}
          </Prose>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: narrow ? 12 : 18 }}>{children}</div>
      </Shell>
    </section>
  )
}

export function Closing({ title, body, start, onStart }: { title: string; body: string; start: string; onStart: () => void }) {
  const narrow = useNarrow()
  return (
    <Shell style={{ padding: narrow ? '52px 16px 60px' : '88px 32px 96px', textAlign: 'center' }}>
      <Display size={36}>{title}</Display>
      <Prose size={16} style={{ marginTop: 16, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
        {body}
      </Prose>
      <div style={{ margin: '32px auto 0', width: narrow ? '100%' : 'fit-content' }}>
        <StartButton label={start} onClick={onStart} />
      </div>
    </Shell>
  )
}

export function SiteFooter({ links, note }: { links: string[]; note: string }) {
  const narrow = useNarrow()
  return (
    <footer style={{ background: C.navy, color: 'rgba(212,222,238,.8)' }}>
      <Shell
        style={{
          padding: narrow ? '36px 16px' : '52px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: narrow ? 20 : 32,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: '#F4F7FB' }}>SoLuTion</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 26, fontSize: 13.5 }}>
          {links.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <Note style={{ fontSize: 12.5, color: 'rgba(212,222,238,.55)', fontFamily: FONT_MONO_TEXT }}>{note}</Note>
      </Shell>
    </footer>
  )
}
