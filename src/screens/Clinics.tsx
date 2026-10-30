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
import { columns, screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY } from '../theme'
import { cheapestPrice, won } from '../data/catalog'
import type { ClinicBadge } from '../data/catalog'
import { useStrings } from '../data/strings'
import { useCopy, useLang } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { CLINIC_LIST } from '../i18n/clinics'
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
  const { lang } = useLang()
  const cat = useCatalog()
  const { clinicBadgeLabel } = useStrings()
  const copy = useCopy(CLINIC_LIST)
  const treatment = cat.treatment(useTreatment())
  const district = cat.districtByKey(profile.districtKey) ?? cat.DISTRICTS[0]
  const narrow = useNarrow()

  const cheapest = cheapestPrice(district.key, treatment.id)
  const clinics = cat.clinicsIn(district.key)
    .map((clinic, index) => ({ clinic, index, price: clinic.priceByTreatmentId[treatment.id] }))
    .sort((a, b) => a.price - b.price)

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 32, 60) }}>
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
              {copy.title(district.name)}
            </Display>
            <div style={{ marginTop: 8, fontSize: 14.5, color: C.bodyMuted }}>
              {copy.subtitle(treatment.shortName)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: narrow ? 8 : 9, width: narrow ? '100%' : undefined }}>
            {cat.DISTRICTS.map((d) => {
              const on = d.key === district.key
              return (
                <Pressable
                  key={d.key}
                  onClick={() => setDistrict(d.key)}
                  className="opt"
                  style={{
                    padding: narrow ? '10px 6px' : '10px 16px',
                    flex: narrow ? 1 : undefined,
                    textAlign: 'center',
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
            marginTop: narrow ? 20 : 26,
            display: 'grid',
            gridTemplateColumns: columns(narrow, 'minmax(0,1.15fr) minmax(0,1fr)'),
            gap: narrow ? 16 : 24,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              // On a phone the map heads the list at a third of the screen, not
              // a sticky full-height panel the list would scroll under.
              position: narrow ? 'relative' : 'sticky',
              top: narrow ? undefined : 92,
              borderRadius: narrow ? 16 : 20,
              overflow: 'hidden',
              border: `1px solid ${C.border}`,
              background: '#EEF1F5',
              height: narrow ? 280 : 620,
            }}
          >
            {/*
              Keyed on the district and the language so switching either re-mounts
              the frame: the map reads both from the query string once, at load.
            */}
            <iframe
              key={`${district.key}:${lang}`}
              src={`${import.meta.env.BASE_URL}map-blue.html?d=${district.key}&lang=${lang}`}
              title={copy.mapTitle(district.name)}
              style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                left: narrow ? 12 : 18,
                top: narrow ? 12 : 18,
                padding: narrow ? '7px 12px' : '9px 15px',
                borderRadius: 10,
                background: 'rgba(255,255,255,.94)',
                border: `1px solid ${C.border}`,
                fontSize: 13,
                fontWeight: 600,
                color: C.ink,
                pointerEvents: 'none',
              }}
            >
              {copy.mapLabel(district.name)}
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
                  style={{ padding: narrow ? '18px 16px' : 24, borderRadius: 18 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: narrow ? 12 : 16 }}>
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
                            fontSize: narrow ? 16.5 : 18,
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
                        label={saved ? copy.remove(clinic.name) : copy.save(clinic.name)}
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
                          {copy.lowest}
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
            <Note style={{ fontSize: 12.5 }}>{copy.sampleNote}</Note>
          </div>
        </div>
      </Shell>
    </div>
  )
}
