/**
 * The checkup items the scan looks for, the ranges they are judged against, and the
 * seven conditions they group into.
 *
 * The ranges are the ones the Korean national health screening result sheet
 * (일반건강검진 결과통보서) prints — normal, borderline, and "disease suspected" — so
 * a reading here agrees with the sheet it came from. BMI uses the Korean Society for
 * the Study of Obesity's cut-offs (23 overweight, 25 obese), which are lower than the
 * WHO's. Nothing here diagnoses: a level only says which side of a printed line a
 * number falls on.
 *
 * Words live in `i18n/health.ts`; this file is ids, numbers and rules.
 */
import type { Gender } from '../analysis/types'

export const ITEM_IDS = [
  'sbp',
  'dbp',
  'glucose',
  'totalChol',
  'ldl',
  'hdl',
  'tg',
  'hb',
  'ast',
  'alt',
  'ggt',
  'creatinine',
  'egfr',
  'bmi',
  'waist',
] as const
export type ItemId = (typeof ITEM_IDS)[number]

/** 0 in range · 1 borderline · 2 outside the line the sheet marks as suspected. */
export type Level = 0 | 1 | 2

export type Readings = Partial<Record<ItemId, number>>

export interface ItemSpec {
  id: ItemId
  unit: string
  /** Decimals a value is shown and typed with. */
  decimals: number
  /** Values outside this are an OCR misread, not a result, and are not accepted. */
  plausible: [number, number]
  /**
   * What the item is called on a sheet, compared with any spacing and case — OCR
   * splits Hangul into single spaced characters. A few are the reader's own
   * misreadings of the real name (콜레스테를, 이환기, LoL), measured on photographed
   * sheets: a misread label otherwise loses a value the reader got right.
   */
  aliases: string[]
}

export const ITEMS: Record<ItemId, ItemSpec> = {
  sbp: { id: 'sbp', unit: 'mmHg', decimals: 0, plausible: [70, 250], aliases: ['수축기', 'systolic', '収縮期', '收缩压'] },
  dbp: { id: 'dbp', unit: 'mmHg', decimals: 0, plausible: [40, 160], aliases: ['이완기', '이환기', 'diastolic', '拡張期', '舒张压'] },
  glucose: {
    id: 'glucose',
    unit: 'mg/dL',
    decimals: 0,
    plausible: [40, 600],
    aliases: ['공복혈당', '식전혈당', 'fastingglucose', 'fastingbloodsugar', 'fbs', 'glucose', '空腹時血糖', '空腹血糖', '血糖', '혈당'],
  },
  totalChol: {
    id: 'totalChol',
    unit: 'mg/dL',
    decimals: 0,
    plausible: [70, 500],
    aliases: ['총콜레스테롤', '총콜레스테를', '충콜레스테롤', '충콜레스테를', '총콜레스테톨', 'totalcholesterol', 't-chol', 't.chol', 'tchol', '総コレステロール', '总胆固醇'],
  },
  ldl: {
    id: 'ldl',
    unit: 'mg/dL',
    decimals: 0,
    plausible: [20, 400],
    aliases: ['저밀도', 'ldl', 'ldl-c', 'lol', 'ldlコレステロール', '低密度'],
  },
  hdl: {
    id: 'hdl',
    unit: 'mg/dL',
    decimals: 0,
    plausible: [10, 150],
    aliases: ['고밀도', 'hdl', 'hdl-c', 'hdlコレステロール', '高密度'],
  },
  tg: {
    id: 'tg',
    unit: 'mg/dL',
    decimals: 0,
    plausible: [20, 3000],
    aliases: ['중성지방', '트리글리세라이드', 'triglyceride', 'tg', '中性脂肪', '甘油三酯'],
  },
  hb: {
    id: 'hb',
    unit: 'g/dL',
    decimals: 1,
    plausible: [4, 25],
    aliases: ['혈색소', '헤모글로빈', 'hemoglobin', 'haemoglobin', 'hgb', 'hb', '血色素', 'ヘモグロビン', '血红蛋白'],
  },
  ast: { id: 'ast', unit: 'U/L', decimals: 0, plausible: [3, 3000], aliases: ['ast', 'sgot', 'got'] },
  alt: { id: 'alt', unit: 'U/L', decimals: 0, plausible: [3, 3000], aliases: ['alt', 'sgpt', 'gpt'] },
  ggt: {
    id: 'ggt',
    unit: 'U/L',
    decimals: 0,
    plausible: [3, 3000],
    aliases: ['감마지티피', '감마지티', '감마', 'γ-gtp', 'γgtp', 'r-gtp', 'y-gtp', 'gamma-gt', 'gammagt', 'ggt', 'gtp'],
  },
  creatinine: {
    id: 'creatinine',
    unit: 'mg/dL',
    decimals: 2,
    plausible: [0.2, 15],
    aliases: ['혈청크레아티닌', '크레아티닌', 'creatinine', 'クレアチニン', '肌酐'],
  },
  egfr: {
    id: 'egfr',
    unit: 'mL/min/1.73㎡',
    decimals: 0,
    plausible: [3, 200],
    aliases: ['신사구체여과율', '신사구체여과울', '사구체여과율', '사구체여과울', 'e-gfr', 'egfr', 'gfr', '糸球体濾過量', '肾小球滤过率'],
  },
  bmi: { id: 'bmi', unit: 'kg/㎡', decimals: 1, plausible: [10, 70], aliases: ['체질량지수', 'bodymassindex', 'bmi'] },
  waist: { id: 'waist', unit: 'cm', decimals: 0, plausible: [40, 200], aliases: ['허리둘레', '허리둘래', '허리돌레', '허리툴레', 'waistcircumference', 'waist', '腹囲', '腰围'] },
}

