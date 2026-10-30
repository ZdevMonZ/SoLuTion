/**
 * The health-checkup mode's state, beside the skin funnel's store rather than in it.
 *
 * It shares the visitor — age band, gender and district come from the main store's
 * profile, so the two modes never disagree about who is using them — and the main
 * store's `go`, so there is still one navigation model. What is its own: the two
 * history answers, the scan, the numbers on the review screen, and the condition
 * chosen on the body map.
 *
 * A scan goes straight to the body map with whatever it read; the review screen is
 * reached from there ("Edit numbers"), or used to type a sheet in by hand. A scan
 * that read nothing stops on the analysing screen instead — an empty body map
 * would claim everything is in range.
 *
 * Nothing here is written to storage. A checkup is medical information, and the
 * promise on the form is that it is gone when the visitor leaves.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ITEMS,
  ITEM_IDS,
  SAMPLE_READINGS,
  buildReport,
  formatValue,
  type ConditionId,
  type HealthReport,
  type HistoryId,
  type ItemId,
  type Readings,
} from '../health/items'
import { readReport, type OcrProgress } from '../health/ocr'
import { useStore } from './store'

/** `empty`: the reader ran but found no numbers. */
export type ScanStatus = 'idle' | 'running' | 'failed' | 'empty'
/** How the review screen's numbers got there — it words its heading by this. */
export type DraftSource = 'scan' | 'sample' | 'manual'

type Draft = Record<ItemId, string>
const EMPTY_DRAFT = Object.fromEntries(ITEM_IDS.map((id) => [id, ''])) as Draft

const draftOf = (readings: Readings): Draft => ({
  ...EMPTY_DRAFT,
  ...Object.fromEntries(
    Object.entries(readings).map(([id, v]) => [id, formatValue(id as ItemId, v as number)]),
  ),
})

/** The typed text → a number, or nothing. A comma is read as the decimal point. */
export function parseDraftValue(id: ItemId, text: string): number | undefined {
  const t = text.trim().replace(',', '.')
  if (!t) return undefined
  const n = Number(t)
  const [min, max] = ITEMS[id].plausible
  return Number.isFinite(n) && n >= min && n <= max ? n : undefined
}

const readingsOf = (draft: Draft): Readings =>
  Object.fromEntries(
    ITEM_IDS.flatMap((id) => {
      const v = parseDraftValue(id, draft[id])
      return v === undefined ? [] : [[id, v]]
    }),
  )

interface HealthContextValue {
  family: HistoryId[]
  diagnosed: HistoryId[]
  toggleFamily: (id: HistoryId) => void
  toggleDiagnosed: (id: HistoryId) => void

  /** Object URL of the photographed sheet, for the analysing and review screens. */
  photoUrl: string | null
  scanStatus: ScanStatus
  progress: OcrProgress | null
  /** What the reader recognised, shown on request under the review table. */
  scanText: string
  /** Items the reader filled, so the review screen can mark them. */
  scanned: ItemId[]
  /** Scans the frame; moves on to the body map when it is done, if the visitor is still waiting. */
  startScan: (canvas: HTMLCanvasElement) => void
  startSample: () => void
  startManual: () => void

  draft: Draft
  draftSource: DraftSource
  setDraftValue: (id: ItemId, text: string) => void
  /** True when at least one typed value is a usable number. */
  canConfirm: boolean
  confirm: () => void

  report: HealthReport | null
  /** How many items the scan read, when the report is the scan's own; null otherwise. */
  readCount: number | null
  selected: ConditionId | null
  select: (id: ConditionId | null) => void
  openGuide: (id: ConditionId) => void
}

const HealthContext = createContext<HealthContextValue | null>(null)

