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
import { C, FONT_DISPLAY, SHADOW_PANEL } from '../theme'
import { DISTRICTS, clinicById, clinicsIn, districtByKey, won } from '../data/catalog'
import { useStore, useTreatment } from '../state/store'

const DAYS = [
  { dow: 'MON', num: '21' },
  { dow: 'TUE', num: '22' },
  { dow: 'WED', num: '23' },
  { dow: 'THU', num: '24' },
]

/** The last one is drawn taken, so the grid shows what a full slot looks like. */
const TIMES = [
  { label: '10:30', open: true },
  { label: '14:00', open: true },
  { label: '16:30', open: true },
  { label: '18:00 full', open: false },
]

export function Booking() {
  const { profile, selectedClinicId, savedClinicIds, toggleSavedClinic, day, time, setDay, setTime, go } =
    useStore()
  const treatment = useTreatment()
  const district = districtByKey(profile.districtKey) ?? DISTRICTS[0]
  // Reachable from My List, where the saved clinic may sit in another district.
  const clinic = clinicById(selectedClinicId) ?? clinicsIn(district.key)[0]
  const chosenDay = DAYS.find((d) => d.num === day) ?? DAYS[1]

  return (
    <div style={{ flex: 1, padding: '32px 32px 80px' }}>
      <Shell width={1100}>
        <BackLink onClick={() => go('clinics')}>Clinics in {district.name}</BackLink>

        <div
          style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >
          <Card style={{ padding: 32, borderRadius: 22 }}>
            <Display size={30}>Book a consultation</Display>

            <div style={{ marginTop: 28 }}>
              <FieldLabel>PREFERRED DAY</FieldLabel>
            </div>
            <div
              style={{
                marginTop: 14,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(104px,1fr))',
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
                      {d.dow}
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
              <FieldLabel>TIME</FieldLabel>
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {TIMES.map((slot) => {
                const on = slot.open && slot.label === time
                return (
                  <Pressable
                    key={slot.label}
                    onClick={() => setTime(slot.label)}
                    disabled={!slot.open}
                    className={slot.open ? 'opt' : undefined}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 10,
                      fontSize: 14,
                      background: slot.open ? (on ? C.chip : C.surface) : C.surfaceMuted,
                      border: `1px solid ${slot.open ? (on ? C.blue : C.borderStrong) : C.rule}`,
                      color: slot.open ? (on ? C.blue : C.bodyFaint) : C.faint,
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    {slot.label}
                  </Pressable>
                )
              })}
            </div>

            <Well style={{ marginTop: 30 }}>
              <div
                style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: C.ink }}
              >
                Final confirmation happens with the doctor
              </div>
              <Prose size={14.5} color={C.body} style={{ marginTop: 10 }}>
                The reading is a starting point. At the consultation a dermatologist reviews it with
                you and adjusts the plan — you can also leave without booking anything.
              </Prose>
            </Well>

            <Note style={{ marginTop: 20, fontSize: 13.5, lineHeight: 1.75 }}>
              Open weekdays 10:00–19:00, Saturday 10:00–15:00. Change or cancel until the day
              before. Bring your passport for the tourist tax refund.
            </Note>
          </Card>

          <Card
            style={{
              position: 'sticky',
              top: 92,
              padding: 28,
              border: `1px solid ${C.borderBlue}`,
              boxShadow: SHADOW_PANEL,
            }}
          >
            <Eyebrow size={11.5} spacing=".14em">
              YOUR SELECTION
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
              {clinic.distanceLabel} · English-speaking staff
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
                  left: `${treatment.shortName} · per session`,
                  right: won(clinic.priceByTreatmentId[treatment.id]),
                  strong: true,
                },
                { left: 'Consultation', right: 'Free', blue: true },
                { left: 'Appointment', right: `${chosenDay.dow} ${chosenDay.num} Sep, ${time}` },
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
                Request this appointment
              </PrimaryButton>
            </div>
            <Note style={{ marginTop: 12, textAlign: 'center', fontSize: 12.5 }}>
              No deposit. Pay at the clinic after your consultation.
            </Note>
          </Card>
        </div>
      </Shell>
    </div>
  )
}
