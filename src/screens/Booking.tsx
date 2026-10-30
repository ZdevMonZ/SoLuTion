/**
 * 11 Booking.
 *
 * Nothing here contacts a clinic. The request lands in My List, and the panel says
 * so — the design's own "final confirmation happens with the doctor" is the whole
 * point of the screen, and a prototype that implied a confirmed appointment would
 * be the worst thing on the site to get wrong.
 */
import {
  BackLink,
  Card,
  Display,
  Eyebrow,
  FieldLabel,
  Note,
  Pressable,
  PrimaryButton,
  Prose,
  Shell,
  Well,
} from '../components/primitives'
import { columns, screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY, SHADOW_PANEL } from '../theme'
import { won } from '../data/catalog'
import { useCopy, useLang } from '../i18n'
import { BOOKING } from '../i18n/booking'
import { useCatalog } from '../i18n/catalog'
import { CLINIC_LIST } from '../i18n/clinics'
import { useStore, useTreatment } from '../state/store'

/**
 * One mock week, Monday to Thursday. Real dates rather than "MON 21" literals, so
 * each language names the weekday and month itself: 21 September 2026 is the
 * Monday the design draws.
 */
const DAYS = [21, 22, 23, 24].map((n) => ({ num: String(n), date: new Date(2026, 8, n) }))

/** The last one is drawn taken, so the grid shows what a full slot looks like. */
const TIMES = [
  { time: '10:30', open: true },
  { time: '14:00', open: true },
  { time: '16:30', open: true },
  { time: '18:00', open: false },
]