/**
 * Gender as the form holds it — unanswered is allowed. Gender-specific lines use
 * the sheet's; an undisclosed or unanswered gender gets the wider of the two.
 */
type GenderAnswer = Gender | null

const byGender = <T,>(gender: GenderAnswer, male: T, female: T, other: T): T =>
  gender === 'MALE' ? male : gender === 'FEMALE' ? female : other

/**
 * The printed lines for one item. `low`/`high` bound the normal range; the
 * borderline band sits between them and `lowSuspect`/`highSuspect`. Undefined
 * means the item has no line on that side.
 */
interface Lines {
  low?: number
  lowSuspect?: number
  high?: number
  highSuspect?: number
}

function lines(id: ItemId, gender: GenderAnswer): Lines {
  switch (id) {
    case 'sbp':
      return { high: 119, highSuspect: 139 }
    case 'dbp':
      return { high: 79, highSuspect: 89 }
    case 'glucose':
      return { high: 99, highSuspect: 125 }
    case 'totalChol':
      return { high: 199, highSuspect: 239 }
    case 'ldl':
      return { high: 129, highSuspect: 159 }
    case 'hdl':
      return { low: 40, lowSuspect: 40 }
    case 'tg':
      return { high: 149, highSuspect: 199 }
    case 'hb':
      return byGender<Lines>(
        gender,
        { low: 13, lowSuspect: 12, high: 16.5, highSuspect: 16.5 },
        { low: 12, lowSuspect: 10, high: 15.5, highSuspect: 15.5 },
        { low: 12, lowSuspect: 10, high: 16.5, highSuspect: 16.5 },
      )
    case 'ast':
      return { high: 40, highSuspect: 50 }
    case 'alt':
      return { high: 35, highSuspect: 45 }
    case 'ggt':
      return byGender<Lines>(gender, { high: 63, highSuspect: 77 }, { high: 35, highSuspect: 45 }, { high: 63, highSuspect: 77 })
    case 'creatinine':
      return { high: 1.5, highSuspect: 1.5 }
    case 'egfr':
      return { low: 60, lowSuspect: 60 }
    case 'bmi':
      return { low: 18.5, lowSuspect: 18.5, high: 22.9, highSuspect: 24.9 }
    case 'waist':
      return byGender<Lines>(gender, { high: 89.9, highSuspect: 89.9 }, { high: 84.9, highSuspect: 84.9 }, { high: 89.9, highSuspect: 89.9 })
  }
}

export function levelOf(id: ItemId, value: number, gender: GenderAnswer): Level {
  const l = lines(id, gender)
  if (l.lowSuspect !== undefined && value < l.lowSuspect) {
    // BMI under 18.5 is underweight: worth a look, not a suspected disease.
    return id === 'bmi' ? 1 : 2
  }
  if (l.low !== undefined && value < l.low) return 1
  if (l.highSuspect !== undefined && value > l.highSuspect) return 2
  if (l.high !== undefined && value > l.high) return 1
  return 0
}

/** Which way a flagged value leans — "low" reads differently from "high". */
export function directionOf(id: ItemId, value: number, gender: GenderAnswer): 'low' | 'high' | null {
  const l = lines(id, gender)
  if (l.low !== undefined && value < l.low) return 'low'
  if (l.high !== undefined && value > l.high) return 'high'
  return null
}

/** The normal range as the sheet would print it, e.g. "< 100" or "13.0–16.5". */
export function normalRange(id: ItemId, gender: GenderAnswer): string {
  const l = lines(id, gender)
  const d = ITEMS[id].decimals
  const f = (n: number) => n.toFixed(d)
  if (l.low !== undefined && l.high !== undefined) return `${f(l.low)}–${f(l.high)}`
  if (l.low !== undefined) return `≥ ${f(l.low)}`
  // As the sheet prints it: "< 120" for a line drawn at 120 (stored as 119, or 89.9
  // for waist), "≤ 40" for one drawn at 40.
  if (l.high !== undefined) {
    const next = Math.floor(l.high) + 1
    return d === 0 && (l.high % 1 !== 0 || next % 10 === 0) ? `< ${next}` : `≤ ${f(l.high)}`
  }
  return ''
}

export const formatValue = (id: ItemId, value: number) => value.toFixed(ITEMS[id].decimals)

// --- Conditions: what a group of items says about one part of the body. ---

