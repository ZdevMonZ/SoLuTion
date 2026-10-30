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
import {
  Card,
  Display,
  Note,
  Pressable,
  Shell,
  Tag,
} from '../components/primitives'
import { screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY } from '../theme'
import type { Treatment } from '../data/catalog'
import { useStrings } from '../data/strings'
import { useCopy } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { TREATMENT_LIST } from '../i18n/treatments'
import { leadCategory } from '../analysis/ranking'
import { SKIN_CATEGORIES, rankedCategories } from '../analysis/types'
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
  const cat = useCatalog()
  const { UI, categoryLabel } = useStrings()
  const copy = useCopy(TREATMENT_LIST)
  const narrow = useNarrow()
  const [filter, setFilter] = useState<string>(ALL)

  const matched = recommendations.length > 0
  // The store ranks the English objects; the cards read the same ids in this language.
  const list: Treatment[] = matched ? recommendations.map((t) => cat.treatment(t)) : cat.TREATMENTS
  const district = cat.districtByKey(profile.districtKey)

  // The chips are the two areas this reading actually flagged — not a fixed pair,
  // which would offer "Pigmentation" to someone whose pigmentation is fine.
  // Browsing without a reading, every area gets one: with nineteen treatments, a
  // way in by concern is most of what the list needs.
  const leads: SkinCategory[] = analysis
    ? rankedCategories(analysis)
        .slice(0, 2)
        .map((row) => row.category)
    : SKIN_CATEGORIES.filter((c) => cat.TREATMENTS.some((t) => t.targets.includes(c)))
  const shown = filter === ALL ? list : list.filter((t) => t.targets.includes(filter as SkinCategory))
  const line = matched
    ? UI.treatmentsSubtitle(leads[0] ? categoryLabel(leads[0]) : null, list.length)
    : copy.browseSubtitle(list.length)

  const open = (id: string) => {
    selectTreatment(id)
    go('detail')
  }

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 44, 80) }}>
      <Shell>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: narrow ? 18 : 24,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Display size={34}>{UI.treatmentsTitle}</Display>
            <div style={{ marginTop: 10, fontSize: 15, color: C.bodyMuted }}>
              {district ? copy.inDistrict(line, district.name) : line}
            </div>
          </div>

          {leads.length > 0 ? (
            // A phone scrolls the filters sideways rather than squeezing them.
            <div
              style={{
                display: 'flex',
                gap: narrow ? 8 : 10,
                alignItems: 'center',
                ...(narrow
                  ? { width: 'calc(100% + 32px)', margin: '0 -16px', padding: '0 16px', overflowX: 'auto' }
                  : null),
              }}
            >
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
                      flex: 'none',
                      whiteSpace: 'nowrap',
                      background: on ? C.chip : C.surface,
                      border: `1px solid ${on ? C.blue : C.borderStrong}`,
                      color: on ? C.blue : C.bodyFaint,
                    }}
                  >
                    {key === ALL ? copy.all : categoryLabel(key as SkinCategory)}
                  </Pressable>
                )
              })}
            </div>
          ) : null}
        </div>

        <div
          style={{
            marginTop: narrow ? 22 : 30,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(336px,100%),1fr))',
            gap: narrow ? 14 : 20,
          }}
        >
          {shown.map((t, i) => {
            const saved = savedTreatmentIds.includes(t.id)
            const top = matched && filter === ALL && i === 0
            // The area that earned the card its place (or the one being filtered
            // on), so the chip answers the question the position raises.
            const chip =
              filter !== ALL
                ? (filter as SkinCategory)
                : (leadCategory(t.targets, matched ? analysis : null) ?? t.targets[0])
            return (
              <Card
                key={t.id}
                className="card-lift"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: narrow ? 20 : 26,
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
                    <Tag>{categoryLabel(chip)}</Tag>
                  </div>
                  <Pressable
                    onClick={() => toggleSavedTreatment(t.id)}
                    label={saved ? copy.remove(t.name) : copy.save(t.name)}
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
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', gap: narrow ? 20 : 26 }}>
                    {(
                      [
                        {
                          label: UI.priceRange,
                          value: cat.priceRangeIn(profile.districtKey, t.id),
                          note: t.priceBasis ? copy.priceBasis(t.priceBasis) : undefined,
                        },
                        { label: UI.perSession, value: t.duration },
                      ] as { label: string; value: string; note?: string }[]
                    ).map((cell) => (
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
                        {cell.note ? (
                          <div style={{ marginTop: 3, fontSize: 12, color: C.muted }}>
                            {cell.note}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <Pressable
                    onClick={() => open(t.id)}
                    style={{ fontSize: 13.5, fontWeight: 600, color: C.blue, whiteSpace: 'nowrap' }}
                  >
                    {copy.details} →
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
