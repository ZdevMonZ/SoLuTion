/**
 * Reading a photographed result sheet: text recognition, then the numbers.
 *
 * Recognition is Tesseract compiled to WebAssembly, and its engine, worker and the
 * Korean and English models are served from this site (`public/ocr/`), so the photo
 * of someone's checkup never leaves the browser — the same promise the skin reading
 * makes about the face. The first scan downloads about 9 MB; the models are then
 * kept in the browser's IndexedDB and later scans start at once.
 *
 * Finding the numbers in the recognised text is `parse.ts`, kept apart so it can
 * be run and tested without a browser.
 */
import { PSM, createWorker, type Worker } from 'tesseract.js'
import type { Readings } from './items'
import { mergeReadings, parseReport } from './parse'

export interface OcrProgress {
  stage: 'loading' | 'reading'
  /** 0..1 within the stage. */
  ratio: number
}

let worker: Promise<Worker> | null = null
/** Where the running job's progress goes. Tesseract's logger is fixed at creation. */
let sink: ((p: OcrProgress) => void) | null = null

function getWorker(): Promise<Worker> {
  if (!worker) {
    // Absolute, because the worker runs from a blob URL and resolves nothing relative.
    const base = new URL(`${import.meta.env.BASE_URL}ocr/`, location.href).href
    worker = createWorker(['kor', 'eng'], 1, {
      workerPath: `${base}worker.min.js`,
      corePath: `${base}core`,
      langPath: `${base}lang`,
      logger: (m) => {
        const reading = m.status === 'recognizing text'
        sink?.({ stage: reading ? 'reading' : 'loading', ratio: m.progress ?? 0 })
      },
    })
      .then(async (w) => {
        await w.setParameters({
          // Automatic layout. Tesseract.js defaults to one uniform block, which turns
          // a bordered table into noise; measured on a test sheet, 0 of 15 values
          // against 13 with automatic layout.
          tessedit_pageseg_mode: PSM.AUTO,
          // Keeps the gap between a label and its value, which is where the value is looked for.
          preserve_interword_spaces: '1',
        })
        return w
      })
      .catch((error) => {
        // A failed start (offline, blocked worker) must not poison the next attempt.
        worker = null
        throw error
      })
  }
  return worker
}

/**
 * The long sides each pass scales the photo to. Tesseract reads a narrow band of
 * text sizes: on the test sheets, body text 15 px tall read 13 of 15 values and
 * the same sheet enlarged to 26 px read none. How large the text is depends on how
 * much of the frame the sheet fills, which is not known, so the page is read at two
 * sizes and the passes merged.
 */
const PASS_EDGES = [1600, 2400]

/**
 * Greyscale, scaled so the long side is `edge`, then thresholded against each
 * pixel's own neighbourhood (Bradley's method): ink is what is darker than the
 * paper around it, not darker than one cut-off for the whole frame. With one
 * global cut-off — Tesseract's own — a photo whose sheet is surrounded by desk or
 * wall read 0 of 15 values; with this, 6 to 8.
 */
function prepare(source: HTMLCanvasElement, edge: number): HTMLCanvasElement {
  const scale = edge / Math.max(source.width, source.height)
  const w = Math.max(1, Math.round(source.width * scale))
  const h = Math.max(1, Math.round(source.height * scale))
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d', { willReadFrequently: true })
  if (!ctx) return source
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)
  const img = ctx.getImageData(0, 0, w, h)
  const px = img.data
  const grey = new Float32Array(w * h)
  for (let i = 0; i < grey.length; i++) {
    grey[i] = (px[i * 4] * 299 + px[i * 4 + 1] * 587 + px[i * 4 + 2] * 114) / 1000
  }
  // Summed-area table, so each pixel's neighbourhood mean is four lookups.
  const W = w + 1
  const sat = new Float64Array(W * (h + 1))
  for (let y = 0; y < h; y++) {
    let row = 0
    for (let x = 0; x < w; x++) {
      row += grey[y * w + x]
      sat[(y + 1) * W + x + 1] = sat[y * W + x + 1] + row
    }
  }
  const r = Math.max(4, Math.round(Math.max(w, h) / 40))
  const DARKER = 0.15
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r)
    const y1 = Math.min(h, y + r + 1)
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r)
      const x1 = Math.min(w, x + r + 1)
      const sum = sat[y1 * W + x1] - sat[y0 * W + x1] - sat[y1 * W + x0] + sat[y0 * W + x0]
      const mean = sum / ((x1 - x0) * (y1 - y0))
      const v = grey[y * w + x] < mean * (1 - DARKER) ? 0 : 255
      const i = (y * w + x) * 4
      px[i] = px[i + 1] = px[i + 2] = v
    }
  }
  ctx.putImageData(img, 0, 0)
  return out
}

export interface ScanResult {
  /** Every pass's text, for the review screen's "what the reader saw". */
  text: string
  readings: Readings
}

export async function readReport(
  canvas: HTMLCanvasElement,
  onProgress: (p: OcrProgress) => void,
): Promise<ScanResult> {
  try {
    sink = onProgress
    onProgress({ stage: 'loading', ratio: 0 })
    const w = await getWorker()
    const texts: string[] = []
    const passes: Readings[] = []
    for (const [i, edge] of PASS_EDGES.entries()) {
      // Each pass's own 0..1 becomes its share of the whole.
      sink = (p) =>
        onProgress(p.stage === 'reading' ? { stage: 'reading', ratio: (i + p.ratio) / PASS_EDGES.length } : p)
      const { data } = await w.recognize(prepare(canvas, edge))
      texts.push(data.text)
      passes.push(parseReport(data.text))
    }
    return { text: texts.join('\n――――\n'), readings: mergeReadings(passes) }
  } finally {
    sink = null
  }
}
