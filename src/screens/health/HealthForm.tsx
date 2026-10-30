/**
 * H1 Health-checkup form: age, gender, family history, medical history, district.
 *
 * Age, gender and district are the same answers the skin form takes, held once in
 * the main store, so switching modes never asks twice. Gender sets the lines for
 * hemoglobin, γ-GTP and waist; the two histories decide which flagged areas are
 * moved up and how their guide is worded. Every question has an answer already —
 * an empty history means "none" — so the screen can be passed straight through.
 */
import { DistrictIcon, Icon, PATHS } from '../../components/Icons'
import {
  Card,
  Display,
  Eyebrow,
  FieldLabel,
  Note,
  Pressable,
  PrimaryButton,
  Prose,
  Shell,
  StepProgress,
} from '../../components/primitives'
import { screenPadding, useNarrow } from '../../components/layout'
import { C, FONT_DISPLAY } from '../../theme'
import { useStrings } from '../../data/strings'
import { AGE_BANDS, GENDERS } from '../../analysis/types'
import { HISTORY_IDS, type HistoryId } from '../../health/items'
import { useCopy } from '../../i18n'
import { useCatalog } from '../../i18n/catalog'
import { FORM } from '../../i18n/form'
import { HEALTH_COPY } from '../../i18n/health'
import { useHealth } from '../../state/health'
import { useStore } from '../../state/store'

/** The chip's two looks — the skin form's, so the two forms read as one product. */
const optionStyle = (on: boolean) => ({
  background: on ? C.chip : C.surface,
  border: `1px solid ${on ? C.blue : C.borderStrong}`,
  color: on ? C.blue : C.bodyFaint,
  fontWeight: on ? 600 : 400,
})

function HistoryChips({ chosen, onToggle }: { chosen: HistoryId[]; onToggle: (id: HistoryId) => void }) {
  const copy = useCopy(HEALTH_COPY)
  return (
    <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {HISTORY_IDS.map((id) => {
        const on = chosen.includes(id)
        return (
          <Pressable
            key={id}
            pressed={on}
            onClick={() => onToggle(id)}
            className="opt"
            style={{
              padding: '10px 15px',
              borderRadius: 10,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              ...optionStyle(on),
            }}
          >
            {on ? <Icon path={PATHS.check} size={14} weight={2} /> : null}
            {copy.history[id]}
          </Pressable>
        )
      })}
    </div>
  )
}

export function HealthForm() {
  const { profile, setAgeBand, setGender, setDistrict, go } = useStore()
  const { family, diagnosed, toggleFamily, toggleDiagnosed } = useHealth()
  const { ageBandLabel, genderLabel } = useStrings()
  const { DISTRICTS } = useCatalog()
  const skinForm = useCopy(FORM)
  const copy = useCopy(HEALTH_COPY).form
  const narrow = useNarrow()

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 48, 80) }}>
      <Shell width={720}>
        <StepProgress step={1} of={2} />

        <div style={{ marginTop: narrow ? 24 : 36 }}>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
        </div>
        <Display size={38} style={{ marginTop: 12, lineHeight: 1.2 }}>
          {copy.title}
        </Display>
        <Prose size={16} style={{ marginTop: 14, maxWidth: 580, lineHeight: 1.7 }}>
          {copy.subtitle}
        </Prose>

        <Card style={{ marginTop: narrow ? 28 : 40, padding: narrow ? 20 : 32 }}>
          <FieldLabel>{skinForm.ageHeading}</FieldLabel>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {AGE_BANDS.map((band) => (
              <Pressable
                key={band}
                pressed={profile.ageBand === band}
                onClick={() => setAgeBand(band)}
                className="opt"
                style={{ padding: '12px 20px', borderRadius: 10, fontSize: 14.5, ...optionStyle(profile.ageBand === band) }}
              >
                {ageBandLabel(band)}
              </Pressable>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <FieldLabel>{skinForm.genderHeading}</FieldLabel>
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
                pressed={profile.gender === gender}
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
            <FieldLabel>{copy.familyHeading}</FieldLabel>
          </div>
          <Note style={{ marginTop: 6 }}>{copy.familyNote}</Note>
          <HistoryChips chosen={family} onToggle={toggleFamily} />

          <div style={{ marginTop: 32 }}>
            <FieldLabel>{copy.historyHeading}</FieldLabel>
          </div>
          <Note style={{ marginTop: 6 }}>{copy.historyNote}</Note>
          <HistoryChips chosen={diagnosed} onToggle={toggleDiagnosed} />

          <div
            style={{
              marginTop: 32,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '6px 16px',
            }}
          >
            <FieldLabel>{skinForm.districtHeading}</FieldLabel>
            <Note>{copy.districtNote}</Note>
          </div>
          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(min(180px,100%),1fr))',
              gap: 10,
            }}
          >
            {DISTRICTS.map((d) => {
              const on = profile.districtKey === d.key
              return (
                <Pressable
                  key={d.key}
                  pressed={on}
                  onClick={() => setDistrict(d.key)}
                  className="opt"
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                    background: on ? '#F7FAFE' : C.surface,
                    border: `1px solid ${on ? C.blue : C.border}`,
                  }}
                >
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 'none',
                      background: on ? C.chip : C.chipAlt,
                      color: on ? C.blue : C.muted,
                    }}
                  >
                    <DistrictIcon districtKey={d.key} size={22} />
                  </span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15.5, fontWeight: 600, color: C.ink }}>
                    {d.name}
                  </span>
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
          <PrimaryButton onClick={() => go('health-capture')} fontSize={16} full={narrow}>
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
