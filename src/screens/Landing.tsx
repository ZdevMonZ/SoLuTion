import { TREATMENT_FLOW } from '../i18n/treatmentFlow'
/**
 * 01 Landing.
 *
 * The one screen that sells rather than reports. Its numbers are the design's own
 * sample, and the card is labelled as one — the visitor has not been read yet, and
 * a preview dressed as their result would be the first thing the site lied about.
 */
import { PATHS } from '../components/Icons'
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
} from '../components/landing'
import { GhostButton, Pressable, useTracking } from '../components/primitives'
import { useNarrow } from '../components/layout'
import { BAR_FILL, C, FONT_DISPLAY } from '../theme'
import type { SeverityLevel, SkinCategory } from '../analysis/types'
import { useStrings } from '../data/strings'
import { useCopy } from '../i18n'
import { LANDING } from '../i18n/landing'
import { useStore } from '../state/store'

// Fills are scores, not attention: higher is better, so the row that needs the
// most work draws the shortest bar. Same three levels the design shows, named as
// the result screen names them.
const HERO_BARS: { category: SkinCategory; level: SeverityLevel; ratio: number }[] = [
  { category: 'PIGMENT', level: 'FOCUS', ratio: 0.14 },
  { category: 'PORES', level: 'ATTENTION', ratio: 0.26 },
  { category: 'LAXITY', level: 'NORMAL', ratio: 0.52 },
]

export function Landing() {
  const { go, savedReport, openSavedReport, deleteSavedReport } = useStore()
  const { categoryLabel, levelLabel } = useStrings()
  const copy = useCopy(LANDING)
  const flow = useCopy(TREATMENT_FLOW)
  const tracking = useTracking()
  const narrow = useNarrow()

  const stats = [copy.statDistricts, copy.statClinics, copy.statTime]
  const steps = [
    { n: '01', path: PATHS.camera, ...(narrow ? copy.stepCameraPhone : copy.stepCamera) },
    { n: '02', path: PATHS.eye, ...copy.stepResult },
    { n: '03', path: PATHS.spark, ...flow.stepTreatments },
    { n: '04', path: PATHS.pin, ...flow.stepBooking },
  ]

  const hero = (
    <>
      <HeroPill>{copy.districts}</HeroPill>
      {/* The design says "laptop"; on a phone that is the wrong device to name. */}
      <HeroHeadline headline={copy.headline} body={narrow ? copy.bodyPhone : copy.bodyLaptop} />
      <HeroActions>
        <StartButton label={copy.start} onClick={() => go('capture')} />
        <GhostButton onClick={() => go('treatments')} height={56} padding={26} fontSize={16} full={narrow}>
          {copy.browse}
        </GhostButton>
      </HeroActions>

      {/*
        Only offered when there is something to open. A link that does nothing
        is worse than no link — the Android build reached the same conclusion.
      */}
      {savedReport ? (
        <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <Pressable
            onClick={() => {
              if (openSavedReport()) go('result')
            }}
            className="link-quiet"
            style={{ fontSize: 14, fontWeight: 600, color: C.blue }}
          >
            {copy.savedReport} →
          </Pressable>
          <Pressable onClick={deleteSavedReport} className="link-quiet" style={{ fontSize: 13, color: C.muted }}>
            {copy.deleteSavedReport}
          </Pressable>
        </div>
      ) : null}

      <StatRow stats={stats} />
    </>
  )

  const card = (
    <SampleCard title={copy.sampleTitle} preview={copy.samplePreview} note={copy.sampleNote}>
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
              <div
                style={{
                  marginTop: 3,
                  fontSize: 10,
                  letterSpacing: tracking('.14em'),
                  color: C.muted,
                }}
              >
                {copy.sampleScore}
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
              <div key={b.category}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.inkSoft }}>
                    {categoryLabel(b.category)}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{levelLabel(b.level)}</div>
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
    </SampleCard>
  )

  return (
    <div style={{ flex: 1 }}>
      <Hero copy={hero} card={card} />
      <StepGrid eyebrow={copy.howEyebrow} title={copy.howTitle} steps={steps} />
      <FeatureBand eyebrow="COMMUNITY" title={flow.reviewTitle} body={flow.reviewBody}>
        <div style={{ gridColumn: '1 / -1' }}>
          <GhostButton onClick={() => go('community')} full>{flow.reviews}</GhostButton>
        </div>
      </FeatureBand>
      <Closing title={copy.closingTitle} body={copy.closingBody} start={copy.start} onStart={() => go('capture')} />
      <SiteFooter links={[copy.about, copy.partnerClinics, copy.privacy, copy.contact]} note={copy.footerNote} />
    </div>
  )
}
