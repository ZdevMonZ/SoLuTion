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
import { HealthAnalyzing } from './screens/health/HealthAnalyzing'
import { HealthCapture } from './screens/health/HealthCapture'
import { HealthClinics } from './screens/health/HealthClinics'
import { HealthDetail } from './screens/health/HealthDetail'
import { HealthForm } from './screens/health/HealthForm'
import { HealthLanding } from './screens/health/HealthLanding'
import { HealthResult } from './screens/health/HealthResult'
import { HealthReview } from './screens/health/HealthReview'
import { useEffect } from 'react'
import { ComposerModal, LanguageModal, SignupModal } from './components/Modals'
import { TopNav } from './components/TopNav'
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
  'health-landing': HealthLanding,
  'health-form': HealthForm,
  'health-capture': HealthCapture,
  'health-analyzing': HealthAnalyzing,
  'health-review': HealthReview,
  'health-result': HealthResult,
  'health-detail': HealthDetail,
  'health-clinics': HealthClinics,
}

export default function App() {
  const { page, modal, signedIn } = useStore()
  const copy = useCopy(APP)
  const Screen = page === 'community' && !signedIn ? Landing : SCREENS[page]

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
    </div>
  )
}
