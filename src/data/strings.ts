/**
 * Every sentence the reading is described with.
 *
 * The English branches of the Android app's `ui/i18n/` tables, kept in the same
 * shape: the result model carries numbers only, and each sentence is rendered from
 * those numbers at display time rather than baked into the reading. That is what
 * lets a stored report be re-read later without freezing the wording it was taken
 * with — and it is why the copy lives here and not in the screens.
 */
import type {
  AgeBand,
  AnalysisNotice,
  CaptureRejection,
  CategoryResult,
  Gender,
  SeverityLevel,
  SkinAnalysisResult,
  SkinCategory,
} from '../analysis/types'
import { focusCategories } from '../analysis/types'
import type { Pitch, Suits } from '../analysis/ranking'

// --- Enum labels (EnumStrings.kt) ---

/**
 * Title case because the design draws these as chip labels; prose that needs them
 * mid-sentence lowercases its own copy.
 */
export const categoryLabel = (c: SkinCategory): string =>
  ({
    PORES: 'Pores',
    LAXITY: 'Laxity',
    WRINKLES: 'Wrinkles',
    ACNE: 'Acne',
    PIGMENT: 'Pigmentation',
    REDNESS: 'Redness',
    BALANCE: 'Balance',
  })[c]

/**
 * Reassuring, never clinical: the worst rung says "look here first", not
 * "something is wrong".
 */
export const levelLabel = (l: SeverityLevel): string =>
  ({
    EASE: 'Comfortable',
    NORMAL: 'Steady',
    ATTENTION: 'Needs care',
    FOCUS: 'Focus first',
  })[l]

export const ageBandLabel = (b: AgeBand): string =>
  ({
    TEENS: 'Under 20',
    TWENTIES: '20s',
    THIRTIES: '30s',
    FORTIES: '40s',
    FIFTIES_PLUS: '50+',
  })[b]

export const genderLabel = (g: Gender): string =>
  ({ FEMALE: 'Female', MALE: 'Male', OTHER: 'Prefer not to say' })[g]

export const clinicBadgeLabel = (b: 'AVAILABLE' | 'POPULAR' | 'BUSY'): string =>
  ({ AVAILABLE: 'BOOKABLE', POPULAR: 'POPULAR', BUSY: 'BUSY' })[b]

// --- Headline and cohort line (AnalysisStrings.kt) ---

const sentenceCase = (phrase: string): string =>
  phrase.charAt(0).toUpperCase() + phrase.slice(1).toLowerCase()

/** "pores and pigmentation", "wrinkles, acne and laxity". */
const joinAnd = (words: string[]): string => {
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]
  if (words.length === 2) return `${words[0]} and ${words[1]}`
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
}

/** The line above the category rows. */
export function analysisHeadline(result: SkinAnalysisResult): string {
  const focus = focusCategories(result)
  if (focus.length === 0) return 'Healthy overall. Nothing needs attention right now.'
  // The design writes the names as prose here, not as the chip labels they are
  // elsewhere, so the joined phrase is recased to open the sentence.
  const phrase = sentenceCase(joinAnd(focus.map(categoryLabel)))
  return `Healthy overall. ${phrase} ${focus.length === 1 ? 'is' : 'are'} worth attention.`
}

/**
 * Who the average is taken over: "women in their 30s".
 *
 * Deliberately not built from the chip labels. Those are things the user taps
 * ("30s", "Prefer not to say"); this is a noun phrase inside a sentence, which
 * English cannot form from the chip alone. A gender the user did not state also
 * has no cohort of its own — the comparison then falls back to everyone in that
 * age band, which is a different word again.
 */
