/**
 * 14 Community.
 *
 * The filters are the store's, keyed on ids rather than on the labels people see —
 * a feed that filtered on "Laser Toning" would stop working the day that string is
 * translated. Posts written here are appended to the feed, which is why the
 * composer's submit does something rather than closing politely.
 */
import { Icon, PATHS } from '../components/Icons'
import {
  Card,
  Display,
  Note,
  Pressable,
  Shell,
  Tag,
} from '../components/primitives'
import { columns, screenPadding, useNarrow } from '../components/layout'
import { C, FONT_DISPLAY, FONT_MONO_TEXT } from '../theme'
import { useCopy, useLang } from '../i18n'
import { useCatalog } from '../i18n/catalog'
import { COMMUNITY } from '../i18n/community'
import {
  FILTER_ALL,
  FILTER_DISTRICT_PREFIX,
  FILTER_TREATMENT_PREFIX,
  FILTER_VERIFIED,
  USER_POST_PREFIX,
  useStore,
} from '../state/store'

export function Community() {
  const { communityFilterId, setCommunityFilter, communityFeed, openModal } = useStore()
  const { lang } = useLang()
  const copy = useCopy(COMMUNITY)
  const cat = useCatalog()
  const narrow = useNarrow()

  // Wide tracking is a Latin caps device. Hangul, kana and hanzi spread that far read
  // as loose characters rather than a label, so they keep only a hint of it.
  const tracking = (latin: string) => (lang === 'en' ? latin : '.04em')

  const filters = [
    { id: FILTER_ALL, label: copy.filterAll },
    { id: FILTER_VERIFIED, label: copy.filterVerified },
    ...cat.TREATMENTS.slice(0, 3).map((t) => ({
      id: `${FILTER_TREATMENT_PREFIX}${t.id}`,
      label: t.shortName,
    })),
    ...cat.DISTRICTS.map((d) => ({ id: `${FILTER_DISTRICT_PREFIX}${d.key}`, label: d.name })),
  ]

  // The store filters the English catalogue's posts on ids. Each seeded post is
  // re-read here in the page's language by that id; a post written in the composer
  // keeps its own text and tags, under a byline the page writes in its language.
  const seedById = new Map(cat.SEED_POSTS.map((p) => [p.id, p]))
  const posts = communityFeed().map((p) =>
    p.id.startsWith(USER_POST_PREFIX)
      ? { ...p, author: copy.you, initials: copy.youInitials, meta: copy.justNow }
      : (seedById.get(p.id) ?? p),
  )

  // The badge's key. Under the filters on a laptop; after the feed on a phone,
  // where above it would push the first post off the screen.
  const verifiedNote = (
    <div
      style={{
        marginTop: narrow ? 0 : 26,
        padding: 18,
        borderRadius: 14,
        background: C.surfaceMuted,
        border: `1px solid ${C.rule}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ display: 'flex', color: C.blue }}>
          <Icon path={PATHS.verified} size={19} />
        </span>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13.5, fontWeight: 600, color: C.ink }}>
          {copy.verifiedTitle}
        </div>
      </div>
      <div style={{ marginTop: 9, fontSize: 12.5, lineHeight: 1.7, color: C.bodyMuted }}>
        {copy.verifiedBody}
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, padding: screenPadding(narrow, 44, 80) }}>
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
            <Display size={34}>{copy.title}</Display>
            <Note style={{ marginTop: 10, fontSize: 15, color: C.bodyMuted }}>
              {copy.subtitle(posts.length)}
            </Note>
          </div>
          <Pressable
            onClick={() => openModal('composer')}
            className="btn-primary"
            style={{
              width: narrow ? '100%' : undefined,
              justifyContent: 'center',
              height: 50,
              padding: '0 24px',
              borderRadius: 11,
              background: C.blue,
              color: '#fff',
              fontFamily: FONT_DISPLAY,
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 10px 22px rgba(46,90,172,.22)',
            }}
          >
            <span style={{ fontSize: 19, fontWeight: 400, lineHeight: 1 }}>+</span>
            <span>{copy.writePost}</span>
          </Pressable>
        </div>

        <div
          style={{
            marginTop: narrow ? 20 : 28,
            display: 'grid',
            gridTemplateColumns: columns(narrow, '230px minmax(0,1fr)'),
            gap: narrow ? 18 : 32,
            alignItems: 'start',
          }}
        >
          <div style={{ position: narrow ? 'static' : 'sticky', top: 92, minWidth: 0 }}>
            {narrow ? null : (
              <div
                style={{ fontSize: 12, fontWeight: 600, letterSpacing: tracking('.1em'), color: C.muted }}
              >
                {copy.filtersHeading}
              </div>
            )}
            {/* A phone scrolls the filters sideways as one row of chips. */}
            <div
              style={
                narrow
                  ? {
                      display: 'flex',
                      gap: 8,
                      margin: '0 -16px',
                      padding: '0 16px',
                      overflowX: 'auto',
                    }
                  : { marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }
              }
            >
              {filters.map((f) => {
                const on = f.id === communityFilterId
                return (
                  <Pressable
                    key={f.id}
                    onClick={() => setCommunityFilter(f.id)}
                    className="chip-soft"
                    style={{
                      padding: '11px 14px',
                      borderRadius: 9,
                      fontSize: 13.5,
                      fontWeight: on ? 600 : 500,
                      textAlign: 'left',
                      flex: 'none',
                      whiteSpace: narrow ? 'nowrap' : undefined,
                      border: narrow ? `1px solid ${on ? C.borderBlue : C.border}` : undefined,
                      background: on ? C.chip : narrow ? C.surface : 'transparent',
                      color: on ? C.blue : C.bodyFaint,
                    }}
                  >
                    {f.label}
                  </Pressable>
                )
              })}
            </div>


            {narrow ? null : verifiedNote}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))',
              gap: 18,
              alignItems: 'start',
            }}
          >
            {posts.map((p) => (
              <Card key={p.id} className="card-hover" style={{ padding: narrow ? '20px 18px' : 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      flex: 'none',
                      borderRadius: '50%',
                      background: C.chipAlt,
                      border: `1px solid ${C.borderBlue}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: FONT_DISPLAY,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.blue,
                    }}
                  >
                    {p.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                    >
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: 15,
                          fontWeight: 600,
                          color: C.ink,
                        }}
                      >
                        {p.author}
                      </div>
                      {p.verified ? (
                        <div
                          style={{
                            flex: 'none',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: 7,
                            background: C.chip,
                          }}
                        >
                          <span style={{ display: 'flex', color: C.blue }}>
                            <Icon path={PATHS.verified} size={13} weight={1.7} />
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '.06em',
                              color: C.blue,
                            }}
                          >
                            {copy.verifiedBadge}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12.5, color: C.muted }}>{p.meta}</div>
                  </div>
                </div>

                {/*
                  Only the seeded posts carry a picture, and even theirs is a labelled
                  placeholder. A post written here gets no photo frame, because the
                  composer cannot attach one.
                */}
                {p.id.startsWith(USER_POST_PREFIX) ? null : (
                  <div
                    style={{
                      marginTop: 18,
                      height: 164,
                      borderRadius: 14,
                      background: p.verified
                        ? 'linear-gradient(150deg,#EFF4FB,#D8E4F5)'
                        : 'linear-gradient(150deg,#F5F7FA,#E4E9F1)',
                      border: `1px solid ${C.rule}`,
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        letterSpacing: tracking('.1em'),
                        color: 'rgba(20,32,58,.45)',
                        fontFamily: FONT_MONO_TEXT,
                      }}
                    >
                      {copy.photoPlaceholder}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 16, fontSize: 14.5, lineHeight: 1.7, color: C.body }}>
                  {p.text}
                </div>

                <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Tag>{p.treatmentTag}</Tag>
                  <Tag bg={C.chipAlt} color={C.bodyFaint} border={C.border}>
                    {p.clinicTag}
                  </Tag>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 16,
                    borderTop: `1px solid ${C.borderFaint}`,
                    display: 'flex',
                    gap: 22,
                    alignItems: 'center',
                    fontSize: 13.5,
                    color: C.bodyMuted,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ display: 'flex', color: C.blueMid }}>
                      <Icon path={PATHS.like} size={18} />
                    </span>
                    <span>{p.likes}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ display: 'flex', color: C.blueMid }}>
                      <Icon path={PATHS.comment} size={18} />
                    </span>
                    <span>{p.comments}</span>
                  </div>
                </div>
              </Card>
            ))}

            {posts.length === 0 ? (
              <div
                style={{
                  padding: '40px 24px',
                  borderRadius: 18,
                  border: '1px dashed #D5DCE7',
                  background: C.surfaceFaint,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 14, color: C.muted }}>{copy.empty}</div>
              </div>
            ) : null}
          </div>

          {narrow ? verifiedNote : null}
        </div>
      </Shell>
    </div>
  )
}
