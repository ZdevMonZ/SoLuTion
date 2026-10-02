/**
 * 14 Community.
 *
 * The filters are the store's, keyed on ids rather than on the labels people see —
 * a feed that filtered on "Laser Toning" would stop working the day that string is
 * translated. Posts written here are appended to the feed, which is why the
 * composer's submit does something rather than closing politely.
 */
import { Icon, PATHS } from '../components/Icons'
import { Card, Display, Note, Pressable, Shell, Tag } from '../components/primitives'
import { C, FONT_DISPLAY, FONT_MONO } from '../theme'
import { DISTRICTS, TREATMENTS } from '../data/catalog'
import { LANG_LABEL } from '../data/languages'
import {
  FILTER_ALL,
  FILTER_DISTRICT_PREFIX,
  FILTER_TREATMENT_PREFIX,
  FILTER_VERIFIED,
  useStore,
} from '../state/store'

const FILTERS = [
  { id: FILTER_ALL, label: 'All posts' },
  { id: FILTER_VERIFIED, label: 'Verified only' },
  ...TREATMENTS.slice(0, 3).map((t) => ({
    id: `${FILTER_TREATMENT_PREFIX}${t.id}`,
    label: t.shortName,
  })),
  ...DISTRICTS.map((d) => ({ id: `${FILTER_DISTRICT_PREFIX}${d.key}`, label: d.name })),
]

export function Community() {
  const { communityFilterId, setCommunityFilter, communityFeed, openModal } = useStore()
  const posts = communityFeed()

  return (
    <div style={{ flex: 1, padding: '44px 32px 80px' }}>
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
            <Display size={34}>Community</Display>
            <Note style={{ marginTop: 10, fontSize: 15, color: C.bodyMuted }}>
              Posts in {LANG_LABEL} · {posts.length} shown
            </Note>
          </div>
          <Pressable
            onClick={() => openModal('composer')}
            className="btn-primary"
            style={{
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
            <span>Write a post</span>
          </Pressable>
        </div>

        <div
          style={{
            marginTop: 28,
            display: 'grid',
            gridTemplateColumns: '230px minmax(0,1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >
          <div style={{ position: 'sticky', top: 92 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: C.muted }}>
              FILTERS
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FILTERS.map((f) => {
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
                      background: on ? C.chip : 'transparent',
                      color: on ? C.blue : C.bodyFaint,
                    }}
                  >
                    {f.label}
                  </Pressable>
                )
              })}
            </div>

            <div
              style={{
                marginTop: 26,
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
                <div
                  style={{ fontFamily: FONT_DISPLAY, fontSize: 13.5, fontWeight: 600, color: C.ink }}
                >
                  Verified Visit
                </div>
              </div>
              <div style={{ marginTop: 9, fontSize: 12.5, lineHeight: 1.7, color: C.bodyMuted }}>
                Shown on posts from users who booked that clinic through Solution.
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
              gap: 18,
              alignItems: 'start',
            }}
          >
            {posts.map((p) => (
              <Card key={p.id} className="card-hover" style={{ padding: 24 }}>
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
                            VERIFIED VISIT
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
                {p.id.startsWith('post_user_') ? null : (
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
                        letterSpacing: '.1em',
                        color: 'rgba(20,32,58,.45)',
                        fontFamily: FONT_MONO,
                      }}
                    >
                      PHOTO PLACEHOLDER
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
                <div style={{ fontSize: 14, color: C.muted }}>
                  No posts under this filter yet. Yours would be the first.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Shell>
    </div>
  )
}
