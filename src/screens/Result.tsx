/**
 * 06 Result.
 *
 * Every sentence here is derived from the stored numbers by `data/strings.ts` at
 * render time — the reading itself carries no prose. The rows are ordered by how
 * much attention each area needs, which is also the order the treatment list is
 * built from, so the two screens can never disagree about what comes first.
 */
import { CategoryIcon, Icon, PATHS } from '../components/Icons'
import {
  Bar,
  Card,
  Display,
  Eyebrow,
  FieldLabel,
  GhostButton,
  Note,
  Pressable,
  PrimaryButton,
  Prose,
  ScoreRing,
  Shell,
} from '../components/primitives'
import { columns, screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY, FONT_MONO, toneFor } from '../theme'
import {
  SKIN_TONE,
  analysisComparison,
  analysisExplanation,
  analysisHeadline,
  analysisNotice,
  analysisRowNote,
  categoryLabel,
  levelLabel,
  UI,
} from '../data/strings'
import { PHOTOTYPES } from '../analysis/phototype'
import { SUN_REACTIONS } from '../data/fitzpatrick'
import type { FitzpatrickType } from '../analysis/phototype'
import type { SkinAnalysisResult } from '../analysis/types'
import { rankedCategories, ratioOf } from '../analysis/types'
import { useStore } from '../state/store'

const COUNT_WORDS = ['no', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight']

/**
 * Skin tone, shown beside the rows rather than as one of them.
 *
 * Two values on purpose. The one the user stated is the instrument — Fitzpatrick
 * asks how skin burns and tans, which a photograph cannot show. The one measured
 * from the frame is ITA°, and it is offered as a cross-check with its own error
 * stated, never as the answer: the same face reads several classes lighter by a
 * window than under a lamp (see `analysis/phototype.ts`). When the two disagree by
 * two classes or more the card says to trust the stated one.
 *
 * The question is answerable from here, not only from the form. It is the one
 * field on that form with no pre-filled value — deliberately, since a skin type
 * nobody stated must not be invented — which also makes it the one field a user
 * walks past. This card is where its absence becomes visible and therefore where
 * answering it is worth a tap.
 */
function SkinToneCard({
  reading,
  reported,
  tookPhoto,
  onAnswer,
}: {
  reading: SkinAnalysisResult['phototype']
  reported: FitzpatrickType | null
  tookPhoto: boolean
  onAnswer: (type: FitzpatrickType) => void
}) {
  const measured = reading && reading.lightingUsable ? reading.phototype : null
  const gap =
    measured && reported
      ? Math.abs(
          PHOTOTYPES.findIndex((p) => p.type === measured.type) -
            PHOTOTYPES.findIndex((p) => p.type === reported),
        )
      : null
  const agreement =
    gap === null ? null : gap === 0 ? SKIN_TONE.agrees : gap === 1 ? SKIN_TONE.near : SKIN_TONE.differs
  const narrow = useNarrow()

  return (
    <Card style={{ padding: narrow ? '20px 18px' : 26, borderRadius: 18 }}>
      <FieldLabel>{SKIN_TONE.title}</FieldLabel>
      <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 28 }}>
        <div style={{ minWidth: 130 }}>
          <div style={{ fontSize: 11.5, color: C.faint }}>{SKIN_TONE.reported}</div>
          <div
            style={{
              marginTop: 6,
              fontFamily: FONT_DISPLAY,
              fontSize: 21,
              color: reported ? C.ink : C.muted,
            }}
          >
            {reported ? `Type ${reported}` : SKIN_TONE.unanswered}
          </div>
        </div>
        <div style={{ minWidth: 130 }}>
          <div style={{ fontSize: 11.5, color: C.faint }}>{SKIN_TONE.measured}</div>
          <div style={{ marginTop: 6, fontFamily: FONT_DISPLAY, fontSize: 21, color: C.ink }}>
            {measured ? `Type ${measured.type} · ${measured.name}` : '—'}
          </div>
          {reading ? (
            <div style={{ marginTop: 4, fontSize: 11.5, color: C.faint, fontFamily: FONT_MONO }}>
              ITA {reading.itaDegrees.toFixed(1)}°
            </div>
          ) : null}
        </div>
      </div>
      {reported === null ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.body }}>{SKIN_TONE.ask}</div>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {SUN_REACTIONS.map((reaction) => (
              <Pressable
                key={reaction.type}
                onClick={() => onAnswer(reaction.type)}
                className="opt"
                label={`Type ${reaction.type}. ${reaction.burn}. ${reaction.tan}.`}
                style={{
                  padding: '9px 14px',
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontFamily: FONT_MONO,
                  background: C.chip,
                  border: `1px solid ${C.border}`,
                  color: C.inkSoft,
                }}
              >
                {reaction.type}
              </Pressable>
            ))}
          </div>
          <div style={{ marginTop: 9, fontSize: 11.5, lineHeight: 1.6, color: C.faint }}>
            {SUN_REACTIONS.map((r) => `${r.type} ${r.burn.toLowerCase()}`).join(' · ')}
          </div>
        </div>
      ) : null}
      {agreement ? (
        <div style={{ marginTop: 16, fontSize: 13, lineHeight: 1.7, color: C.body }}>{agreement}</div>
      ) : null}
      <Prose size={12.5} style={{ marginTop: 14, lineHeight: 1.65 }}>
        {reading === null
          ? tookPhoto
            ? SKIN_TONE.none
            : SKIN_TONE.noPhoto
          : reading.lightingUsable
            ? SKIN_TONE.caveat
            : SKIN_TONE.unusable}
      </Prose>
    </Card>
  )
}

