/**
 * The bar every screen sits under.
 *
 * The nav is always present, including on the funnel screens the design draws
 * without a highlighted tab — nothing is selected there, which is what tells you
 * the reading is not yet a place you have arrived.
 */
import { Icon, PATHS } from './Icons'
import { Pressable } from './primitives'
import { useNarrow } from './layout'
import { C, FONT_DISPLAY } from '../theme'
import { LANG_LABEL } from '../data/languages'
import { useStore, type Page } from '../state/store'

interface NavItem {
  id: string
  label: string
  page: Page
}

const NAV: NavItem[] = [
  { id: 'home', label: 'Home', page: 'treatments' },
  { id: 'mylist', label: 'My List', page: 'mylist' },
  { id: 'community', label: 'Community', page: 'community' },
  { id: 'rewards', label: 'Rewards', page: 'rewards' },
]

/** Which tab a page belongs to. A page missing here highlights nothing. */
const NAV_FOR: Partial<Record<Page, string>> = {
  treatments: 'home',
  detail: 'home',
  clinics: 'home',
  booking: 'home',
  product: 'home',
  mylist: 'mylist',
  community: 'community',
  rewards: 'rewards',
  qr: 'rewards',
}

/** The concentric mark. Also the favicon, and the analysing screen's core. */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      <div
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${C.blue}` }}
      />
      <div
        style={{
          position: 'absolute',
          width: size * 0.37,
          height: size * 0.37,
          borderRadius: '50%',
          background: C.blue,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: -(size / 6),
          borderRadius: '50%',
          border: '1px solid rgba(143,184,232,.6)',
        }}
      />
    </div>
  )
}

export function TopNav() {
  const { page, signedIn, go, openModal } = useStore()
  const active = NAV_FOR[page]
  const narrow = useNarrow()

  const tabs = NAV.map((item) => {
    const on = active === item.id
    return (
      <Pressable
        key={item.id}
        onClick={() => go(item.page)}
        className="nav-item"
        style={{
          padding: narrow ? '9px 4px' : '9px 15px',
          flex: narrow ? 1 : undefined,
          textAlign: 'center',
          borderRadius: 9,
          fontSize: narrow ? 13.5 : 14.5,
          fontWeight: on ? 600 : 500,
          whiteSpace: 'nowrap',
          color: on ? C.blue : C.bodyFaint,
          background: on ? C.chip : 'transparent',
        }}
      >
        {item.label}
      </Pressable>
    )
  })

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255,255,255,.94)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: narrow ? '0 16px' : '0 32px',
          height: narrow ? 56 : 68,
          display: 'flex',
          alignItems: 'center',
          gap: narrow ? 12 : 28,
        }}
      >
        <Pressable
          onClick={() => go('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: narrow ? 9 : 11, flex: 'none' }}
          label="Solution home"
        >
          <Mark size={narrow ? 24 : 30} />
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: narrow ? 18 : 20,
              fontWeight: 600,
              letterSpacing: '-.01em',
              color: C.ink,
            }}
          >
            S<span style={{ color: C.blue }}>olu</span>tion
          </div>
        </Pressable>

        {/* On a phone the tabs take their own row below, full width. */}
        {narrow ? (
          <div style={{ flex: 1 }} />
        ) : (
          <nav style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
            {tabs}
          </nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: narrow ? 8 : 12, flex: 'none' }}>
          <Pressable
            onClick={() => openModal('lang')}
            className="btn-ghost"
            label={narrow ? `Language: ${LANG_LABEL}` : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              // The globe alone on a phone, at a size a thumb can hit.
              padding: narrow ? 0 : '8px 13px',
              width: narrow ? 40 : undefined,
              height: narrow ? 40 : undefined,
              borderRadius: 9,
              border: `1px solid ${C.border}`,
              fontSize: 13.5,
              fontWeight: 500,
              color: C.bodyFaint,
            }}
          >
            <span style={{ display: 'flex', color: C.muted }}>
              <Icon path={PATHS.globe} size={17} />
            </span>
            {narrow ? null : (
              <>
                <span>{LANG_LABEL}</span>
                <span style={{ fontSize: 10, color: C.muted }}>▾</span>
              </>
            )}
          </Pressable>

          {signedIn ? (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                background: 'linear-gradient(150deg,#EAF1FB,#D6E4F7)',
                border: '1px solid #CFDFF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_DISPLAY,
                fontSize: 13.5,
                fontWeight: 600,
                color: C.blue,
              }}
              title="Signed in"
            >
              YO
            </div>
          ) : (
            <Pressable
              onClick={() => openModal('signup')}
              className="btn-primary"
              style={{
                padding: narrow ? '0 14px' : '10px 18px',
                height: narrow ? 40 : undefined,
                borderRadius: 9,
                background: C.blue,
                color: '#fff',
                fontFamily: FONT_DISPLAY,
                fontSize: narrow ? 13.5 : 14,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Sign up
            </Pressable>
          )}
        </div>
      </div>

      {narrow ? (
        <nav
          style={{
            display: 'flex',
            gap: 2,
            padding: '0 12px 8px',
          }}
        >
          {tabs}
        </nav>
      ) : null}
    </div>
  )
}
