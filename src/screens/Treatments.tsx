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
import { TREATMENT_FLOW } from '../i18n/treatmentFlow'
import { treatmentImage } from '../data/treatmentImages'
import { useStrings } from '../data/strings'
import { useCopy, useLang } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { TREATMENT_LIST } from '../i18n/treatments'
import { matchesLeadingConcern } from '../analysis/treatmentRecommendations'
import { TREATMENT_CONCERN_COPY } from '../i18n/treatmentConcerns'
import { classificationFor, concernTier, filterTreatments, TREATMENT_CONCERNS, CLASSIFICATION_REVIEWED_AT, CLASSIFICATION_SOURCES, type ConcernFilter } from '../data/treatmentConcerns'
import { rankedCategories } from '../analysis/types'
import { useStore } from '../state/store'
import './Treatments.css'

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
  const { UI } = useStrings()
  const { lang } = useLang()
  const concerns = useCopy(TREATMENT_CONCERN_COPY)
  const flow = useCopy(TREATMENT_FLOW)
  const copy = useCopy(TREATMENT_LIST)
  const narrow = useNarrow()
  const [filter, setFilter] = useState<ConcernFilter>(ALL)

  const matched = recommendations.length > 0
  // The store ranks the English objects; the cards read the same ids in this language.
  const list: Treatment[] = matched ? recommendations.map((t) => cat.treatment(t)) : cat.TREATMENTS
  const priority = analysis ? rankedCategories(analysis).slice(0, 2).map((row) => row.category) : []
  const filters = [...new Set([...priority, ...TREATMENT_CONCERNS])]
  const shown = filterTreatments(list, filter)
  const related = matched ? list.find((t) => matchesLeadingConcern(t.id, analysis))?.id : undefined
  const sourceIds = [...new Set(shown.flatMap((t) => classificationFor(t.id).sourceIds))]

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
            <Display size={34}>{matched ? UI.treatmentsTitle : flow.browse}</Display>
            <div style={{ marginTop: 10, fontSize: 15, color: C.bodyMuted }}>
              {concerns.intro}
            </div>
          </div>

        </div>

        <section className="treatment-concerns" aria-label={concerns.heading}>
          <h2>{concerns.heading}</h2>
          <div className="treatment-concern-filters">
            {([ALL, ...filters] as ConcernFilter[]).map((key) => {
              const on = filter === key
              const count = filterTreatments(list, key).length
              return (
                <Pressable key={key} onClick={() => setFilter(key)} pressed={on} className="treatment-concern-filter opt"
                  style={{ background: on ? C.blue : C.surface, borderColor: on ? C.blue : C.border, color: on ? '#fff' : C.body }}>
                  <span>{key === ALL ? copy.all : concerns.labels[key]}</span>
                  <span className="concern-count">{count}</span>
                  {key !== ALL && priority.some((p) => p === key) && <span className="concern-priority">{concerns.priority}</span>}
                </Pressable>
              )
            })}
          </div>
          <div className="treatment-concern-description" aria-live="polite">
            <strong>{filter === ALL ? copy.all : concerns.labels[filter]} · {concerns.count(shown.length)}</strong>
            <p>{filter === ALL ? concerns.allDescription : concerns.descriptions[filter]}</p>
            {filter === ALL && matched && !related && <p>{concerns.topNeedsConsultation}</p>}
          </div>
        </section>
        {shown.length === 0 && <Card style={{ marginTop: 24, padding: 28 }}>
          <h3 style={{ margin: '0 0 12px', color: C.ink }}>{concerns.noMatch}</h3>
          <Pressable onClick={() => setFilter(ALL)} style={{ color: C.blue }}>{concerns.browseAll} →</Pressable>
        </Card>}

        <div
          className="treatment-grid"
          style={{
            marginTop: narrow ? 22 : 30,
          }}
        >
          {shown.map((t, i) => {
            const saved = savedTreatmentIds.includes(t.id)
            const top = filter === ALL && t.id === related
            const image = treatmentImage(t.id)
            const rule = classificationFor(t.id)
            const conditional = rule.manualOnly || (filter !== ALL && concernTier(t.id, filter) === 2)
            const tags = [...new Set([...(filter !== ALL ? [filter] : []), ...rule.primary])].slice(0, 2)
            return (
              <Card
                key={t.id}
                className="card-lift treatment-card"
                style={{
                  border: `1px solid ${top ? C.borderBlue : C.border}`,
                }}
              >
                <div className="treatment-photo" style={{ background: C.surfaceMuted }}>
                  <Pressable
                    onClick={() => open(t.id)}
                    label={`${t.name} · ${copy.details}`}
                    className="treatment-photo-open"
                  >
                    <img
                      src={image.src}
                      alt=""
                      width={1600}
                      height={534}
                      loading={i < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      style={{
                        objectPosition: image.position,
                        objectFit: image.fit,
                        transform: image.scale ? `scale(${image.scale})` : undefined,
                        transformOrigin: image.position,
                      }}
                    />
                  </Pressable>
                  {top ? (
                    <div style={{ position: 'absolute', top: 14, left: 14, maxWidth: 'calc(100% - 82px)', pointerEvents: 'none' }}>
                      <Tag bg={C.blue} color="#fff" bold>
                        {concerns.related}
                      </Tag>
                    </div>
                  ) : null}
                  <Pressable
                    onClick={() => toggleSavedTreatment(t.id)}
                    label={saved ? copy.remove(t.name) : copy.save(t.name)}
                    pressed={saved}
                    className="opt"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: saved ? C.chip : C.surface,
                      border: `1px solid ${saved ? C.borderBlue : C.border}`,
                      color: saved ? C.blue : C.bodyMuted,
                    }}
                  >
                    <Icon path={saved ? PATHS.check : PATHS.bookmark} size={19} weight={saved ? 2 : 1.5} />
                  </Pressable>
                </div>

                <div className="treatment-body">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {tags.map((tag) => <Tag key={tag}>{concerns.labels[tag]}</Tag>)}
                    {conditional && <Tag bg="#FFF5E5" color="#875B19">{concerns.conditional}</Tag>}
                  </div>
                  <div lang="ko" style={{ marginBottom: 8, fontSize: 12, color: C.bodyMuted }}>{t.source?.category}</div>
                  <Pressable
                    onClick={() => open(t.id)}
                    style={{ display: 'block', textAlign: 'left', flex: 1 }}
                  >
                    <div
                      className="treatment-title"
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 600,
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

                  <details className="treatment-classification-note">
                    <summary>{concerns.sources}</summary>
                    <p lang="ko">{rule.note}</p>
                    {rule.sourceIds.map((id) => <a key={id} href={CLASSIFICATION_SOURCES[id].url} target="_blank" rel="noreferrer">{CLASSIFICATION_SOURCES[id].title} ↗</a>)}
                  </details>
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 18,
                      borderTop: `1px solid ${C.borderFaint}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 16,
                    }}
                  >
                    <div className="treatment-facts">
                      {(
                        [
                          {
                            label: flow.referencePrice,
                            value: cat.priceRangeIn(profile.districtKey, t.id),
                            note: t.source?.packages.some((p) => p.vatExcluded) ? flow.vat : undefined,
                          },
                        ] as { label: string; value: string; note?: string }[]
                      ).map((cell) => (
                        <div key={cell.label}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              letterSpacing: '.08em',
                              color: C.bodyMuted,
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
                            <div style={{ marginTop: 3, fontSize: 12, color: C.bodyMuted }}>
                              {cell.note}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <Pressable
                      onClick={() => open(t.id)}
                      style={{ fontSize: 13.5, fontWeight: 600, color: C.blue, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      {copy.details}<Icon path={PATHS.arrow} size={18} />
                    </Pressable>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <details className="treatment-source-list">
          <summary>{concerns.sources} · {concerns.reviewed(CLASSIFICATION_REVIEWED_AT)}</summary>
          <p>{concerns.sourcesNote}</p>
          {lang !== 'ko' && <p>{concerns.languageNote}</p>}
          <ul>{sourceIds.map((id) => <li key={id}><a href={CLASSIFICATION_SOURCES[id].url} target="_blank" rel="noreferrer">{CLASSIFICATION_SOURCES[id].title} ↗</a></li>)}</ul>
        </details>
        <Note style={{ marginTop: 26, maxWidth: 720 }}>{flow.priceNote}</Note>
      </Shell>
    </div>
  )
}
