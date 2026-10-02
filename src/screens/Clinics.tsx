/**
 * 10 Clinic list.
 *
 * Cards are ordered by what this treatment costs at each clinic, cheapest first,
 * because that is the question the screen exists to answer. The pin number is the
 * clinic's own and does not move with the sort — it has to keep matching the
 * numbered pin on the map beside it.
 */
import { Icon, PATHS } from '../components/Icons'
import {
  BackLink,
  Card,
  Display,
  Note,
  Pressable,
  Shell,
  Tag,
} from '../components/primitives'
import { C, FONT_DISPLAY } from '../theme'
import {
  DISTRICTS,
  cheapestPrice,
  clinicsIn,
  districtByKey,
  won,
} from '../data/catalog'
import type { ClinicBadge } from '../data/catalog'
import { clinicBadgeLabel } from '../data/strings'
import { useStore, useTreatment } from '../state/store'

/** The pin's colours, by the clinic's own position — the map uses the same table. */
const PINS = [
  'linear-gradient(150deg,#3F6DC4,#2E5AAC)',
  'linear-gradient(150deg,#7FAEE4,#5B8FD4)',
  'linear-gradient(150deg,#7FAEE4,#5B8FD4)',
  'rgba(138,147,166,.95)',
]

const BADGE: Record<ClinicBadge, { bg: string; color: string }> = {
  AVAILABLE: { bg: '#EFF4FB', color: '#2E5AAC' },
  POPULAR: { bg: '#E8F0FA', color: '#4478C6' },
  BUSY: { bg: '#F1F3F6', color: '#7A8296' },
}

export function Clinics() {
  const { profile, savedClinicIds, setDistrict, selectClinic, toggleSavedClinic, go } = useStore()
  const treatment = useTreatment()
  const district = districtByKey(profile.districtKey) ?? DISTRICTS[0]

  const cheapest = cheapestPrice(district.key, treatment.id)
  const clinics = clinicsIn(district.key)
    .map((clinic, index) => ({ clinic, index, price: clinic.priceByTreatmentId[treatment.id] }))
    .sort((a, b) => a.price - b.price)

  return (
    <div style={{ flex: 1, padding: '32px 32px 60px' }}>
      <Shell>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <BackLink onClick={() => go('detail')}>{treatment.name}</BackLink>
            <Display size={32} style={{ marginTop: 14 }}>
              Clinics in {district.name}
            </Display>
            <div style={{ marginTop: 8, fontSize: 14.5, color: C.bodyMuted }}>
              {treatment.shortName} · price per session, lowest first
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            {DISTRICTS.map((d) => {
              const on = d.key === district.key
              return (
                <Pressable
                  key={d.key}
                  onClick={() => setDistrict(d.key)}
                  className="opt"
                  style={{
                    padding: '10px 16px',
                    borderRadius: 9,
                    fontSize: 13.5,
                    fontWeight: 600,
                    background: on ? C.blue : C.surface,
                    border: `1px solid ${on ? C.blue : C.borderStrong}`,
                    color: on ? '#fff' : C.bodyFaint,
                  }}
                >
                  {d.name}
                </Pressable>
              )
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: 92,
              borderRadius: 20,
              overflow: 'hidden',
              border: `1px solid ${C.border}`,
              background: '#EEF1F5',
              height: 620,
            }}
          >
            {/*
              Keyed on the district so switching re-mounts the frame: the map reads
              its district from the query string once, at load.
            */}
            <iframe
              key={district.key}
              src={`/map-blue.html?d=${district.key}`}
              title={`Clinic map — ${district.name}`}
              style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                left: 18,
                top: 18,
                padding: '9px 15px',
                borderRadius: 10,
                background: 'rgba(255,255,255,.94)',
                border: `1px solid ${C.border}`,
                fontSize: 13,
                fontWeight: 600,
                color: C.ink,
                pointerEvents: 'none',
              }}
            >
              {district.name} · 1 km radius
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {clinics.map(({ clinic, index, price }) => {
              const saved = savedClinicIds.includes(clinic.id)
              const badge = BADGE[clinic.badge]
              return (
                <Card
                  key={clinic.id}
                  className="card-lift-soft"
                  style={{ padding: 24, borderRadius: 18 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        flex: 'none',
                        borderRadius: '50%',
                        background: PINS[index] ?? PINS[3],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: FONT_DISPLAY,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#fff',
                      }}
                    >
                      {index + 1}
                    </div>

                    <Pressable
                      onClick={() => {
                        selectClinic(clinic.id)
                        go('booking')
                      }}
                      style={{ flex: 1, minWidth: 0, display: 'block', textAlign: 'left' }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
                      >
                        <div
                          style={{
                            minWidth: 0,
                            fontFamily: FONT_DISPLAY,
                            fontSize: 18,
                            fontWeight: 600,
                            lineHeight: 1.35,
                            color: C.ink,
                          }}
                        >
                          {clinic.name}
                        </div>
                        <Tag bg={badge.bg} color={badge.color} bold>
                          {clinicBadgeLabel(clinic.badge)}
                        </Tag>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 13.5, color: C.muted }}>
                        {clinic.distanceLabel}
                      </div>
                      <div
                        style={{ marginTop: 6, fontSize: 13.5, lineHeight: 1.6, color: C.bodyMuted }}
                      >
                        {clinic.note}
                      </div>
                    </Pressable>

                    <div
                      style={{
                        flex: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 10,
                      }}
                    >
                      <Pressable
                        onClick={() => toggleSavedClinic(clinic.id)}
                        label={saved ? `Remove ${clinic.name} from My List` : `Save ${clinic.name} to My List`}
                        className="opt"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 11,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: saved ? C.chip : C.surface,
                          border: `1px solid ${saved ? C.borderBlue : C.border}`,
                          color: saved ? C.blue : C.muted,
                        }}
                      >
                        <Icon path={PATHS.bookmark} size={19} weight={saved ? 1.6 : 1.5} />
                      </Pressable>
                      {price === cheapest ? (
                        <Tag bg={C.navy} color={C.navyText} bold>
                          LOWEST
                        </Tag>
                      ) : null}
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 18,
                          fontWeight: 600,
                          color: C.blue,
                        }}
                      >
                        {won(price)}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
            <Note style={{ fontSize: 12.5 }}>
              Clinic names and prices are sample data for this prototype.
            </Note>
          </div>
        </div>
      </Shell>
    </div>
  )
}
