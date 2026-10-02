/**
 * One store for the whole funnel — the web counterpart of `DermaViewModel` plus
 * the parts of `DermaRepository` that are not content lookups.
 *
 * The flow is short, linear, and every screen needs the previous screen's answer,
 * so a single store is simpler and more readable here than per-screen state.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { measureCanvas } from '../analysis/capture'
import { urgencyOf } from '../analysis/ranking'
import { MIN_SKIN_COVERAGE, analyse, referenceResult } from '../analysis/skinScoring'
import type { FitzpatrickType } from '../analysis/phototype'
import type { AgeBand, Gender, SkinAnalysisResult, UserProfile } from '../analysis/types'
import {
  CLINICS,
  DISTRICT_MYEONGDONG,
  SEED_POSTS,
  TREATMENTS,
  treatmentById,
  type CommunityPost,
  type Treatment,
} from '../data/catalog'

export type Page =
  | 'landing'
  | 'form'
  | 'capture'
  | 'analyzing'
  | 'result'
  | 'treatments'
  | 'detail'
  | 'clinics'
  | 'booking'
  | 'product'
  | 'mylist'
  | 'community'
  | 'rewards'
  | 'qr'

export type Modal = 'lang' | 'signup' | 'composer' | null

/** Community filter ids. Language-independent, as in the app. */
export const FILTER_ALL = 'all'
export const FILTER_VERIFIED = 'verified'
export const FILTER_TREATMENT_PREFIX = 'tx:'
export const FILTER_DISTRICT_PREFIX = 'district:'

/** Minimum analysing dwell. Matches the design's progress sweep. */
export const SIMULATED_ANALYSIS_MILLIS = 2400

/**
 * Bumped when the stored shape or the meaning of its numbers changes. v2 is the
 * row-score flip: a v1 blob holds attention scores, which would render inverted —
 * a bad row shown as a good one — so those are left behind rather than migrated.
 */
const REPORT_KEY = 'solution.lastReport.v2'

interface State {
  page: Page
  modal: Modal
  signedIn: boolean
  profile: UserProfile
  /** Object URL of the captured frame, for the thumbnail on the result screen. */
  capturedUrl: string | null
  analysis: SkinAnalysisResult | null
  recommendations: Treatment[]
  selectedTreatmentId: string | null
  selectedClinicId: string | null
  selectedProductId: string | null
  quantity: number
  day: string
  time: string
  savedTreatmentIds: string[]
  savedClinicIds: string[]
  communityFilterId: string
  userPosts: CommunityPost[]
  redeemedRewardId: string | null
  /**
   * True once the sign-up gate has been passed. A second reading must not ask for
   * an account again, so the result screen reads this to decide whether its CTA is
   * the gate or the matched list.
   */
  hasEnteredTabShell: boolean
}