export function HealthProvider({ children }: { children: ReactNode }) {
  const { go, page, profile } = useStore()
  const [family, setFamily] = useState<HistoryId[]>([])
  const [diagnosed, setDiagnosed] = useState<HistoryId[]>([])
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [progress, setProgress] = useState<OcrProgress | null>(null)
  const [scanText, setScanText] = useState('')
  const [scanned, setScanned] = useState<ItemId[]>([])
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [draftSource, setDraftSource] = useState<DraftSource>('manual')
  const [confirmed, setConfirmed] = useState<{
    readings: Readings
    sample: boolean
    /** Straight from a scan, not yet looked over on the review screen. */
    fromScan: boolean
  } | null>(null)
  const [selected, setSelected] = useState<ConditionId | null>(null)

  // Read inside the scan's continuation, which outlives the render that started it.
  const pageRef = useRef(page)
  useEffect(() => {
    pageRef.current = page
  }, [page])
  /** Bumped per scan, so a slow scan finishing after a newer one is ignored. */
  const scanId = useRef(0)

  const replacePhoto = useCallback((url: string | null) => {
    setPhotoUrl((old) => {
      if (old) URL.revokeObjectURL(old)
      return url
    })
  }, [])

  const toggle = (list: HistoryId[], id: HistoryId) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

  const startScan = useCallback(
    (canvas: HTMLCanvasElement) => {
      const id = ++scanId.current
      setScanStatus('running')
      setProgress(null)
      canvas.toBlob((blob) => {
        if (scanId.current === id) replacePhoto(blob ? URL.createObjectURL(blob) : null)
      }, 'image/jpeg', 0.85)
      go('health-analyzing')
      readReport(canvas, (p) => {
        if (scanId.current === id) setProgress(p)
      })
        .then(({ text, readings }) => {
          if (scanId.current !== id) return
          console.debug('[health] read', readings)
          setScanText(text)
          setScanned(Object.keys(readings) as ItemId[])
          setDraft(draftOf(readings))
          setDraftSource('scan')
          if (Object.keys(readings).length === 0) {
            setScanStatus('empty')
            return
          }
          setScanStatus('idle')
          setConfirmed({ readings, sample: false, fromScan: true })
          setSelected(null)
          if (pageRef.current === 'health-analyzing') go('health-result')
        })
        .catch((error) => {
          if (scanId.current !== id) return
          console.warn('[health] the reader failed', error)
          setScanStatus('failed')
        })
    },
    [go, replacePhoto],
  )

  const resetScan = useCallback(() => {
    scanId.current++
    replacePhoto(null)
    setScanStatus('idle')
    setScanText('')
    setScanned([])
  }, [replacePhoto])

  const startSample = useCallback(() => {
    resetScan()
    setDraft(draftOf(SAMPLE_READINGS))
    setDraftSource('sample')
    setConfirmed({ readings: SAMPLE_READINGS, sample: true, fromScan: false })
    setSelected(null)
    go('health-result')
  }, [go, resetScan])

  const startManual = useCallback(() => {
    // A partial scan's numbers are kept to be completed; the sample's are not the visitor's.
    if (draftSource === 'sample') {
      setDraft(EMPTY_DRAFT)
      setDraftSource('manual')
    }
    if (scanStatus === 'failed' || scanStatus === 'empty') setScanStatus('idle')
    go('health-review')
  }, [draftSource, go, scanStatus])

  const canConfirm = useMemo(() => Object.keys(readingsOf(draft)).length > 0, [draft])

  const confirm = useCallback(() => {
    const readings = readingsOf(draft)
    if (Object.keys(readings).length === 0) return
    setConfirmed({ readings, sample: draftSource === 'sample', fromScan: false })
    setSelected(null)
    go('health-result')
  }, [draft, draftSource, go])

  // Derived, so a gender or history change after confirming re-judges the numbers.
  const report = useMemo(
    () =>
      confirmed
        ? buildReport(confirmed.readings, profile.gender, family, diagnosed, confirmed.sample)
        : null,
    [confirmed, profile.gender, family, diagnosed],
  )

  const value = useMemo<HealthContextValue>(
    () => ({
      family,
      diagnosed,
      toggleFamily: (id) => setFamily((l) => toggle(l, id)),
      toggleDiagnosed: (id) => setDiagnosed((l) => toggle(l, id)),
      photoUrl,
      scanStatus,
      progress,
      scanText,
      scanned,
      startScan,
      startSample,
      startManual,
      draft,
      draftSource,
      setDraftValue: (id, text) => setDraft((d) => ({ ...d, [id]: text })),
      canConfirm,
      confirm,
      report,
      readCount: confirmed?.fromScan ? Object.keys(confirmed.readings).length : null,
      selected,
      select: setSelected,
      openGuide: (id) => {
        setSelected(id)
        go('health-detail')
      },
    }),
    [
      family,
      diagnosed,
      photoUrl,
      scanStatus,
      progress,
      scanText,
      scanned,
      startScan,
      startSample,
      startManual,
      draft,
      draftSource,
      canConfirm,
      confirm,
      report,
      confirmed,
      selected,
      go,
    ],
  )

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>
}

export function useHealth(): HealthContextValue {
  const ctx = useContext(HealthContext)
  if (!ctx) throw new Error('useHealth must be used inside <HealthProvider>')
  return ctx
}
