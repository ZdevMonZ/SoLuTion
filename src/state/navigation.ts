import type { Modal, Page } from './store'

interface NavigationState {
  page: Page
  modal: Modal
  signedIn: boolean
  pendingPage: Page | null
}

/** Review access is requested centrally, including links from booking and nav. */
export function navigate(state: NavigationState, destination: Page): Partial<NavigationState> {
  if (destination === 'community' && !state.signedIn) {
    return { modal: 'signup', pendingPage: destination }
  }
  return { page: destination, modal: null, pendingPage: null }
}
export function finishSignup(state: NavigationState): Partial<NavigationState> {
  return { signedIn: true, modal: null, page: state.pendingPage ?? state.page, pendingPage: null }
}
export function dismissSignup(): Partial<NavigationState> {
  return { modal: null, pendingPage: null }
}

/** Android's Back button follows the same funnel as the visible navigation. */
export function backDestination(page: Page): Page | null {
  if (page === 'landing') return null
  const previous: Partial<Record<Page, Page>> = {
    form: 'capture', analyzing: 'capture', result: 'capture',
    detail: 'treatments', clinics: 'detail', booking: 'clinics',
    product: 'detail', qr: 'rewards',
    'health-form': 'health-landing', 'health-capture': 'health-form',
    'health-review': 'health-capture', 'health-analyzing': 'health-review',
    'health-result': 'health-landing', 'health-detail': 'health-result',
    'health-clinics': 'health-detail',
  }
  return previous[page] ?? 'landing'
}
