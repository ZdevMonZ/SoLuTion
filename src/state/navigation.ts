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