function loadSavedReport(): SkinAnalysisResult | null {
  try {
    const raw = localStorage.getItem(REPORT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SkinAnalysisResult
    // A malformed blob (e.g. written by an older build) is dropped on read rather
    // than crashing the landing page.
    if (!Array.isArray(parsed.categories) || typeof parsed.overallScore !== 'number') return null
    // The object URL from that session died with it; the numbers are what is kept.
    // `phototype` is coalesced because a report stored by a build before the tone
    // reading existed has none, and the result screen must not read undefined.
    return { ...parsed, capturedPhotoUrl: null, phototype: parsed.phototype ?? null }
  } catch {
    return null
  }
}

const initialState: State = {
  page: 'landing',
  modal: null,
  signedIn: false,
  profile: {
    ageBand: 'THIRTIES',
    gender: 'FEMALE',
    districtKey: DISTRICT_MYEONGDONG,
    // Left unanswered on purpose: the prototype pre-fills the two questions the
    // design pre-fills, and a skin type nobody stated must not be invented.
    fitzpatrick: null,
  },
  capturedUrl: null,
  analysis: null,
  recommendations: [],
  selectedTreatmentId: null,
  selectedClinicId: null,
  selectedProductId: null,
  quantity: 1,
  day: '22',
  time: '14:00',
  savedTreatmentIds: [],
  savedClinicIds: [],
  communityFilterId: FILTER_ALL,
  userPosts: [],
  redeemedRewardId: null,
  hasEnteredTabShell: false,
}

/**
 * The matched list. Every treatment, ordered so the category needing most
 * attention leads; a treatment covering several categories is ranked by its
 * most-urgent one.
 */
const recommend = (result: SkinAnalysisResult): Treatment[] =>
  [...TREATMENTS].sort((a, b) => urgencyOf(b.targets, result) - urgencyOf(a.targets, result))

export interface Store extends State {
  savedReport: SkinAnalysisResult | null
  go: (page: Page) => void
  openModal: (modal: Exclude<Modal, null>) => void
  closeModal: () => void
  setAgeBand: (band: AgeBand) => void
  setGender: (gender: Gender) => void
  /** Null clears the answer — the question is optional and stays skippable. */
  setFitzpatrick: (type: FitzpatrickType | null) => void
  setDistrict: (key: string) => void
  /**
   * The capture, or null for the skip path.
   *
   * Measures the frame and scores it, with three outcomes in order of preference,
   * exactly as `DermaRepository.analyze` has them: a usable frame is measured; a
   * frame with nothing readable in it falls back to the reference result labelled
   * NO_FACE_FOUND; no frame at all falls back labelled NO_PHOTO.
   */
  runAnalysis: (canvas: HTMLCanvasElement | null) => Promise<void>
  openSavedReport: () => boolean
  deleteSavedReport: () => void
  selectTreatment: (id: string) => void
  selectClinic: (id: string) => void
  selectProduct: (id: string) => void
  setQuantity: (delta: number) => void
  setDay: (day: string) => void
  setTime: (time: string) => void
  toggleSavedTreatment: (id: string) => void
  toggleSavedClinic: (id: string) => void
  setCommunityFilter: (id: string) => void
  submitPost: (text: string, treatmentTag: string, clinicTag: string) => void
  selectReward: (id: string) => void
  completeSignup: () => void
  skipSignup: () => void
  enterTabShell: () => void
  communityFeed: () => CommunityPost[]
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState)
  const [savedReport, setSavedReport] = useState<SkinAnalysisResult | null>(loadSavedReport)
  const patch = useCallback(
    (next: Partial<State> | ((s: State) => Partial<State>)) =>
      setState((s) => ({ ...s, ...(typeof next === 'function' ? next(s) : next) })),
    [],
  )

  // The URL handed to <img>. Revoked when it is replaced, so a long session of
  // retakes does not pin every frame it ever took in memory.
  const capturedUrlRef = useRef<string | null>(null)
  const setCapturedUrl = useCallback((url: string | null) => {
    if (capturedUrlRef.current) URL.revokeObjectURL(capturedUrlRef.current)
    capturedUrlRef.current = url
    return url
  }, [])

  const go = useCallback(
    (page: Page) => {
      patch({ page, modal: null })
      window.scrollTo(0, 0)
    },
    [patch],
  )

  const runAnalysis = useCallback(
    async (canvas: HTMLCanvasElement | null) => {
      const started = Date.now()
      const profile = state.profile

      const reading = canvas ? measureCanvas(canvas) : null
      const metrics = reading?.metrics ?? null
      const phototype = reading?.phototype ?? null
      if (metrics) console.debug('[analysis] measured', metrics, phototype)

      const url = canvas ? await canvasUrl(canvas) : null
      setCapturedUrl(url)

      const now = Date.now()
      const result =
        metrics && metrics.skinCoverage >= MIN_SKIN_COVERAGE
          ? analyse(metrics, profile, url, now, phototype)
          : referenceResult(profile, url, now, canvas ? 'NO_FACE_FOUND' : 'NO_PHOTO')

      // The analysing screen's motif needs a beat to read; measurement itself is far
      // quicker than the animation it sits behind.
      const elapsed = Date.now() - started
      if (elapsed < SIMULATED_ANALYSIS_MILLIS) {
        await new Promise((r) => setTimeout(r, SIMULATED_ANALYSIS_MILLIS - elapsed))
      }

      try {
        localStorage.setItem(REPORT_KEY, JSON.stringify({ ...result, capturedPhotoUrl: null }))
      } catch {
        // A browser with storage blocked still gets the reading; it just cannot keep it.
      }
      setSavedReport({ ...result, capturedPhotoUrl: null })
      patch({
        capturedUrl: url,
        analysis: result,
        recommendations: recommend(result),
        selectedTreatmentId: null,
        selectedClinicId: null,
      })
    },
    [patch, setCapturedUrl, state.profile],
  )

  const openSavedReport = useCallback(() => {
    const saved = savedReport
    if (!saved) return false
    patch({
      analysis: saved,
      recommendations: recommend(saved),
      capturedUrl: null,
      // A reopened report starts a fresh browse; nothing downstream is chosen yet.
      selectedTreatmentId: null,
      selectedClinicId: null,
      selectedProductId: null,
    })
    return true
  }, [patch, savedReport])

  const store: Store = useMemo(() => {
    const toggle = (list: string[], id: string) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

    return {
      ...state,
      savedReport,
      go,
      openModal: (modal) => patch({ modal }),
      closeModal: () => patch({ modal: null }),
      setAgeBand: (ageBand) => patch((s) => ({ profile: { ...s.profile, ageBand } })),
      setGender: (gender) => patch((s) => ({ profile: { ...s.profile, gender } })),
      setFitzpatrick: (fitzpatrick) => patch((s) => ({ profile: { ...s.profile, fitzpatrick } })),
      setDistrict: (districtKey) =>
        patch((s) => ({
          profile: { ...s.profile, districtKey },
          // The chosen clinic belonged to the old district; keeping its id would put
          // a Hongdae clinic on a Gangnam booking page.
          selectedClinicId: null,
        })),
      runAnalysis,
      openSavedReport,
      deleteSavedReport: () => {
        try {
          localStorage.removeItem(REPORT_KEY)
        } catch {
          /* nothing to remove */
        }
        setSavedReport(null)
      },
      selectTreatment: (selectedTreatmentId) => patch({ selectedTreatmentId }),
      selectClinic: (selectedClinicId) => patch({ selectedClinicId }),
      selectProduct: (selectedProductId) => patch({ selectedProductId, quantity: 1 }),
      setQuantity: (delta) =>
        patch((s) => ({ quantity: Math.min(9, Math.max(1, s.quantity + delta)) })),
      setDay: (day) => patch({ day }),
      setTime: (time) => patch({ time }),
      toggleSavedTreatment: (id) =>
        patch((s) => ({ savedTreatmentIds: toggle(s.savedTreatmentIds, id) })),
      toggleSavedClinic: (id) => patch((s) => ({ savedClinicIds: toggle(s.savedClinicIds, id) })),
      setCommunityFilter: (communityFilterId) => patch({ communityFilterId }),
      submitPost: (text, treatmentTag, clinicTag) => {
        // Unlike the design, where "Publish" just closes the sheet, this actually
        // appends to the feed: a submit button that silently drops the user's text
        // would read as broken.
        const treatment = TREATMENTS.find((t) => t.shortName === treatmentTag)
        const clinic = CLINICS.find((c) => c.name === clinicTag)
        patch((s) => ({
          modal: null,
          userPosts: [
            {
              id: `post_user_${Date.now()}`,
              author: 'You',
              initials: 'YO',
              meta: 'Just now',
              verified: false,
              treatmentTag,
              clinicTag,
              likes: 0,
              comments: 0,
              text,
              treatmentId: treatment?.id ?? '',
              districtKey: clinic?.districtKey ?? '',
            },
            ...s.userPosts,
          ],
        }))
      },
      selectReward: (redeemedRewardId) => patch({ redeemedRewardId }),
      completeSignup: () => {
        patch({ signedIn: true, hasEnteredTabShell: true, modal: null, page: 'treatments' })
        window.scrollTo(0, 0)
      },
      skipSignup: () => {
        patch({ hasEnteredTabShell: true, modal: null, page: 'treatments' })
        window.scrollTo(0, 0)
      },
      enterTabShell: () => patch({ hasEnteredTabShell: true }),
      communityFeed: () => {
        const all = [...state.userPosts, ...SEED_POSTS]
        const id = state.communityFilterId
        if (id === FILTER_VERIFIED) return all.filter((p) => p.verified)
        if (id.startsWith(FILTER_TREATMENT_PREFIX)) {
          const treatmentId = id.slice(FILTER_TREATMENT_PREFIX.length)
          return all.filter((p) => p.treatmentId === treatmentId)
        }
        if (id.startsWith(FILTER_DISTRICT_PREFIX)) {
          const districtKey = id.slice(FILTER_DISTRICT_PREFIX.length)
          return all.filter((p) => p.districtKey === districtKey)
        }
        // FILTER_ALL, and anything unrecognised: showing the whole feed is the safe
        // reading of a filter this build no longer knows about.
        return all
      },
    }
  }, [go, openSavedReport, patch, runAnalysis, savedReport, state])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}

/** The selected treatment, falling back to the top match so no screen shows blank. */
export function useTreatment(): Treatment {
  const { selectedTreatmentId, recommendations } = useStore()
  return treatmentById(selectedTreatmentId) ?? recommendations[0] ?? TREATMENTS[0]
}

function canvasUrl(canvas: HTMLCanvasElement): Promise<string | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : null), 'image/jpeg', 0.9)
  })
}
