/**
 * H7 Hospitals nearby for the chosen area's department.
 *
 * The skin clinic list's layout — map on one side, numbered cards on the other,
 * district switch in the header — with the hospitals that run the department first.
 * The map is the same framed page, handed this list's pins so its numbers match
 * the cards'. The listings are samples, and the screen says so.
 */
import { useEffect } from 'react'
import { Icon, PATHS } from '../../components/Icons'
import { BackLink, Card, Display, Note, Pressable, Shell, Tag } from '../../components/primitives'
import { columns, screenPadding, useNarrow } from '../../components/layout'
import { C, FONT_DISPLAY, HEALTH } from '../../theme'
import { CONDITIONS } from '../../health/items'
import { hospitalsFor } from '../../health/hospitals'
import { useCopy, useLang } from '../../i18n'
import { useCatalog } from '../../i18n/catalog'
import { HEALTH_COPY } from '../../i18n/health'
import { useHealth } from '../../state/health'
import { useStore } from '../../state/store'

export function HealthClinics() {
  const { profile, setDistrict, go } = useStore()
  const { report, selected } = useHealth()
  const { lang } = useLang()
  const cat = useCatalog()
  const all = useCopy(HEALTH_COPY)
  const copy = all.clinics
  const narrow = useNarrow()

  const condition = report?.conditions.find((c) => c.id === selected) ?? report?.conditions[0] ?? null
  useEffect(() => {
    if (!condition) go('health-form')
  }, [condition, go])
  if (!condition) return <div style={{ flex: 1 }} />

  const department = CONDITIONS[condition.id].department
  const dept = all.departments[department]
  const district = cat.districtByKey(profile.districtKey) ?? cat.DISTRICTS[0]
  const hospitals = hospitalsFor(district.key, department)
  const pins = hospitals.map((h) => `${h.lat},${h.lng}`).join(';')

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 32, 60) }}>
      <Shell>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <BackLink onClick={() => go('health-detail')}>{all.conditions[condition.id]}</BackLink>
            <Display size={32} style={{ marginTop: 14 }}>
              {copy.title(district.name)}
            </Display>
            <div style={{ marginTop: 8, fontSize: 14.5, color: C.bodyMuted }}>{copy.subtitle(dept)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, width: narrow ? '100%' : undefined }}>
            {cat.DISTRICTS.map((d) => {
              const on = d.key === district.key
              return (
                <Pressable
                  key={d.key}
                  pressed={on}
                  onClick={() => setDistrict(d.key)}
                  className="opt"
                  style={{
                    flex: narrow ? 1 : undefined,
                    padding: '9px 16px',
                    borderRadius: 10,
                    fontSize: 14,
                    background: on ? C.chip : C.surface,
                    border: `1px solid ${on ? C.blue : C.borderStrong}`,
                    color: on ? C.blue : C.bodyFaint,
                    fontWeight: on ? 600 : 400,
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
            marginTop: narrow ? 20 : 28,
            display: 'grid',
            gridTemplateColumns: columns(narrow, 'minmax(0,1.1fr) minmax(0,1fr)'),
            gap: narrow ? 18 : 28,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              position: narrow ? 'relative' : 'sticky',
              top: narrow ? undefined : 92,
              borderRadius: narrow ? 16 : 20,
              overflow: 'hidden',
              border: `1px solid ${C.border}`,
              background: '#EEF1F5',
              height: narrow ? 280 : 600,
            }}
          >
            <iframe
              key={`${district.key}:${lang}:${pins}`}
              src={`${import.meta.env.BASE_URL}map-blue.html?d=${district.key}&lang=${lang}&pins=${encodeURIComponent(pins)}`}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {hospitals.map((h, i) => {
              const match = h.departments.includes(department)
              return (
                <Card key={h.id} style={{ padding: narrow ? 16 : 20, opacity: match ? 1 : 0.78 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        flex: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: i === 0 ? C.blue : match ? C.blueMid : C.muted,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.ink }}>
                        {h.name[lang]}
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {match ? (
                          <Tag bg={HEALTH.normalBg} color={HEALTH.normal}>
                            {copy.match(dept)}
                          </Tag>
                        ) : null}
                        {h.checkupCenter ? <Tag>{copy.checkup}</Tag> : null}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.7, color: C.bodyMuted }}>
                        <div>{copy.walk(h.walkMinutes, h.meters)}</div>
                        <div>{copy.hours(h.weekdayHours, h.saturdayHours)}</div>
                        <div style={{ color: C.muted }}>{lang === 'ko' ? h.address.ko : h.address.en}</div>
                      </div>
                    </div>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${h.lat}&mlon=${h.lng}#map=18/${h.lat}/${h.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost"
                      style={{
                        flex: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 9,
                        border: `1px solid ${C.border}`,
                        fontSize: 13,
                        color: C.blue,
                        textDecoration: 'none',
                      }}
                    >
                      <Icon path={PATHS.pin} size={15} />
                      {copy.directions}
                    </a>
                  </div>
                </Card>
              )
            })}
            <Note style={{ marginTop: 4 }}>{copy.sample}</Note>
          </div>
        </div>
      </Shell>
    </div>
  )
}
