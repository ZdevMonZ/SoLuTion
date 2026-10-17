/**
 * 01 Landing.
 *
 * The one screen that sells rather than reports. Its numbers are the design's own
 * sample, and the card is labelled as one — the visitor has not been read yet, and
 * a preview dressed as their result would be the first thing the site lied about.
 */
import { Icon, PATHS } from '../components/Icons'
import {
  Card,
  Display,
  Eyebrow,
  GhostButton,
  Note,
  Pressable,
  PrimaryButton,
  Prose,
  Shell,
} from '../components/primitives'
import { columns, useNarrow } from '../components/layout'
import { BAR_FILL, C, FONT_DISPLAY, FONT_MONO, LUNION, SOLION } from '../theme'
import { useStore } from '../state/store'

const STATS = [
  { n: '3', label: 'Seoul districts covered' },
  { n: '16', label: 'Partner clinics' },
  { n: '5 min', label: 'From photo to plan' },
]

// Fills are scores, not attention: higher is better, so the row that needs the
// most work draws the shortest bar. Same three levels the design shows.
const HERO_BARS = [
  { name: 'Pigmentation', level: 'Focus first', ratio: 0.14 },
  { name: 'Pores', level: 'Needs care', ratio: 0.26 },
  { name: 'Laxity', level: 'Steady', ratio: 0.52 },
]

const STEPS: {
  n: string
  title: string
  body: string
  phoneTitle?: string
  phoneBody?: string
  path: string
}[] = [
  {
    n: '01',
    title: 'Tell us the basics',
    body: 'Age, gender, and which district you are staying in.',
    path: PATHS.pin,
  },
  {
    n: '02',
    title: 'Use your webcam',
    phoneTitle: 'Use your camera',
    body: 'One frame from your laptop camera, processed in the browser.',
    phoneBody: 'One frame from your phone camera, processed in the browser.',
    path: PATHS.camera,
  },
  {
    n: '03',
    title: 'Read your result',
    body: 'Seven readings in plain language, ordered by priority.',
    path: PATHS.eye,
  },
  {
    n: '04',
    title: 'Compare and book',
    body: 'Clinic prices side by side, then a free consultation.',
    path: PATHS.spark,
  },
]