export function Booking() {
  const { profile, selectedClinicId, savedClinicIds, toggleSavedClinic, day, time, setDay, setTime, go } =
    useStore()
  const { lang } = useLang()
  const cat = useCatalog()
  const copy = useCopy(BOOKING)
  // The back link is the clinic list's own headline.
  const { title: clinicsTitle } = useCopy(CLINIC_LIST)
  const treatment = cat.treatment(useTreatment())
  const district = cat.districtByKey(profile.districtKey) ?? cat.DISTRICTS[0]
  // Reachable from My List, where the saved clinic may sit in another district.
  const clinic = cat.clinicById(selectedClinicId) ?? cat.clinicsIn(district.key)[0]
  const chosenDay = DAYS.find((d) => d.num === day) ?? DAYS[1]
  const narrow = useNarrow()

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 32, 80) }}>
      <Shell width={1100}>
        <BackLink onClick={() => go('clinics')}>{clinicsTitle(district.name)}</BackLink>

        <div
          style={{
            marginTop: narrow ? 16 : 22,
            display: 'grid',
            gridTemplateColumns: columns(narrow, 'minmax(0,1.3fr) minmax(0,1fr)'),
            gap: narrow ? 18 : 32,
            alignItems: 'start',
          }}
        >
          <Card style={{ padding: narrow ? '22px 18px' : 32, borderRadius: narrow ? 18 : 22 }}>
            <Display size={30}>{copy.title}</Display>

            <div style={{ marginTop: 28 }}>
              <FieldLabel>{copy.dayLabel}</FieldLabel>
            </div>
            <div
              style={{
                marginTop: 14,
                display: 'grid',
                // Four to a row on a phone, so the week reads as two even lines.
                gridTemplateColumns: narrow
                  ? 'repeat(4,minmax(0,1fr))'
                  : 'repeat(auto-fit,minmax(min(104px,100%),1fr))',
                gap: 10,
              }}
            >
              {DAYS.map((d) => {
                const on = d.num === chosenDay.num
                return (
                  <Pressable
                    key={d.num}
                    onClick={() => setDay(d.num)}
                    className="opt"
                    style={{
                      padding: '16px 0',
                      borderRadius: 12,
                      textAlign: 'center',
                      display: 'block',
                      width: '100%',
                      background: on ? C.chip : C.surface,
                      border: `1px solid ${on ? C.blue : C.borderStrong}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        letterSpacing: '.06em',
                        color: on ? C.blue : C.muted,
                      }}
                    >
                      {copy.weekday(d.date)}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: FONT_DISPLAY,
                        fontSize: 19,
                        fontWeight: 600,
                        color: on ? C.blue : C.ink,
                      }}
                    >
                      {d.num}
                    </div>
                  </Pressable>
                )
              })}
            </div>

            <div style={{ marginTop: 28 }}>
              <FieldLabel>{copy.timeLabel}</FieldLabel>
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {TIMES.map((slot) => {
                const on = slot.open && slot.time === time
                return (
                  <Pressable
                    key={slot.time}
                    onClick={() => setTime(slot.time)}
                    disabled={!slot.open}
                    className={slot.open ? 'opt' : undefined}
                    style={{
                      padding: narrow ? '12px 14px' : '12px 20px',
                      borderRadius: 10,
                      fontSize: 14,
                      background: slot.open ? (on ? C.chip : C.surface) : C.surfaceMuted,
                      border: `1px solid ${slot.open ? (on ? C.blue : C.borderStrong) : C.rule}`,
                      color: slot.open ? (on ? C.blue : C.bodyFaint) : C.faint,
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    {slot.open ? slot.time : copy.slotFull(slot.time)}
                  </Pressable>
                )
              })}
            </div>

            <Well style={{ marginTop: 30 }}>
              <div
                style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: C.ink }}
              >
                {copy.doctorTitle}
              </div>
              <Prose size={14.5} color={C.body} style={{ marginTop: 10 }}>
                {copy.doctorBody}
              </Prose>
            </Well>

            <Note style={{ marginTop: 20, fontSize: 13.5, lineHeight: 1.75 }}>{copy.hoursNote}</Note>
          </Card>

          <Card
            style={{
              position: narrow ? 'static' : 'sticky',
              top: 92,
              padding: narrow ? '22px 18px' : 28,
              border: `1px solid ${C.borderBlue}`,
              boxShadow: SHADOW_PANEL,
            }}
          >
            {/* Wide tracking is a Latin caps device; CJK keeps only a hint of it. */}
            <Eyebrow size={11.5} spacing={lang === 'en' ? '.14em' : '.04em'}>
              {copy.selectionLabel}
            </Eyebrow>
            <div
              style={{
                marginTop: 16,
                fontFamily: FONT_DISPLAY,
                fontSize: 20,
                fontWeight: 600,
                lineHeight: 1.35,
                color: C.ink,
              }}
            >
              {clinic.name}
            </div>
            <div style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.65, color: C.bodyMuted }}>
              {clinic.address}
            </div>
            <div style={{ marginTop: 6, fontSize: 13.5, color: C.blue }}>
              {copy.staffLine(clinic.distanceLabel)}
            </div>

            <div
              style={{
                marginTop: 22,
                paddingTop: 20,
                borderTop: `1px solid ${C.borderFaint}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {[
                {
                  left: copy.perSession(treatment.shortName),
                  right: won(clinic.priceByTreatmentId[treatment.id]),
                  strong: true,
                },
                { left: copy.consultation, right: copy.free, blue: true },
                { left: copy.appointment, right: copy.appointmentAt(chosenDay.date, time) },
              ].map((row) => (
                <div
                  key={row.left}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 13.5, color: C.bodyMuted }}>{row.left}</div>
                  <div
                    style={{
                      fontFamily: row.strong ? FONT_DISPLAY : undefined,
                      fontSize: row.strong ? 18 : 14,
                      fontWeight: 600,
                      color: row.blue ? C.blue : C.ink,
                    }}
                  >
                    {row.right}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <PrimaryButton
                onClick={() => {
                  // The request has nowhere to go — there is no clinic on the other
                  // end of it — so it lands where the design sends the user next, on
                  // My List. Keeping the clinic there is the honest half of that: an
                  // empty list after asking for an appointment reads as a lost click.
                  if (!savedClinicIds.includes(clinic.id)) toggleSavedClinic(clinic.id)
                  go('mylist')
                }}
                full
                fontSize={15.5}
              >
                {copy.request}
              </PrimaryButton>
            </div>
            <Note style={{ marginTop: 12, textAlign: 'center', fontSize: 12.5 }}>
              {copy.noDeposit}
            </Note>
          </Card>
        </div>
      </Shell>
    </div>
  )
}