export function Result() {
  const { analysis, capturedUrl, hasEnteredTabShell, profile, setFitzpatrick, go, openModal } =
    useStore()
  const narrow = useNarrow()

  // Reachable only behind a reading; the guard is here so a stray navigation lands
  // somewhere sensible rather than on a blank page.
  if (!analysis) {
    return (
      <div style={{ flex: 1, padding: screenPadding(narrow, 80, 80) }}>
        <Shell width={620}>
          <Display size={30}>No reading yet.</Display>
          <Prose style={{ marginTop: 14 }}>Take one and this page fills in.</Prose>
          <div style={{ marginTop: 26, width: 'fit-content' }}>
            <PrimaryButton onClick={() => go('form')}>Start Diagnosis</PrimaryButton>
          </div>
        </Shell>
      </div>
    )
  }

  const rows = rankedCategories(analysis)
  const notice = analysisNotice(analysis)
  const count = COUNT_WORDS[rows.length] ?? String(rows.length)

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 48, 80) }}>
      <Shell>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: columns(narrow, 'minmax(0,.9fr) minmax(0,1.1fr)'),
            gap: narrow ? 28 : 48,
            alignItems: 'center',
          }}
        >
          <Card
            style={{
              position: 'relative',
              padding: narrow ? 20 : 36,
              borderRadius: narrow ? 18 : 22,
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                right: -80,
                top: -80,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 50% 50%, rgba(46,90,172,.13) 0%, rgba(143,184,232,.1) 44%, rgba(143,184,232,0) 70%)',
              }}
            />
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: narrow ? 20 : 32,
                flexWrap: 'wrap',
              }}
            >
              <ScoreRing
                value={analysis.overallScore}
                numeral={String(analysis.overallScore)}
                caption={UI.outOf}
                size={narrow ? 120 : 150}
                numeralSize={narrow ? 40 : 48}
                thickness={0.15}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <Eyebrow>{UI.scoreLabel}</Eyebrow>
                <div
                  style={{
                    marginTop: 12,
                    fontFamily: FONT_DISPLAY,
                    fontSize: narrow ? 20 : 24,
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: C.ink,
                  }}
                >
                  {analysisHeadline(analysis)}
                </div>
                <Note style={{ marginTop: 12, fontSize: 13.5 }}>{analysisComparison(analysis)}</Note>
              </div>
            </div>

            {/* The frame this reading came from, when there is one to show. */}
            {capturedUrl ? (
              <div
                style={{
                  position: 'relative',
                  marginTop: 26,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <img
                  src={capturedUrl}
                  alt="The frame this reading was taken from"
                  style={{
                    width: 64,
                    height: 82,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                  }}
                />
                <Note style={{ fontSize: 12.5 }}>
                  Read in your browser. It is never uploaded, and it goes when this tab does.
                </Note>
              </div>
            ) : null}

            {/*
              A caveat about the capture belongs on the reading it qualifies, not in
              a toast that has already gone by the time the numbers are read.
            */}
            {notice ? (
              <div
                style={{
                  position: 'relative',
                  marginTop: 22,
                  padding: '16px 18px',
                  borderRadius: 14,
                  background: C.surfaceMuted,
                  border: `1px solid ${C.rule}`,
                  display: 'flex',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: C.blueLight,
                    marginTop: 7,
                    flex: 'none',
                  }}
                />
                <div style={{ fontSize: 13, lineHeight: 1.7, color: C.body }}>{notice}</div>
              </div>
            ) : null}
          </Card>

          <div>
            <Display size={32} style={{ lineHeight: 1.3 }}>
              {count} readings, in order of what to look at first.
            </Display>
            <Prose style={{ marginTop: 16, maxWidth: 540 }}>
              A low reading is not a diagnosis. Each row scores out of 100 the same way the
              headline does — higher is better, so a short bar is the one to look at first, and
              nothing here is an alarm.
            </Prose>
            <div
              style={{
                marginTop: narrow ? 22 : 28,
                display: narrow ? 'grid' : 'flex',
                flexWrap: 'wrap',
                gap: narrow ? 10 : 12,
              }}
            >
              <PrimaryButton
                onClick={() => (hasEnteredTabShell ? go('treatments') : openModal('signup'))}
                height={52}
                padding={26}
                fontSize={15.5}
                full={narrow}
              >
                <span>{UI.seeTreatments}</span>
                <span style={{ display: 'flex' }}>
                  <Icon path={PATHS.arrow} size={19} weight={1.7} />
                </span>
              </PrimaryButton>
              {/*
                The browser's own print dialog saves a PDF. A button that opened
                nothing would be the one thing on this page that is not real.
              */}
              <GhostButton onClick={() => window.print()} height={52} full={narrow}>
                <span style={{ display: 'flex' }}>
                  <Icon path={PATHS.download} size={18} weight={1.6} />
                </span>
                <span>Save as PDF</span>
              </GhostButton>
              <Pressable
                onClick={() => go('capture')}
                className="link-quiet"
                style={{
                  fontSize: 13.5,
                  color: C.muted,
                  padding: narrow ? '10px 6px' : '0 6px',
                  textAlign: 'center',
                }}
              >
                {UI.retake}
              </Pressable>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: narrow ? 28 : 36,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(288px,100%),1fr))',
            gap: 18,
          }}
        >
          {rows.map((row, i) => {
            const tone = toneFor(row.level)
            return (
              <Card
                key={row.category}
                className="card-hover"
                style={{
                  padding: narrow ? '20px 18px' : '26px 24px',
                  borderRadius: 18,
                  border: `1px solid ${tone.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        flex: 'none',
                        borderRadius: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: tone.iconBg,
                        color: tone.iconColor,
                      }}
                    >
                      <CategoryIcon category={row.category} />
                    </div>
                    <div
                      style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: C.ink }}
                    >
                      {categoryLabel(row.category)}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 'none',
                      whiteSpace: 'nowrap',
                      padding: '5px 11px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: tone.levelBg,
                      color: tone.levelColor,
                    }}
                  >
                    {levelLabel(row.level)}
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <Bar ratio={ratioOf(row)} />
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: 11.5, color: C.faint, fontFamily: FONT_MONO }}>
                    {UI.rowScore(Math.round(row.score))}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.faint }}>Priority {i + 1}</div>
                </div>
                <Prose size={14} style={{ marginTop: 14, lineHeight: 1.7 }}>
                  {analysisExplanation(row)}
                </Prose>
                {analysisRowNote(row) ? (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: `1px solid ${C.rule}`,
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: C.faint,
                    }}
                  >
                    {analysisRowNote(row)}
                  </div>
                ) : null}
              </Card>
            )
          })}

          <SkinToneCard
            reading={analysis.phototype}
            reported={profile.fitzpatrick}
            tookPhoto={analysis.notice !== 'NO_PHOTO'}
            onAnswer={setFitzpatrick}
          />
        </div>
      </Shell>
    </div>
  )
}
