/**
 * 08 Matched treatments.
 *
 * The order is the reading's, not the catalogue's: `recommend()` in the store sorts
 * every treatment by the urgency of the category it answers. Arriving here without
 * a reading — from the landing page's "Browse treatments" — shows the same list
 * unranked, and says so instead of claiming a match nobody has earned.
 */
import { useState } from 'react'
import { Icon, PATHS } from '../components/Icons'
import { Card, Display, Note, Pressable, Shell, Tag } from '../components/primitives'
import { C, FONT_DISPLAY } from '../theme'
import { TREATMENTS, districtByKey } from '../data/catalog'
import type { Treatment } from '../data/catalog'
import { UI, categoryLabel } from '../data/strings'
import { rankedCategories } from '../analysis/types'
import type { SkinCategory } from '../analysis/types'
import { useStore } from '../state/store'

const ALL = 'all'

export function Treatments() {
  const {
    analysis,
    recommendations,
    profile,
    savedTreatmentIds,
    selectTreatment,
    toggleSavedTreatment,
    go,
  } = useStore()
  const [filter, setFilter] = useState<string>(ALL)

  const matched = recommendations.length > 0
  const list: Treatment[] = matched ? recommendations : TREATMENTS
  const district = districtByKey(profile.districtKey)

  // The chips are the two areas this reading actually flagged — not a fixed pair,
  // which would offer "Pigmentation" to someone whose pigmentation is fine.
  const leads: SkinCategory[] = analysis
    ? rankedCategories(analysis)
        .slice(0, 2)
        .map((row) => row.category)
    : []
  const shown = filter === ALL ? list : list.filter((t) => t.targets.includes(filter as SkinCategory))

  const open = (id: string) => {
    selectTreatment(id)
    go('detail')
  }

  return (
    <div style={{ flex: 1, padding: '44px 32px 80px' }}>
      <Shell>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Display size={34}>{UI.treatmentsTitle}</Display>
            <div style={{ marginTop: 10, fontSize: 15, color: C.bodyMuted }}>
              {matched
                ? `${UI.treatmentsSubtitle(leads[0] ? categoryLabel(leads[0]) : null, list.length)}`
                : `The full list · ${list.length} treatments`}
              {district ? ` · staying in ${district.name}` : ''}
            </div>
          </div>

          {leads.length > 0 ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {[ALL, ...leads].map((key) => {
                const on = filter === key
                return (
                  <Pressable
                    key={key}
                    onClick={() => setFilter(key)}
                    className="opt"
                    style={{
                      padding: '10px 16px',
                      borderRadius: 9,
                      fontSize: 13.5,
                      fontWeight: 500,
                      background: on ? C.chip : C.surface,
                      border: `1px solid ${on ? C.blue : C.borderStrong}`,
                      color: on ? C.blue : C.bodyFaint,
                    }}
                  >
                    {key === ALL ? 'All' : categoryLabel(key as SkinCategory)}
                  </Pressable>
                )
              })}
            </div>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 30,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(336px,1fr))',
            gap: 20,
          }}
        >
          {shown.map((t, i) => {
            const saved = savedTreatmentIds.includes(t.id)
            const top = matched && filter === ALL && i === 0
            return (
              <Card
                key={t.id}
                className="card-lift"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 26,
                  border: `1px solid ${top ? C.borderBlue : C.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {top ? (
                      <Tag bg={C.blue} color="#fff" bold>
                        {UI.topMatch}
                      </Tag>
                    ) : null}
                    <Tag>{categoryLabel(t.targets[0])}</Tag>
                  </div>
                  <Pressable
                    onClick={() => toggleSavedTreatment(t.id)}
                    label={saved ? `Remove ${t.name} from My List` : `Save ${t.name} to My List`}
                    className="opt"
                    style={{
                      width: 40,
                      height: 40,
                      flex: 'none',
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
                </div>

                <Pressable
                  onClick={() => open(t.id)}
                  style={{ display: 'block', textAlign: 'left', flex: 1 }}
                >
                  <div
                    style={{
                      marginTop: 18,
                      fontFamily: FONT_DISPLAY,
                      fontSize: 21,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: C.ink,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.7, color: C.bodyMuted }}
                  >
                    {t.cardSummary}
                  </div>
                </Pressable>

                <div
                  style={{
                    marginTop: 22,
                    paddingTop: 18,
                    borderTop: `1px solid ${C.borderFaint}`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', gap: 26 }}>
                    {[
                      { label: UI.priceRange, value: t.priceRange },
                      { label: UI.perSession, value: t.duration },
                    ].map((cell) => (
                      <div key={cell.label}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '.08em',
                            color: C.muted,
                          }}
                        >
                          {cell.label}
                        </div>
                        <div
                          style={{
                            marginTop: 5,
                            fontFamily: FONT_DISPLAY,
                            fontSize: 16,
                            fontWeight: 600,
                            color: C.ink,
                          }}
                        >
                          {cell.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pressable
                    onClick={() => open(t.id)}
                    style={{ fontSize: 13.5, fontWeight: 600, color: C.blue, whiteSpace: 'nowrap' }}
                  >
                    Details →
                  </Pressable>
                </div>
              </Card>
            )
          })}
        </div>

        <Note style={{ marginTop: 26, maxWidth: 720 }}>{UI.priceNote}</Note>
      </Shell>
    </div>
  )
}
