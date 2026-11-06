/**
 * H0 The health checkup's front page.
 *
 * The skin landing's frame (`main.png`) with the checkup in it, so switching modes
 * in the top bar changes the subject, not the site. The sample card is the sample
 * sheet's own reading — the same numbers "Try with a sample sheet" opens — with
 * the turning body in place of the skin score's dial, and it is labelled a
 * preview: nobody has been read yet.
 */
import { useMemo } from 'react'
import { BodyCloud, type BodyFlag } from '../../components/BodyCloud'
import { PATHS } from '../../components/Icons'
import {
  Closing,
  FeatureBand,
  Hero,
  HeroActions,
  HeroHeadline,
  HeroPill,
  SampleCard,
  SiteFooter,
  StartButton,
  StatRow,
  StepGrid,
} from '../../components/landing'
import { GhostButton, Pressable } from '../../components/primitives'
import { useNarrow } from '../../components/layout'
import { C, FONT_DISPLAY, HEALTH, HEALTH_LEVELS as LEVEL_LOOK } from '../../theme'
import { CONDITIONS, SAMPLE_READINGS, buildReport, formatValue } from '../../health/items'
import { useCopy } from '../../i18n'
import { HEALTH_COPY } from '../../i18n/health'
import { HEALTH_LANDING } from '../../i18n/healthLanding'
import { useHealth } from '../../state/health'
import { useStore } from '../../state/store'

/** How many of the sample's flagged areas the card lists. */
const SAMPLE_ROWS = 3

export function HealthLanding() {
  const { go, profile } = useStore()
  const { report, startSample } = useHealth()
  const copy = useCopy(HEALTH_LANDING)
  const all = useCopy(HEALTH_COPY)
  const narrow = useNarrow()

  // Judged as "Try with a sample sheet" will judge it — with the profile's gender,
  // which some lines (waist, γ-GTP, hemoglobin) depend on — so the preview shows
  // what the button opens.
  const sample = useMemo(
    () => buildReport(SAMPLE_READINGS, profile.gender, [], [], true),
    [profile.gender],
  )
  const flags: BodyFlag[] = sample.conditions.map((c) => ({ id: c.id, organ: CONDITIONS[c.id].organ, level: c.level }))
  const flagged = sample.conditions.filter((c) => c.level > 0)
  const rows = flagged.slice(0, SAMPLE_ROWS)

  const start = () => go('health-form')
  const stats = [copy.statItems, copy.statAreas, copy.statUploads]
  const steps = [
    { n: '01', path: PATHS.check, ...copy.stepBasics },
    { n: '02', path: PATHS.camera, ...(narrow ? copy.stepScanPhone : copy.stepScan) },
    { n: '03', path: PATHS.eye, ...copy.stepMap },
    { n: '04', path: PATHS.pin, ...copy.stepGo },
  ]
  const cards = [
    { ...copy.privateCard, color: HEALTH.normal },
    { ...copy.guideCard, color: C.blue },
  ]

  const hero = (
    <>
      <HeroPill dot={HEALTH.normal}>{copy.pill}</HeroPill>
      <HeroHeadline headline={copy.headline} body={narrow ? copy.bodyPhone : copy.bodyLaptop} />
      <HeroActions>
        <StartButton label={copy.start} onClick={start} />
        <GhostButton onClick={startSample} height={56} padding={26} fontSize={16} full={narrow}>
          {all.capture.sample}
        </GhostButton>
      </HeroActions>

      {/* A checkup is never stored, so the only reading to reopen is this visit's. */}
      {report ? (
        <div style={{ marginTop: 18 }}>
          <Pressable
            onClick={() => go('health-result')}
            className="link-quiet"
            style={{ fontSize: 14, fontWeight: 600, color: C.blue }}
          >
            {copy.lastReading} →
          </Pressable>
        </div>
      ) : null}

      <StatRow stats={stats} />
    </>
  )

  const card = (
    <SampleCard title={copy.sampleTitle} preview={copy.samplePreview} note={copy.sampleNote}>
      <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', gap: narrow ? 12 : 20 }}>
        <div style={{ width: narrow ? 112 : 150, flex: 'none' }}>
          <BodyCloud
            flags={flags}
            selected={null}
            // A glow on the preview opens the sample it previews.
            onSelect={startSample}
            height={narrow ? 200 : 236}
            label={all.result.bodyLabel(flagged.map((c) => all.conditions[c.id]))}
            selectedLabel={null}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rows.map((c) => {
            const look = LEVEL_LOOK[c.level]
            const level = <span style={{ color: look.color, whiteSpace: 'nowrap' }}>{all.levels[c.level]}</span>
            // Two of the lines that crossed on a laptop; on a phone the column has room
            // for one.
            const values = c.items
              .filter((i) => i.level > 0)
              .slice(0, narrow ? 1 : 2)
              .map((i) => `${all.items[i.id]} ${formatValue(i.id, i.value)}${i.direction ? (i.direction === 'high' ? ' ↑' : ' ↓') : ''}`)
              .join(' · ')
            return (
              <div key={c.id} style={{ paddingBottom: 12, borderBottom: `1px solid ${C.borderFaint}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    aria-hidden
                    style={{ width: 8, height: 8, borderRadius: '50%', flex: 'none', background: look.color }}
                  />
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontFamily: FONT_DISPLAY,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: C.inkSoft,
                    }}
                  >
                    {all.conditions[c.id]}
                  </div>
                  {/* On a phone the level takes its own line under the name, so neither is cut. */}
                  {narrow ? null : <div style={{ fontSize: 12 }}>{level}</div>}
                </div>
                {narrow ? <div style={{ marginTop: 4, marginLeft: 16, fontSize: 12 }}>{level}</div> : null}
                <div
                  style={{
                    marginTop: narrow ? 2 : 5,
                    marginLeft: 16,
                    fontSize: 12,
                    color: C.muted,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {values}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SampleCard>
  )

  return (
    <div style={{ flex: 1 }}>
      <Hero copy={hero} card={card} />
      <StepGrid eyebrow={copy.howEyebrow} title={copy.howTitle} steps={steps} />
      <FeatureBand eyebrow={copy.bandEyebrow} title={copy.bandTitle} body={copy.bandBody}>
        {cards.map((k) => (
          <div
            key={k.label}
            style={{
              padding: narrow ? '20px 16px' : '26px 22px',
              borderRadius: 18,
              background: C.surface,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', color: k.color }}>
              {k.label}
            </div>
            <div style={{ marginTop: 14, fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.ink }}>
              {k.title}
            </div>
            <div style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.65, color: C.body }}>{k.body}</div>
          </div>
        ))}
      </FeatureBand>
      <Closing title={copy.closingTitle} body={copy.closingBody} start={copy.start} onStart={start} />
      <SiteFooter links={[copy.about, copy.partnerHospitals, copy.privacy, copy.contact]} note={copy.footerNote} />
    </div>
  )
}
