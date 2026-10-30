/**
 * 13 My list.
 *
 * Two columns of what the visitor kept: treatments and clinics. Each card goes
 * back to where it was saved from, and the post count beside it is the live one —
 * counted off the same feed the community screen renders, so the two cannot
 * disagree.
 */
import { Icon, PATHS } from '../components/Icons'
import {
  Card,
  Display,
  Note,
  Pressable,
  Shell,
} from '../components/primitives'
import { screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY } from '../theme'
import { won } from '../data/catalog'
import { useCopy } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { MY_LIST } from '../i18n/mylist'
import { FILTER_DISTRICT_PREFIX, FILTER_TREATMENT_PREFIX, useStore, useTreatment } from '../state/store'

interface Row {
  key: string
  title: string
  sub: string
  meta: string
  posts: number
  open: () => void
  remove: () => void
  showPosts: () => void
}

export function MyList() {
  const {
    profile,
    savedTreatmentIds,
    savedClinicIds,
    userPosts,
    selectTreatment,
    selectClinic,
    setDistrict,
    setCommunityFilter,
    toggleSavedTreatment,
    toggleSavedClinic,
    go,
  } = useStore()
  const narrow = useNarrow()
  const copy = useCopy(MY_LIST)
  const cat = useCatalog()
  const treatment = cat.treatment(useTreatment())
  const feed = [...userPosts, ...cat.SEED_POSTS]

  const treatmentRows: Row[] = savedTreatmentIds.flatMap((id) => {
    const t = cat.treatmentById(id)
    if (!t) return []
    return [
      {
        key: id,
        title: t.name,
        sub: t.cardSummary,
        meta: cat.priceRangeIn(profile.districtKey, t.id),
        posts: feed.filter((p) => p.treatmentId === t.id).length,
        open: () => {
          selectTreatment(t.id)
          go('detail')
        },
        remove: () => toggleSavedTreatment(t.id),
        showPosts: () => {
          setCommunityFilter(`${FILTER_TREATMENT_PREFIX}${t.id}`)
          go('community')
        },
      },
    ]
  })

  const clinicRows: Row[] = savedClinicIds.flatMap((id) => {
    const clinic = cat.clinicById(id)
    if (!clinic) return []
    const district = cat.districtByKey(clinic.districtKey)
    return [
      {
        key: id,
        title: clinic.name,
        sub: `${district ? `${district.name} · ` : ''}${clinic.distanceLabel}`,
        meta: `${won(clinic.priceByTreatmentId[treatment.id])} · ${treatment.shortName}`,
        posts: clinic.posts,
        open: () => {
          // The saved clinic may be in another district than the one being browsed;
          // following it there keeps the booking page's clinic and map in step.
          setDistrict(clinic.districtKey)
          selectClinic(clinic.id)
          go('booking')
        },
        remove: () => toggleSavedClinic(clinic.id),
        showPosts: () => {
          setCommunityFilter(`${FILTER_DISTRICT_PREFIX}${clinic.districtKey}`)
          go('community')
        },
      },
    ]
  })

  const columns = [
    {
      title: copy.treatmentsTitle,
      action: copy.browseMore,
      onAction: () => go('treatments'),
      rows: treatmentRows,
      empty: copy.emptyTreatments,
    },
    {
      title: copy.clinicsTitle,
      action: copy.comparePrices,
      onAction: () => go('clinics'),
      rows: clinicRows,
      empty: copy.emptyClinics,
    },
  ]

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 44, 80) }}>
      <Shell>
        <Display size={34}>{copy.title}</Display>
        <Note style={{ marginTop: 10, fontSize: 15, color: C.bodyMuted }}>{copy.subtitle}</Note>

        <div
          style={{
            marginTop: narrow ? 22 : 30,
            display: 'grid',
            gridTemplateColumns: narrow ? 'minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,1fr)',
            gap: narrow ? 32 : 28,
            alignItems: 'start',
          }}
        >
          {columns.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  paddingBottom: 14,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <div
                    style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, color: C.ink }}
                  >
                    {col.title}
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>{col.rows.length}</div>
                </div>
                <Pressable
                  onClick={col.onAction}
                  className="link-quiet"
                  style={{ fontSize: 13, color: C.blue }}
                >
                  {col.action}
                </Pressable>
              </div>

              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {col.rows.map((row) => (
                  <Card key={row.key} className="card-lift-soft" style={{ padding: narrow ? '18px 16px' : 24, borderRadius: 18 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 14,
                      }}
                    >
                      <Pressable
                        onClick={row.open}
                        style={{ minWidth: 0, display: 'block', textAlign: 'left' }}
                      >
                        <div
                          style={{
                            fontFamily: FONT_DISPLAY,
                            fontSize: 18,
                            fontWeight: 600,
                            lineHeight: 1.35,
                            color: C.ink,
                          }}
                        >
                          {row.title}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 13.5,
                            lineHeight: 1.65,
                            color: C.bodyMuted,
                          }}
                        >
                          {row.sub}
                        </div>
                      </Pressable>
                      <Pressable
                        onClick={row.remove}
                        label={copy.remove(row.title)}
                        className="opt"
                        style={{
                          width: 38,
                          height: 38,
                          flex: 'none',
                          borderRadius: 11,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: C.chip,
                          border: `1px solid ${C.borderBlue}`,
                          color: C.blue,
                        }}
                      >
                        <Icon path={PATHS.bookmark} size={19} weight={1.6} />
                      </Pressable>
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 16,
                        borderTop: `1px solid ${C.borderFaint}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 15.5,
                          fontWeight: 600,
                          color: C.blue,
                        }}
                      >
                        {row.meta}
                      </div>
                      <Pressable
                        onClick={row.showPosts}
                        className="tag-hover"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 13px',
                          borderRadius: 9,
                          background: C.chipAlt,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <span style={{ display: 'flex', color: C.blueMid }}>
                          <Icon path={PATHS.comment} size={18} />
                        </span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.bodyFaint }}>
                          {copy.posts(row.posts)}
                        </span>
                      </Pressable>
                    </div>
                  </Card>
                ))}

                {col.rows.length === 0 ? (
                  <div
                    style={{
                      padding: '34px 24px',
                      borderRadius: 18,
                      border: '1px dashed #D5DCE7',
                      background: C.surfaceFaint,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 14, color: C.muted }}>{col.empty}</div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Shell>
    </div>
  )
}
