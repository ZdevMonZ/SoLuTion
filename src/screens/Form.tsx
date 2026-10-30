/**
 * 03 Info form.
 *
 * Age and gender are what the cohort comparison is taken against, and the district
 * decides which clinics and which map the rest of the funnel shows. All three have
 * defaults, so the screen can be passed through untouched.
 */
import { Icon, PATHS, DistrictIcon } from '../components/Icons'
import {
  Card,
  Display,
  FieldLabel,
  Note,
  Pressable,
  PrimaryButton,
  Prose,
  Shell,
  StepProgress,
} from '../components/primitives'
import { screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY, FONT_MONO } from '../theme'
import { useStrings } from '../data/strings'
import { AGE_BANDS, GENDERS } from '../analysis/types'
import { SUN_REACTIONS } from '../data/fitzpatrick'
import { useCopy } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { FORM } from '../i18n/form'
import { useStore } from '../state/store'

/** The chip's two looks. The design's `opt()`, one place for both. */
const optionStyle = (on: boolean) => ({
  background: on ? C.chip : C.surface,
  border: `1px solid ${on ? C.blue : C.borderStrong}`,
  color: on ? C.blue : C.bodyFaint,
  fontWeight: on ? 600 : 400,
})

export function Form() {
  const { profile, setAgeBand, setGender, setFitzpatrick, setDistrict, go } = useStore()
  const { SKIN_TONE, ageBandLabel, genderLabel } = useStrings()
  const { DISTRICTS } = useCatalog()
  const copy = useCopy(FORM)
  const narrow = useNarrow()

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 48, 80) }}>
      <Shell width={720}>
        <StepProgress step={1} />

        <Display size={38} style={{ marginTop: narrow ? 24 : 36, lineHeight: 1.2 }}>
          {copy.title}
        </Display>
        <Prose size={16} style={{ marginTop: 14, maxWidth: 560, lineHeight: 1.7 }}>
          {copy.subtitle}
        </Prose>

        <Card style={{ marginTop: narrow ? 28 : 40, padding: narrow ? 20 : 32 }}>
          <FieldLabel>{copy.ageHeading}</FieldLabel>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {AGE_BANDS.map((band) => (
              <Pressable
                key={band}
                onClick={() => setAgeBand(band)}
                className="opt"
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: 14.5,
                  ...optionStyle(profile.ageBand === band),
                }}
              >
                {ageBandLabel(band)}
              </Pressable>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <FieldLabel>{copy.genderHeading}</FieldLabel>
          </div>
          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(min(150px,100%),1fr))',
              gap: 10,
            }}
          >
            {GENDERS.map((gender) => (
              <Pressable
                key={gender}
                onClick={() => setGender(gender)}
                className="opt"
                style={{
                  height: 50,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14.5,
                  ...optionStyle(profile.gender === gender),
                }}
              >
                {genderLabel(gender)}
              </Pressable>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <FieldLabel>{SKIN_TONE.question}</FieldLabel>
          </div>
          <Prose size={13} style={{ marginTop: 8, lineHeight: 1.6 }}>
            {SKIN_TONE.questionHint}
          </Prose>
          <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
            {SUN_REACTIONS.map((reaction) => (
              <Pressable
                key={reaction.type}
                // Tapping the chosen one again clears it: the question is optional, and
                // a set of chips with no "none" is a set you cannot take back.
                onClick={() =>
                  setFitzpatrick(profile.fitzpatrick === reaction.type ? null : reaction.type)
                }
                className="opt"
                style={{
                  padding: '13px 18px',
                  borderRadius: 10,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'left',
                  ...optionStyle(profile.fitzpatrick === reaction.type),
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 12,
                    opacity: 0.65,
                    minWidth: 26,
                    flex: 'none',
                  }}
                >
                  {reaction.type}
                </span>
                <span>{SKIN_TONE.option(reaction.type)}</span>
              </Pressable>
            ))}
          </div>

          <div
            style={{
              marginTop: 32,
              display: 'flex',
              // On a phone the note drops under the heading rather than squeezing it
              // into a sliver, which a CJK heading fills a character or two a line.
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '6px 16px',
            }}
          >
            <FieldLabel>{copy.districtHeading}</FieldLabel>
            <Note>{copy.districtNote}</Note>
          </div>
          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(min(196px,100%),1fr))',
              gap: 12,
            }}
          >
            {DISTRICTS.map((d) => {
              const on = profile.districtKey === d.key
              return (
                <Pressable
                  key={d.key}
                  onClick={() => setDistrict(d.key)}
                  className="opt"
                  style={{
                    padding: 20,
                    borderRadius: 14,
                    textAlign: 'left',
                    background: on ? '#F7FAFE' : C.surface,
                    border: `1px solid ${on ? C.blue : C.border}`,
                    display: 'block',
                    width: '100%',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: on ? C.chip : C.chipAlt,
                        color: on ? C.blue : C.muted,
                      }}
                    >
                      <DistrictIcon districtKey={d.key} />
                    </div>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        background: on ? C.blue : '#F1F3F6',
                        color: on ? '#fff' : 'transparent',
                      }}
                    >
                      ✓
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      fontFamily: FONT_DISPLAY,
                      fontSize: 17,
                      fontWeight: 600,
                      color: C.ink,
                    }}
                  >
                    {d.name}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: C.bodyMuted }}>
                    {d.blurb}
                  </div>
                </Pressable>
              )
            })}
          </div>
        </Card>

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Note style={{ maxWidth: 420, lineHeight: 1.6 }}>{copy.privacyNote}</Note>
          <PrimaryButton onClick={() => go('capture')} fontSize={16} full={narrow}>
            <span>{copy.cta}</span>
            <span style={{ display: 'flex' }}>
              <Icon path={PATHS.arrow} size={19} weight={1.7} />
            </span>
          </PrimaryButton>
        </div>
      </Shell>
    </div>
  )
}
