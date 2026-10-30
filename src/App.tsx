/**
 * The shell: the nav, whichever screen the store is on, and the overlays.
 *
 * There is no router. The funnel is linear and every step depends on the one
 * before it, so a URL that dropped someone into step four would land them on a
 * screen with nothing behind it — the store's `page` is the whole navigation
 * model, as it was on Android.
 */
import { Analyzing } from './screens/Analyzing'
import { Booking } from './screens/Booking'
import { Capture } from './screens/Capture'
import { Clinics } from './screens/Clinics'
import { Community } from './screens/Community'
import { Detail } from './screens/Detail'
import { Form } from './screens/Form'
import { Landing } from './screens/Landing'
import { MyList } from './screens/MyList'
import { Product } from './screens/Product'
import { Qr } from './screens/Qr'
import { Result } from './screens/Result'
import { Rewards } from './screens/Rewards'
import { Treatments } from './screens/Treatments'
import { useEffect } from 'react'
import { ComposerModal, LanguageModal, SignupModal } from './components/Modals'
import { TopNav } from './components/TopNav'
import { Pressable, useTracking } from './components/primitives'
import { useNarrow } from './components/layout'
import { C } from './theme'
import { useCopy } from './i18n'
import { APP } from './i18n/app'
import { useStore, type Page } from './state/store'

const SCREENS: Record<Page, () => React.JSX.Element> = {
  landing: Landing,
  form: Form,
  capture: Capture,
  analyzing: Analyzing,
  result: Result,
  treatments: Treatments,
  detail: Detail,
  clinics: Clinics,
  booking: Booking,
  product: Product,
  mylist: MyList,
  community: Community,
  rewards: Rewards,
  qr: Qr,
}

/** The jump rail, as in the design. Numbered to match the screen list there. */
const RAIL: [Page, string][] = [
  ['landing', '01'],
  ['form', '03'],
  ['capture', '04'],
  ['analyzing', '05'],
  ['result', '06'],
  ['treatments', '08'],
  ['detail', '09'],
  ['clinics', '10'],
  ['booking', '11'],
  ['product', '12'],
  ['mylist', '13'],
  ['community', '14'],
  ['rewards', '16'],
  ['qr', '17'],
]

export default function App() {
  const { page, modal, go } = useStore()
  const copy = useCopy(APP)
  const tracking = useTracking()
  const Screen = SCREENS[page]
  const narrow = useNarrow()

  // The tab title and the description a shared link previews with. index.html
  // carries the English pair until this runs.
  useEffect(() => {
    document.title = copy.documentTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', copy.description)
  }, [copy])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: C.page,
      }}
    >
      <TopNav />
      <Screen />

      {modal === 'lang' ? <LanguageModal /> : null}
      {modal === 'signup' ? <SignupModal /> : null}
      {modal === 'composer' ? <ComposerModal /> : null}

      {/*
        A jump rail for walking the prototype on a laptop. On a phone it filled a
        third of the screen with links a visitor has no use for, and the nav and
        the funnel's own buttons already reach every screen.
      */}
      {narrow ? null : (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 50,
            background: 'rgba(255,255,255,.95)',
            backdropFilter: 'blur(10px)',
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              maxWidth: 1320,
              margin: '0 auto',
              padding: '12px 32px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 7,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: tracking('.1em'),
                color: C.faint,
                marginRight: 6,
              }}
            >
              {copy.prototype}
            </div>
            {RAIL.map(([id, n]) => {
              const on = id === page
              return (
                <Pressable
                  key={id}
                  onClick={() => go(id)}
                  className="opt"
                  style={{
                    padding: '6px 11px',
                    borderRadius: 8,
                    fontSize: 11.5,
                    background: on ? C.ink : C.surface,
                    border: `1px solid ${on ? C.ink : C.border}`,
                    color: on ? '#fff' : C.bodyMuted,
                  }}
                >
                  {n} {copy.rail[id]}
                </Pressable>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