function cohort(band: AgeBand | null, gender: Gender | null): string {
  const people = gender === 'FEMALE' ? 'women' : gender === 'MALE' ? 'men' : 'people'
  if (band === null) return gender === null ? '' : people
  return {
    TEENS: `${people} under 20`,
    TWENTIES: `${people} in their 20s`,
    THIRTIES: `${people} in their 30s`,
    FORTIES: `${people} in their 40s`,
    FIFTIES_PLUS: `${people} aged 50 and over`,
  }[band]
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** The cohort line under the headline. */
export function analysisComparison(result: SkinAnalysisResult): string {
  const who = cohort(result.ageBand, result.gender)
  const gap = Math.abs(result.cohortDiff)
  const unit = gap === 1 ? 'point' : 'points'
  const against = who === '' ? 'the average' : `the average for ${who}`
  const body =
    result.cohortDiff === 0
      ? `The same as ${against}`
      : result.cohortDiff > 0
        ? `${gap} ${unit} above ${against}`
        : `${gap} ${unit} below ${against}`
  // 0 is "never analysed" rather than 1970 — a stamp would be a lie.
  const date =
    result.analyzedAtMillis === 0 ? '' : DATE_FORMAT.format(new Date(result.analyzedAtMillis))
  return date === '' ? body : `${body} · ${date}`
}

// --- One line per category row ---

const EXPLANATIONS: Record<SkinCategory, Record<SeverityLevel, string>> = {
  PORES: {
    EASE: 'Pores are barely visible and the surface is even.',
    NORMAL: 'A few pores show on the inner cheeks, nothing beyond that.',
    ATTENTION: 'Widened around the nose and inner cheeks, with more oil than average.',
    FOCUS: 'Pores are widened across the face and the surface reads as rough.',
  },
  LAXITY: {
    EASE: 'Jawline and cheeks are holding their line.',
    NORMAL: 'Jawline still defined. Cheeks are beginning to soften.',
    ATTENTION: 'Cheeks and jawline are starting to look heavier.',
    FOCUS: 'Slackening is noticeable, so firmness is the place to start.',
  },
  WRINKLES: {
    EASE: 'Faint expression lines at the eyes. Moisturiser is enough for now.',
    NORMAL: 'Fine lines are showing at the eyes and across the forehead.',
    ATTENTION: 'Lines are beginning to stay once the expression relaxes.',
    FOCUS: 'Lines on the forehead and around the eyes are clearly set.',
  },
  ACNE: {
    EASE: 'No inflammation. Slight congestion across the forehead.',
    NORMAL: 'Some redness, and marks left by past breakouts.',
    ATTENTION: 'Redness covers a wide area, so calming it comes first.',
    FOCUS: 'Inflamed breakouts in several places. Worth seeing a doctor.',
  },
  PIGMENT: {
    EASE: 'Tone is holding evenly.',
    NORMAL: 'Light spots here and there.',
    ATTENTION: 'Tone is uneven across the cheeks and cheekbones. Sun protection comes first.',
    FOCUS: 'Faint melasma and sun spots gather above the cheekbones. Sun protection comes first.',
  },
  REDNESS: {
    EASE: 'Very little redness, and the tone stays calm.',
    NORMAL: 'Light redness shows around the cheeks and nose.',
    ATTENTION: 'Redness has spread across the face, so calming it comes first.',
    FOCUS: 'Visible capillaries and redness that will not settle. Worth seeing a doctor.',
  },
  BALANCE: {
    EASE: 'Brightness and texture look even on both sides.',
    NORMAL:
      'A slight brightness difference between the two sides — usually just angle or lighting.',
    ATTENTION:
      'One side reads noticeably brighter or more shadowed than the other. Often lighting — worth another shot from a different angle before reading too much into it.',
    FOCUS:
      'If this same left-right difference shows up across several photos, it may reflect a real volume difference between the cheeks. Worth asking about filler at a consultation.',
  },
}

/** The sentence under one category row's bar. */
export const analysisExplanation = (row: CategoryResult): string =>
  EXPLANATIONS[row.category][row.level]

/**
 * A row that did not come from the photograph says so, on the row.
 *
 * Only LAXITY has one. `laxityFromAge` returns a number chosen from the stated age
 * band and reads no pixels at all, which is invisible next to six rows that were
 * measured — and the row sits in the same ranked list, so it can be presented as
 * the thing to treat first on the strength of a birthday.
 */
export const analysisRowNote = (row: CategoryResult): string | null =>
  row.category === 'LAXITY'
    ? 'Estimated from your age, not from this photo. A still frame cannot show how skin springs back.'
    : null

// --- Skin tone (analysis/phototype.ts) ---

export const SKIN_TONE = {
  title: 'Skin tone',
  /** Heading over the type the user told us. */
  reported: 'You said',
  /** Heading over what the pixels said. */
  measured: 'This photo reads',
  question: 'After an hour of midday sun, unprotected, your skin:',
  questionHint: 'Optional. Fitzpatrick is a question about sun reaction — no camera can see it.',
  clear: 'Prefer not to say',
  unanswered: 'Not answered',
  /** Shown on the result card when the form question was walked past. */
  ask: 'You did not answer the sun-reaction question, so there is nothing to check the photo against. One tap fixes that:',
  /** Shown when the two agree, or sit one class apart. */
  agrees: 'The photo agrees with what you said.',
  near: 'One class apart — normal for room lighting.',
  /** Two or more classes apart. */
  differs:
    'Two or more classes apart. Lighting moves this reading more than skin does, so trust your own answer.',
  /** Always shown under the measured value. */
  caveat:
    'Measured as ITA°, an angle in a colour space — it reads the skin as lit, not as pigmented. Without a colour reference card in frame, the same face can read several classes lighter by a window than under a lamp.',
  unusable: 'The frame was too dark or too bright for a tone reading.',
  none: 'No tone reading — too little skin in the frame.',
  /** The skip path took no photo at all, so there was nothing to read. */
  noPhoto: 'No photo was taken, so there is no tone reading to compare against.',
} as const

// --- Capture caveats ---

const NOTICES: Record<AnalysisNotice, string> = {
  SMALL_FACE:
    'Your face sat small inside the outline, so this reading may be less accurate. Try again with your face filling the outline.',
  TOO_DARK:
    'The frame was dark, so the reading may come out lower than it should. Try again somewhere brighter.',
  TOO_BRIGHT:
    'Strong light washed the texture out. Move out of direct sunlight and take it again for a closer reading.',
  BLURRY:
    'The frame moved, so the texture was hard to read. Another try will be more accurate.',
  NO_FACE_FOUND:
    'No face was found in the frame, so this is a sample reading. Take another somewhere bright, with your face inside the outline.',
  NO_PHOTO: 'You continued without a capture, so this is a sample reading.',
}

/** Null when the capture had nothing worth warning about. */
export const analysisNotice = (result: SkinAnalysisResult): string | null =>
  result.notice ? NOTICES[result.notice] : null

// --- The capture screen (CameraStrings.kt) ---

/**
 * What to fix, one sentence per rejection. Each names what the frame showed and
 * the single move that changes it — the dialog offers no other choice, so a line
 * the user cannot act on just sends them back into the same rejection.
 */
const REJECTIONS: Record<CaptureRejection, string> = {
  NO_FACE:
    'No face was found in the frame. Try again somewhere bright, with your face clearly visible.',
  MULTIPLE_FACES:
    'There is more than one face in the frame. Take it again with just you in view.',
  FACE_TOO_SMALL: 'Your face came out too small. Come a little closer and fill the outline.',
  FACE_OFF_CENTRE: 'Your face sat outside the outline. Line it up inside and take it again.',
}

export const CAPTURE = {
  rejectionBody: (reason: CaptureRejection) => REJECTIONS[reason],
  gateTitle: 'This capture cannot be read',
  gateCta: 'Retake',
  /**
   * Appended for a user the gate has already turned away twice. On a first miss it
   * would read as "give up", which is why the screen holds it back until then.
   */
  gateSkipHint: "If it keeps happening, you can look around with 'Skip the capture' below.",
  lightingTip:
    'Sit facing a window or a bright lamp. Remove glasses and masks for a sharper reading.',
  /** What the viewfinder asks for once a face is in frame. */
  livenessPrompt: 'Please blink once.',
  /** On the frame the blink lands. The shutter follows on its own, so this reports. */
  livenessConfirmed: 'Got it. Taking the capture.',
  /** When the blinks are not registering — names the two things that defeat it. */
  livenessTrouble:
    "The blink isn't registering. Take your glasses off and try somewhere a little brighter.",
  waitingForFace: 'Waiting for a face in the outline.',
  skip: 'Skip the capture',
} as const

// --- How a treatment's level sits against the reading (ranking.ts `pitchFor`) ---

export const FIT = {
  heading: 'SUITS YOU IF',
  meantFor: 'MEANT FOR',
  /** Without a reading, one line per area: "Pores: Needs care, Focus first". */
  meantForLines: (suits: Suits): string[] =>
    (Object.entries(suits) as [SkinCategory, SeverityLevel[]][]).map(
      ([category, levels]) => `${categoryLabel(category)}: ${levels.map(levelLabel).join(', ')}`,
    ),
  /** With a reading, one sentence about the area that put this treatment here. */
  verdict: (pitch: Pitch): string => {
    const where = `Your reading puts ${categoryLabel(pitch.category).toLowerCase()} at "${levelLabel(pitch.level)}"`
    if (pitch.verdict === 'fits') return `${where} — the level this is meant for.`
    if (pitch.verdict === 'stronger')
      return `${where}, milder than this is meant for. A gentler option may be all you need.`
    return `${where}. This may be too gentle on its own, so ask about the stronger options too.`
  },
} as const

// --- Chrome that is not derived from a reading ---

export const UI = {
  brand: 'Solution',
  scoreLabel: 'SKIN SCORE',
  outOf: '/ 100',
  /**
   * The number under one category's bar.
   *
   * Deliberately not "42%". Nothing here is a percentage of anything — the row is
   * a 0..100 attention score built by putting one measurement on a ramp between
   * two hand-set anchors, so "42%" invited the reading "42% of your face has this",
   * which is not what was measured. See `skinScoring.ts`.
   */
  rowScore: (score: number) => `Score ${score}`,
  seeTreatments: 'See matched treatments',
  retake: 'Take another reading',
  treatmentsTitle: 'Matched treatments',
  topMatch: 'TOP MATCH',
  priceRange: 'PRICE RANGE',
  perSession: 'PER SESSION',
  course: 'COURSE',
  downtime: 'DOWNTIME',
  results: 'RESULTS',
  priceNote:
    'Chosen by our specialists. Prices are sample data for this prototype; final pricing is confirmed at the clinic.',
  partnerOffer:
    'Take your reading here, then visit a partner clinic and their full MARK-VU skin analysis — normally a paid service — is free.',
  /** "Pigmentation first · 6 matched" */
  treatmentsSubtitle: (category: string | null, count: number) =>
    category ? `${category} first · ${count} matched` : `Matched to your reading · ${count}`,
} as const