export function Landing() {
  const { go, savedReport, openSavedReport, deleteSavedReport } = useStore()
  const narrow = useNarrow()
  // The design says "laptop"; on a phone that is the wrong device to name.
  const device = narrow ? 'phone camera' : 'laptop webcam'

  return (
    <div style={{ flex: 1 }}>
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${C.border}` }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: -120,
            height: 760,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
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
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: -120,
            height: 760,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
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
          <div>
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
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue }} />
              <Eyebrow size={12.5} spacing=".02em">
                Myeongdong · Hongdae · Gangnam
              </Eyebrow>
            </div>

            <Display
              size={60}
              style={{ marginTop: narrow ? 20 : 26, lineHeight: 1.08, letterSpacing: '-.025em' }}
            >
              Your first skin diagnosis, built by a dermatologist.
            </Display>
            <Prose
              size={narrow ? 16 : 18}
              color={C.body}
              style={{ marginTop: narrow ? 18 : 24, maxWidth: 560, lineHeight: 1.7 }}
            >
              Solution reads your skin from your {device}, explains what it finds in plain
              language, and shows you which Seoul clinics treat it — with prices, before you walk in.
            </Prose>

            <div
              style={{
                marginTop: narrow ? 28 : 36,
                display: narrow ? 'grid' : 'flex',
                flexWrap: 'wrap',
                gap: narrow ? 10 : 14,
                alignItems: 'center',
              }}
            >
              <PrimaryButton onClick={() => go('form')} height={56} fontSize={16.5} full={narrow}>
                <span>Start Diagnosis</span>
                <span style={{ display: 'flex' }}>
                  <Icon path={PATHS.arrow} size={19} weight={1.7} />
                </span>
              </PrimaryButton>
              <GhostButton
                onClick={() => go('treatments')}
                height={56}
                padding={26}
                fontSize={16}
                full={narrow}
              >
                Browse treatments
              </GhostButton>
            </div>

            {/*
              Only offered when there is something to open. A link that does nothing
              is worse than no link — the Android build reached the same conclusion.
            */}
            {savedReport ? (
              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 14,
                  alignItems: 'center',
                }}
              >
                <Pressable
                  onClick={() => {
                    if (openSavedReport()) go('result')
                  }}
                  className="link-quiet"
                  style={{ fontSize: 14, fontWeight: 600, color: C.blue }}
                >
                  Open your last reading →
                </Pressable>
                <Pressable
                  onClick={deleteSavedReport}
                  className="link-quiet"
                  style={{ fontSize: 13, color: C.muted }}
                >
                  Delete it
                </Pressable>
              </div>
            ) : null}

            <div style={{ marginTop: 34, display: 'flex', flexWrap: 'wrap', gap: narrow ? 22 : 28 }}>
              {STATS.map((s) => (
                <div key={s.label}>
                  <div
                    style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, color: C.ink }}
                  >
                    {s.n}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Card
              style={{
                borderRadius: 22,
                boxShadow: '0 30px 70px rgba(20,32,58,.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${C.borderFaint}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{ fontFamily: FONT_DISPLAY, fontSize: 14.5, fontWeight: 600, color: C.ink }}
                >
                  Sample reading
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Preview</div>
              </div>
              <div style={{ padding: '26px 24px 8px', display: 'flex', alignItems: 'center', gap: 22 }}>
                <div
                  style={{
                    position: 'relative',
                    width: 104,
                    height: 104,
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
                      background: `conic-gradient(from 220deg, ${C.blueLight} 0%, ${C.blue} 62%, #EEF2F7 62%, #EEF2F7 100%)`,
                      // `closest-side`: see ScoreRing. The design's bare `circle` draws no ring.
                      mask: 'radial-gradient(circle closest-side, transparent 82%, #000 83%)',
                      WebkitMask: 'radial-gradient(circle closest-side, transparent 82%, #000 83%)',
                    }}
                  />
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 30,
                        fontWeight: 600,
                        lineHeight: 1,
                        color: C.ink,
                      }}
                    >
                      72
                    </div>
                    <div style={{ marginTop: 3, fontSize: 10, letterSpacing: '.14em', color: C.muted }}>
                      SCORE
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 13,
                  }}
                >
                  {HERO_BARS.map((b) => (
                    <div key={b.name}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.inkSoft }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{b.level}</div>
                      </div>
                      <div
                        style={{
                          marginTop: 7,
                          height: 3,
                          borderRadius: 2,
                          background: C.track,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${b.ratio * 100}%`,
                            height: 3,
                            borderRadius: 2,
                            background: BAR_FILL,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                Pigmentation is the first thing to look at. Three clinics in Myeongdong treat it from
                ₩135,000.
              </div>
            </Card>
          </div>
        </Shell>
      </section>

      <Shell style={{ padding: narrow ? '48px 16px' : '88px 32px' }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow size={12.5}>HOW IT WORKS</Eyebrow>
          <Display size={38} style={{ marginTop: 16, lineHeight: 1.2 }}>
            Four steps, about five minutes.
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
          {STEPS.map((s) => (
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
                <div
                  style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600, color: '#C3CBD9' }}
                >
                  {s.n}
                </div>
              </div>
              <div
                style={{
                  marginTop: 20,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 18,
                  fontWeight: 600,
                  color: C.ink,
                }}
              >
                {(narrow && s.phoneTitle) || s.title}
              </div>
              <Prose size={14} style={{ marginTop: 9, lineHeight: 1.7 }}>
                {(narrow && s.phoneBody) || s.body}
              </Prose>
            </Card>
          ))}
        </div>
      </Shell>

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
            <Eyebrow size={12.5}>PARTNER SKINCARE</Eyebrow>
            <Display size={34} style={{ marginTop: 16 }}>
              SOLION by day, LUNION by night.
            </Display>
            <Prose size={16} color={C.body} style={{ marginTop: 18, maxWidth: 520 }}>
              Every treatment page recommends the two products that matter after it — sun protection
              for the day, recovery for the night. Both lines are sold at the partner clinics you book
              through Solution.
            </Prose>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: narrow ? 12 : 18 }}>
            {[
              { house: SOLION, name: 'SOLION', when: 'Daytime', body: 'Sun protection that keeps treated pigmentation from returning.' },
              { house: LUNION, name: 'LUNION', when: 'Nighttime', body: 'Recovery for the nights right after a session.' },
            ].map((h) => (
              <div
                key={h.name}
                style={{
                  padding: narrow ? '20px 16px' : '26px 22px',
                  borderRadius: 18,
                  background: h.house.bg,
                  border: `1px solid ${h.house.bg === C.surface ? C.border : h.house.border}`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '.22em',
                    color: h.house.label,
                  }}
                >
                  {h.name}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: FONT_DISPLAY,
                    fontSize: 17,
                    fontWeight: 600,
                    color: h.house.name,
                  }}
                >
                  {h.when}
                </div>
                <div style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.65, color: h.house.body }}>
                  {h.body}
                </div>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <Shell style={{ padding: narrow ? '52px 16px 60px' : '88px 32px 96px', textAlign: 'center' }}>
        <Display size={36}>Start with the reading. Decide later.</Display>
        <Prose
          size={16}
          style={{ marginTop: 16, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}
        >
          No account needed to see your result. Nothing is sent to a clinic until you book.
        </Prose>
        <div style={{ margin: '32px auto 0', width: narrow ? '100%' : 'fit-content' }}>
          <PrimaryButton onClick={() => go('form')} height={56} fontSize={16.5} full={narrow}>
            <span>Start Diagnosis</span>
            <span style={{ display: 'flex' }}>
              <Icon path={PATHS.arrow} size={19} weight={1.7} />
            </span>
          </PrimaryButton>
        </div>
      </Shell>

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
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: '#F4F7FB' }}>
            Solution
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 26, fontSize: 13.5 }}>
            <span>About</span>
            <span>Partner clinics</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
          <Note style={{ fontSize: 12.5, color: 'rgba(212,222,238,.55)', fontFamily: FONT_MONO }}>
            Prototype · Sample clinic and price data
          </Note>
        </Shell>
      </footer>
    </div>
  )
}