export const CONDITION_IDS = ['bp', 'glucose', 'lipids', 'liver', 'kidney', 'blood', 'weight'] as const
export type ConditionId = (typeof CONDITION_IDS)[number]

export type DepartmentId =
  | 'cardiology'
  | 'endocrinology'
  | 'internal'
  | 'gastro'
  | 'nephrology'
  | 'familyMed'

/** Where on the body model a condition glows. See `BodyCloud` for the frame. */
export type OrganId = 'heart' | 'vessels' | 'pancreas' | 'liver' | 'kidneys' | 'blood' | 'abdomen'

export interface ConditionSpec {
  id: ConditionId
  items: ItemId[]
  organ: OrganId
  department: DepartmentId
}

export const CONDITIONS: Record<ConditionId, ConditionSpec> = {
  bp: { id: 'bp', items: ['sbp', 'dbp'], organ: 'heart', department: 'cardiology' },
  glucose: { id: 'glucose', items: ['glucose'], organ: 'pancreas', department: 'endocrinology' },
  lipids: { id: 'lipids', items: ['totalChol', 'ldl', 'hdl', 'tg'], organ: 'vessels', department: 'internal' },
  liver: { id: 'liver', items: ['ast', 'alt', 'ggt'], organ: 'liver', department: 'gastro' },
  kidney: { id: 'kidney', items: ['creatinine', 'egfr'], organ: 'kidneys', department: 'nephrology' },
  blood: { id: 'blood', items: ['hb'], organ: 'blood', department: 'internal' },
  weight: { id: 'weight', items: ['bmi', 'waist'], organ: 'abdomen', department: 'familyMed' },
}

// --- The form's two history questions. ---

export const HISTORY_IDS = [
  'hypertension',
  'diabetes',
  'dyslipidemia',
  'heartDisease',
  'stroke',
  'liverDisease',
  'kidneyDisease',
] as const
export type HistoryId = (typeof HISTORY_IDS)[number]

/** Which conditions a history answer bears on. Heart disease and stroke share the vascular two. */
export const HISTORY_CONDITIONS: Record<HistoryId, ConditionId[]> = {
  hypertension: ['bp'],
  diabetes: ['glucose'],
  dyslipidemia: ['lipids'],
  heartDisease: ['bp', 'lipids'],
  stroke: ['bp', 'lipids'],
  liverDisease: ['liver'],
  kidneyDisease: ['kidney'],
}

// --- The report: readings judged, grouped, and ordered. ---

export interface ItemResult {
  id: ItemId
  value: number
  level: Level
  direction: 'low' | 'high' | null
}

export interface ConditionResult {
  id: ConditionId
  level: Level
  items: ItemResult[]
  familyHistory: boolean
  diagnosed: boolean
}

export interface HealthReport {
  conditions: ConditionResult[]
  /** True when the numbers are the built-in example rather than the visitor's own. */
  sample: boolean
}

const touches = (ids: HistoryId[], condition: ConditionId) =>
  ids.some((h) => HISTORY_CONDITIONS[h].includes(condition))

/**
 * Judges every reading and orders the conditions so the one needing most attention
 * leads. Inside one level, a family history moves a condition up — the same number
 * means more when it runs in the family. A condition with no readings is left out
 * unless the visitor said it was diagnosed, which is worth showing on its own.
 */
export function buildReport(
  readings: Readings,
  gender: GenderAnswer,
  family: HistoryId[],
  diagnosed: HistoryId[],
  sample: boolean,
): HealthReport {
  const conditions = CONDITION_IDS.map((id): ConditionResult => {
    const items = CONDITIONS[id].items.flatMap((item): ItemResult[] => {
      const value = readings[item]
      if (value === undefined || !Number.isFinite(value)) return []
      return [{ id: item, value, level: levelOf(item, value, gender), direction: directionOf(item, value, gender) }]
    })
    return {
      id,
      level: items.reduce<Level>((m, i) => (i.level > m ? i.level : m), 0),
      items,
      familyHistory: touches(family, id),
      diagnosed: touches(diagnosed, id),
    }
  })
    .filter((c) => c.items.length > 0 || c.diagnosed)
    .map((c, order) => ({ c, order }))
    .sort(
      (a, b) =>
        b.c.level - a.c.level ||
        Number(b.c.familyHistory || b.c.diagnosed) - Number(a.c.familyHistory || a.c.diagnosed) ||
        a.order - b.order,
    )
    .map(({ c }) => c)
  return { conditions, sample }
}

/**
 * A believable sheet for the "try a sample" path: a few lines crossed, most not,
 * so the body map and the guide both have something to show.
 */
export const SAMPLE_READINGS: Readings = {
  sbp: 136,
  dbp: 86,
  glucose: 108,
  totalChol: 238,
  ldl: 164,
  hdl: 43,
  tg: 186,
  hb: 13.9,
  ast: 47,
  alt: 58,
  ggt: 72,
  creatinine: 0.92,
  egfr: 91,
  bmi: 25.8,
  waist: 88,
}
