import { classificationFor } from './treatmentConcerns'
import source from './treatments.generated.json'

export type TreatmentSource = (typeof source.treatments)[number]

import type { SeverityLevel, SkinCategory } from '../analysis/types'

export interface TreatmentStep {
  order: string
  title: string
  body: string
}

export interface AftercareNote {
  when: string
  what: string
}

export interface Treatment {
  source?: TreatmentSource
  id: string
  /** Letter-spaced eyebrow on the detail screen, e.g. "PORES · LAXITY". */
  tag: string
  name: string
  /** Compact name used in headers and the clinic list. */
  shortName: string
  /** Long-form copy on the detail screen. */
  summary: string
  /** One-liner on the recommendation card. */
  cardSummary: string
  duration: string
  steps: TreatmentStep[]
  aftercare: AftercareNote[]
  cautions: string[]
  pairedProductIds: string[]
  /** Categories this treatment answers — drives the recommendation ordering. */
  targets: SkinCategory[]
  /**
   * The reading levels this treatment is pitched at, for each area it answers.
   * Inside one area, the matched list puts a treatment whose level fits the reading
   * ahead of one that does not — so a "Steady" reading leads with the gentle option
   * and a "Focus first" one with the strong. Where several fit, catalogue order
   * decides, so each area's entries are listed in the order they should be offered.
   */
  suits: Partial<Record<SkinCategory, SeverityLevel[]>>
  /** "Suits you if" on the detail screen: concrete situations, not categories. */
  goodFor: string[]
  /** How many sessions and how far apart, e.g. "3–5 sessions, 4 weeks apart". */
  course: string
  /** What recovery looks like, e.g. "Redness 2–3 days". */
  downtime: string
  /** When it shows, and how long it lasts. */
  results: string
  /** What the price range buys, where that varies by amount: "300 shots", "2 cc". */
  priceBasis?: string
}

export type Brand = 'SOLION' | 'LUNION'

export interface ProductKey {
  name: string
  benefit: string
}

export interface Product {
  id: string
  brand: Brand
  /** Full house line, e.g. "LUNION · NIGHT". */
  line: string
  name: string
  /** Why it pairs with the treatment — shown on the detail screen. */
  tie: string
  /** One-line benefit on the paired-product card. */
  benefit: string
  description: string
  price: number
  size: string
  keys: ProductKey[]
}

export type ClinicBadge = 'AVAILABLE' | 'POPULAR' | 'BUSY'

export interface Clinic {
  id: string
  name: string
  lat: number
  lng: number
  /** Pre-formatted walking distance, e.g. "3 min walk · 240 m". */
  distanceLabel: string
  badge: ClinicBadge
  /** Free-text hook, e.g. "3 consultation slots left today". */
  note: string
  address: string
  /** treatmentId -> price at this clinic (KRW). Sample data. */
  priceByTreatmentId: Record<string, number>
  districtKey: string
  /** How many community posts mention it — shown on the My List card. */
  posts: number
}

export interface District {
  key: string
  name: string
  blurb: string
}

export interface CommunityPost {
  id: string
  author: string
  initials: string
  /** "France · 2 days ago · Myeongdong" — already assembled. */
  meta: string
  verified: boolean
  treatmentTag: string
  clinicTag: string
  likes: number
  comments: number
  text: string
  /** Language-independent join keys, used by the feed filters. */
  treatmentId: string
  districtKey: string
}

export interface EarnRule {
  id: string
  title: string
  subtitle: string
  pointsLabel: string
}

export type RewardKind = 'PHYSICAL' | 'COUPON'

export interface RewardStoreItem {
  id: string
  kind: RewardKind
  name: string
  costLabel: string
  costPoints: number
  affordable: boolean
  art: string
  /** The QR screen's "how to use it" copy — differs by kind in the design. */
  description: string
  expiry: string
}

// --- Ids. The join keys, matching the Android catalogue exactly. ---

export const TX_TONING = 'tx_toning'
export const TX_PORE_LIFT = 'tx_pore_lift'
export const TX_SKIN_BOOSTER = 'tx_skin_booster'
export const TX_ACNE_CARE = 'tx_acne_care'
export const TX_REDNESS_CARE = 'tx_redness_care'
export const TX_FILLER = 'tx_filler'
export const TX_BRIGHTENING = 'tx_brightening'
export const TX_PICO_FRAXEL = 'tx_pico_fraxel'
export const TX_SKIN_BOTOX = 'tx_skin_botox'
export const TX_CAPRI = 'tx_capri'
export const TX_INFLAMED_ACNE = 'tx_inflamed_acne'
export const TX_SECRET_RF = 'tx_secret_rf'
export const TX_WRINKLE_BOTOX = 'tx_wrinkle_botox'
export const TX_REJURAN = 'tx_rejuran'
export const TX_SHURINK = 'tx_shurink'
export const TX_THERMAGE = 'tx_thermage'
export const TX_ULTHERA = 'tx_ulthera'
export const TX_CALMING = 'tx_calming'
export const TX_JAW_BOTOX = 'tx_jaw_botox'

export const PD_RECOVERY_SERUM = 'pd_lunion_recovery_serum'
export const PD_SUN_FLUID = 'pd_solion_sun_fluid'
export const PD_REPAIR_CREAM = 'pd_lunion_repair_cream'
export const PD_HYDRA_ESSENCE = 'pd_solion_hydra_essence'

export const DISTRICT_MYEONGDONG = 'myeongdong'
export const DISTRICT_HONGDAE = 'hongdae'
export const DISTRICT_GANGNAM = 'gangnam'

/** Display-only: no earn or spend events exist, so the balance is a constant. */
export const STARTING_POINTS = 1240
export const NEXT_TIER_POINTS = 2000

export const DISTRICTS: District[] = [
  {
    key: DISTRICT_MYEONGDONG,
    name: 'Myeongdong',
    blurb: 'Shopping streets and the most tourist-facing clinics.',
  },
  {
    key: DISTRICT_HONGDAE,
    name: 'Hongdae',
    blurb: 'Young, late-opening, walkable from the west line.',
  },
  {
    key: DISTRICT_GANGNAM,
    name: 'Gangnam',
    blurb: 'The largest clinics and the most specialised equipment.',
  },
]

/**
 * Sample prices for the thirteen added treatments: one row per treatment, one
 * column per clinic in `PRICE_COLUMNS` order. Each clinic keeps the price position
 * it already holds across the original six — a cheap clinic stays cheap — with a
 * little variation per treatment, so no one clinic is LOWEST for everything. The
 * bands sit at the same tourist-facing level as the original six.
 */
const PRICE_COLUMNS: string[] = [
  'c_solution_myeongdong',
  'c_myeongdong_light',
  'c_euljiro_skin',
  'c_chungmuro',
  'c_hongdae_aurora',
  'c_yeonnam_lab',
  'c_sangsu_derma',
  'c_hapjeong_glow',
  'c_gangnam_meridian',
  'c_sinsa_institute',
  'c_yeoksam_clear',
  'c_apgujeong_line',
]

const ADDED_PRICES: Record<string, number[]> = {
  [TX_BRIGHTENING]: [90000, 75000, 93000, 109000, 78000, 72000, 91000, 98000, 87000, 87000, 105000, 120000],
  [TX_PICO_FRAXEL]: [201000, 182000, 219000, 240000, 204000, 189000, 207000, 238000, 208000, 207000, 223000, 260000],
  [TX_SKIN_BOTOX]: [114000, 113000, 135000, 145000, 113000, 106000, 122000, 141000, 119000, 130000, 138000, 180000],
  [TX_CAPRI]: [131000, 110000, 141000, 145000, 129000, 121000, 128000, 138000, 142000, 130000, 146000, 164000],
  [TX_INFLAMED_ACNE]: [108000, 92000, 107000, 134000, 94000, 93000, 108000, 121000, 126000, 115000, 121000, 143000],
  [TX_SECRET_RF]: [184000, 151000, 195000, 236000, 185000, 173000, 188000, 231000, 192000, 189000, 222000, 245000],
  [TX_WRINKLE_BOTOX]: [96000, 71000, 85000, 109000, 85000, 75000, 99000, 126000, 99000, 97000, 113000, 143000],
  [TX_REJURAN]: [293000, 279000, 304000, 337000, 280000, 251000, 281000, 334000, 318000, 287000, 347000, 380000],
  [TX_SHURINK]: [230000, 206000, 221000, 249000, 221000, 180000, 216000, 251000, 229000, 220000, 261000, 320000],
  [TX_THERMAGE]: [1490000, 1350000, 1540000, 1830000, 1580000, 1470000, 1540000, 1710000, 1650000, 1660000, 1840000, 1910000],
  [TX_ULTHERA]: [1530000, 1470000, 1600000, 1860000, 1570000, 1300000, 1630000, 1860000, 1680000, 1660000, 1740000, 2040000],
  [TX_CALMING]: [68000, 68000, 81000, 95000, 65000, 71000, 82000, 95000, 80000, 84000, 89000, 110000],
  [TX_JAW_BOTOX]: [120000, 78000, 140000, 175000, 93000, 104000, 107000, 174000, 131000, 108000, 159000, 206000],
}

/** One clinic's column of `ADDED_PRICES`, keyed by treatment id. */
const addedPricesAt = (clinicId: string): Record<string, number> => {
  const column = PRICE_COLUMNS.indexOf(clinicId)
  return Object.fromEntries(Object.entries(ADDED_PRICES).map(([id, row]) => [id, row[column]]))
}

// CSV supplies the detail and prices; reviewed concern metadata supplies card copy and ranking.
// Empty legacy fields mean “not supplied”, never inferred.
export const TREATMENTS: Treatment[] = source.treatments.map((row) => ({
  id: row.id, name: row.name, shortName: row.name, tag: row.category,
  summary: row.overview, cardSummary: classificationFor(row.id).summary,
  duration: '', course: '', downtime: '', results: '',
  steps: [], aftercare: [], pairedProductIds: [],
  goodFor: row.recommendedFor, cautions: row.cautions,
  targets: classificationFor(row.id).matchTargets, suits: {}, source: row,
}))

export const PRODUCTS: Product[] = [
  {
    id: PD_SUN_FLUID,
    brand: 'SOLION',
    line: 'SOLION · DAYTIME',
    name: 'Daily Sun Fluid SPF50+',
    tie: 'The first thing to wear for two weeks after pigmentation work.',
    benefit:
      'A water-thin sunscreen with no white cast — the one thing to keep on after pigmentation work.',
    description:
      'Spreads as thin as water, with no white cast and no pilling under makeup. It keeps faded pigmentation from darkening again while your skin settles.',
    price: 38000,
    size: '50 ml · about 2 months',
    keys: [
      { name: 'SPF50+ PA++++', benefit: 'Highest rating sold in Korea' },
      { name: 'No white cast', benefit: 'Reapply over makeup during the day' },
      { name: 'Water base', benefit: 'Comfortable through a full day of walking' },
    ],
  },
  {
    id: PD_RECOVERY_SERUM,
    brand: 'LUNION',
    line: 'LUNION · NIGHT',
    name: 'Recovery Night Serum',
    tie: 'Made for the nights right after a laser session.',
    benefit: 'Calms skin that feels tight or warm after a laser session, overnight.',
    description:
      'Layers panthenol and madecassoside in thin passes, matching the hours when skin repairs itself. It takes the heat and tightness out of a treated face by morning, with no fragrance or colourant.',
    price: 62000,
    size: '30 ml · about 8 weeks',
    keys: [
      { name: 'Panthenol', benefit: 'Softens tight, dry-feeling skin' },
      { name: 'Madecassoside', benefit: 'Settles flushing and warmth' },
      { name: 'Fragrance-free', benefit: 'Safe on the night of treatment' },
    ],
  },
  {
    id: PD_REPAIR_CREAM,
    brand: 'LUNION',
    line: 'LUNION · NIGHT',
    name: 'Repair Night Cream',
    tie: 'For the nights after needling or radiofrequency work.',
    benefit: 'Rebuilds the barrier after needling or RF work while you sleep.',
    description:
      'Ceramides and squalane refill a barrier that has been thinned by treatment, then hold the water in. It sits light on the face and is still there in the morning.',
    price: 54000,
    size: '50 ml · about 10 weeks',
    keys: [
      { name: 'Ceramides', benefit: 'Refills a thinned skin barrier' },
      { name: 'Squalane', benefit: 'Stops water escaping overnight' },
      { name: 'Low irritation', benefit: 'Usable while redness fades' },
    ],
  },
  {
    id: PD_HYDRA_ESSENCE,
    brand: 'SOLION',
    line: 'SOLION · DAYTIME',
    name: 'Hydra Glow Essence',
    tie: 'Keeps the water from your booster session where it belongs.',
    benefit: 'Holds onto the water a skin booster just put in.',
    description:
      'Hyaluronic acid in several molecule sizes fills the surface and the layer under it. Absorbs without tack, so sunscreen and makeup go on top without rolling.',
    price: 46000,
    size: '50 ml · about 8 weeks',
    keys: [
      { name: 'Multi-weight HA', benefit: 'Fills surface and deeper layers' },
      { name: 'Panthenol', benefit: 'Eases tightness at injection points' },
      { name: 'Light finish', benefit: 'Sunscreen goes on top cleanly' },
    ],
  },
]

/**
 * Per-treatment override for a product's tie line, where the design words the
 * pairing differently depending on which treatment led here.
 */
const INJECTION_NIGHTS = 'Calms the injection points over the first few nights.'
const COLLAGEN_DAYS = 'Daily protection for skin that is rebuilding collagen.'

const TIE_OVERRIDES: Record<string, Record<string, string>> = {
  [PD_RECOVERY_SERUM]: {
    [TX_REDNESS_CARE]: 'For the nights after a vascular laser session, while the flush settles.',
    [TX_FILLER]: INJECTION_NIGHTS,
    [TX_SKIN_BOTOX]: INJECTION_NIGHTS,
    [TX_WRINKLE_BOTOX]: INJECTION_NIGHTS,
    [TX_JAW_BOTOX]: INJECTION_NIGHTS,
    [TX_REJURAN]: 'Settles the injection points while the small bumps absorb.',
    [TX_CALMING]: 'Its madecassoside carries the calming on overnight.',
    [TX_BRIGHTENING]: 'Settles any tingle from the current overnight.',
  },
  [PD_SUN_FLUID]: {
    [TX_REDNESS_CARE]: 'Daily sunscreen is what stops the same vessels dilating again.',
    [TX_CALMING]: 'UV dilates the same vessels the calming care has just settled.',
    [TX_CAPRI]: 'Lasered, extracted skin burns easily for a week.',
    [TX_SECRET_RF]: 'Needled skin burns easily while the channels close.',
    [TX_INFLAMED_ACNE]: 'Essential for the 48 hours after light therapy, and for the marks after.',
    [TX_SHURINK]: COLLAGEN_DAYS,
    [TX_THERMAGE]: COLLAGEN_DAYS,
    [TX_ULTHERA]: COLLAGEN_DAYS,
    [TX_JAW_BOTOX]: 'The injection needs nothing — this is the one daily step worth keeping anyway.',
  },
  [PD_REPAIR_CREAM]: {
    [TX_CAPRI]: 'Rebuilds the barrier after a laser pass and extraction.',
    [TX_INFLAMED_ACNE]: 'Keeps the barrier calm while inflamed spots heal.',
    [TX_SHURINK]: 'Keeps skin comfortable while the heat from the ultrasound settles.',
    [TX_ULTHERA]: 'Keeps skin comfortable while the heat from the ultrasound settles.',
  },
  [PD_HYDRA_ESSENCE]: {
    [TX_SKIN_BOTOX]: 'Light hydration that will not weigh on freshly treated pores.',
    [TX_WRINKLE_BOTOX]: 'Hydration softens the fine lines a toxin does not reach.',
  },
}

export function tieFor(product: Product, treatmentId: string): string {
  return TIE_OVERRIDES[product.id]?.[treatmentId] ?? product.tie
}

/**
 * Clinics per district.
 *
 * The Myeongdong four and their prices are the Android catalogue's, which is the
 * same set the design draws. Hongdae and Gangnam are the design's own rows; their
 * prices for the two extra treatments follow the spread the other columns already
 * have.
 */
const price = (
  toning: number,
  poreLift: number,
  booster: number,
  acne: number,
  redness: number,
  filler: number,
): Record<string, number> => ({
  [TX_TONING]: toning,
  [TX_PORE_LIFT]: poreLift,
  [TX_SKIN_BOOSTER]: booster,
  [TX_ACNE_CARE]: acne,
  [TX_REDNESS_CARE]: redness,
  [TX_FILLER]: filler,
})

export const CLINICS: Clinic[] = [
  {
    id: 'c_solution_myeongdong',
    name: 'SoLuTion Clinic Myeongdong',
    lat: 37.56338,
    lng: 126.98405,
    distanceLabel: '3 min walk · 240 m',
    badge: 'AVAILABLE',
    note: 'Reads your SoLuTion result directly',
    address: '12 Myeongdong 8-gil, Jung-gu, 3F',
    priceByTreatmentId: {
      ...price(150000, 480000, 290000, 95000, 160000, 450000),
      ...addedPricesAt('c_solution_myeongdong'),
    },
    districtKey: DISTRICT_MYEONGDONG,
    posts: 24,
  },
  {
    id: 'c_myeongdong_light',
    name: 'Myeongdong Light Skin',
    lat: 37.56455,
    lng: 126.9856,
    distanceLabel: '6 min walk · 480 m',
    badge: 'POPULAR',
    note: '3 consultation slots left today',
    address: '34 Myeongdong-gil, Jung-gu, 5F',
    priceByTreatmentId: {
      ...price(135000, 520000, 250000, 88000, 145000, 400000),
      ...addedPricesAt('c_myeongdong_light'),
    },
    districtKey: DISTRICT_MYEONGDONG,
    posts: 41,
  },
  {
    id: 'c_euljiro_skin',
    name: 'Euljiro Skin Studio',
    lat: 37.566,
    lng: 126.9886,
    distanceLabel: '9 min walk · 700 m',
    badge: 'AVAILABLE',
    note: 'Weekday evenings until 20:00',
    address: '66 Euljiro, Jung-gu, 2F',
    priceByTreatmentId: {
      ...price(165000, 450000, 320000, 110000, 175000, 500000),
      ...addedPricesAt('c_euljiro_skin'),
    },
    districtKey: DISTRICT_MYEONGDONG,
    posts: 12,
  },
  {
    id: 'c_chungmuro',
    name: 'Chungmuro Derma Center',
    lat: 37.56145,
    lng: 126.9929,
    distanceLabel: '12 min walk · 1.0 km',
    badge: 'BUSY',
    note: 'Fully booked this week',
    address: '18 Chungmuro, Jung-gu, 4F',
    priceByTreatmentId: {
      ...price(180000, 610000, 275000, 120000, 195000, 550000),
      ...addedPricesAt('c_chungmuro'),
    },
    districtKey: DISTRICT_MYEONGDONG,
    posts: 7,
  },

  {
    id: 'c_hongdae_aurora',
    name: 'Hongdae Aurora Clinic',
    lat: 37.5569,
    lng: 126.9239,
    distanceLabel: '4 min walk · 300 m',
    badge: 'AVAILABLE',
    note: 'Open until 21:00 on weekdays',
    address: '20 Wausan-ro, Mapo-gu, 6F',
    priceByTreatmentId: {
      ...price(142000, 495000, 268000, 90000, 152000, 460000),
      ...addedPricesAt('c_hongdae_aurora'),
    },
    districtKey: DISTRICT_HONGDAE,
    posts: 33,
  },
  {
    id: 'c_yeonnam_lab',
    name: 'Yeonnam Skin Lab',
    lat: 37.5552,
    lng: 126.926,
    distanceLabel: '7 min walk · 550 m',
    badge: 'POPULAR',
    note: 'English and Japanese counselling',
    address: '45 Donggyo-ro, Mapo-gu, 3F',
    priceByTreatmentId: {
      ...price(128000, 530000, 245000, 82000, 138000, 405000),
      ...addedPricesAt('c_yeonnam_lab'),
    },
    districtKey: DISTRICT_HONGDAE,
    posts: 52,
  },
  {
    id: 'c_sangsu_derma',
    name: 'Sangsu Derma Room',
    lat: 37.5584,
    lng: 126.9223,
    distanceLabel: '10 min walk · 780 m',
    badge: 'AVAILABLE',
    note: 'Small clinic, one doctor',
    address: '9 Sangsu-dong, Mapo-gu, 2F',
    priceByTreatmentId: {
      ...price(158000, 470000, 300000, 105000, 168000, 520000),
      ...addedPricesAt('c_sangsu_derma'),
    },
    districtKey: DISTRICT_HONGDAE,
    posts: 9,
  },
  {
    id: 'c_hapjeong_glow',
    name: 'Hapjeong Glow Clinic',
    lat: 37.5538,
    lng: 126.9275,
    distanceLabel: '14 min walk · 1.1 km',
    badge: 'BUSY',
    note: 'Next opening Thursday',
    address: '77 Yanghwa-ro, Mapo-gu, 5F',
    priceByTreatmentId: {
      ...price(175000, 588000, 282000, 118000, 188000, 560000),
      ...addedPricesAt('c_hapjeong_glow'),
    },
    districtKey: DISTRICT_HONGDAE,
    posts: 15,
  },

  {
    id: 'c_gangnam_meridian',
    name: 'Gangnam Meridian Dermatology',
    lat: 37.4979,
    lng: 127.0276,
    distanceLabel: '5 min walk · 380 m',
    badge: 'AVAILABLE',
    note: 'Six devices for pigmentation alone',
    address: '412 Gangnam-daero, Gangnam-gu, 11F',
    priceByTreatmentId: {
      ...price(168000, 520000, 310000, 112000, 178000, 490000),
      ...addedPricesAt('c_gangnam_meridian'),
    },
    districtKey: DISTRICT_GANGNAM,
    posts: 68,
  },
  {
    id: 'c_sinsa_institute',
    name: 'Sinsa Skin Institute',
    lat: 37.5001,
    lng: 127.0254,
    distanceLabel: '8 min walk · 620 m',
    badge: 'POPULAR',
    note: 'Tourist tax refund on site',
    address: '150 Dosan-daero, Gangnam-gu, 7F',
    priceByTreatmentId: {
      ...price(155000, 575000, 288000, 98000, 165000, 440000),
      ...addedPricesAt('c_sinsa_institute'),
    },
    districtKey: DISTRICT_GANGNAM,
    posts: 84,
  },
  {
    id: 'c_yeoksam_clear',
    name: 'Yeoksam Clear Clinic',
    lat: 37.5012,
    lng: 127.0308,
    distanceLabel: '11 min walk · 850 m',
    badge: 'AVAILABLE',
    note: 'Saturday consultations available',
    address: '25 Teheran-ro, Gangnam-gu, 4F',
    priceByTreatmentId: {
      ...price(185000, 498000, 335000, 125000, 198000, 545000),
      ...addedPricesAt('c_yeoksam_clear'),
    },
    districtKey: DISTRICT_GANGNAM,
    posts: 21,
  },
  {
    id: 'c_apgujeong_line',
    name: 'Apgujeong Line Derma',
    lat: 37.4963,
    lng: 127.0325,
    distanceLabel: '16 min walk · 1.3 km',
    badge: 'BUSY',
    note: 'Waitlist only until next week',
    address: '60 Apgujeong-ro, Gangnam-gu, 9F',
    priceByTreatmentId: {
      ...price(210000, 640000, 360000, 140000, 225000, 600000),
      ...addedPricesAt('c_apgujeong_line'),
    },
    districtKey: DISTRICT_GANGNAM,
    posts: 30,
  },
]

const SAMPLE_POSTS: CommunityPost[] = [
  {
    id: 'post_marie',
    author: 'Marie L.',
    initials: 'ML',
    meta: 'France · 2 days ago · Myeongdong',
    verified: true,
    treatmentTag: 'Laser Toning',
    clinicTag: 'SoLuTion Myeongdong',
    likes: 128,
    comments: 24,
    text: 'Two sessions in and the pigmentation on my cheeks is visibly lighter. Everything was explained in English before they started.',
    treatmentId: TX_TONING,
    districtKey: DISTRICT_MYEONGDONG,
  },
  {
    id: 'post_dan',
    author: 'Dan K.',
    initials: 'DK',
    meta: 'Australia · 4 days ago · Hongdae',
    verified: true,
    treatmentTag: 'RF Lifting',
    clinicTag: 'Hongdae Aurora',
    likes: 96,
    comments: 31,
    text: 'Redness lasted about two days, roughly what they told me. Booked a second session before flying home.',
    treatmentId: TX_PORE_LIFT,
    districtKey: DISTRICT_HONGDAE,
  },
  {
    id: 'post_sofia',
    author: 'Sofia R.',
    initials: 'SR',
    meta: 'Spain · 5 days ago · Gangnam',
    verified: false,
    treatmentTag: 'Skin Booster',
    clinicTag: 'Sinsa Skin Institute',
    likes: 54,
    comments: 12,
    text: 'Tiny bumps for a day, then my skin held water much better through the whole trip. Worth the timing.',
    treatmentId: TX_SKIN_BOOSTER,
    districtKey: DISTRICT_GANGNAM,
  },
  {
    id: 'post_yuki',
    author: 'Yuki T.',
    initials: 'YT',
    meta: 'Japan · 1 week ago · Myeongdong',
    verified: true,
    treatmentTag: 'Acne Care',
    clinicTag: 'Myeongdong Light Skin',
    likes: 71,
    comments: 9,
    text: 'Extraction was careful and they gave me a written aftercare sheet in English. No marks left after four days.',
    treatmentId: TX_ACNE_CARE,
    districtKey: DISTRICT_MYEONGDONG,
  },
]

// Keep sample feedback only when its treatment still exists in the CSV catalog.
export const SEED_POSTS = SAMPLE_POSTS
  .filter((post) => TREATMENTS.some((t) => t.id === post.treatmentId))
  .map((post) => ({ ...post, treatmentTag: TREATMENTS.find((t) => t.id === post.treatmentId)!.shortName }))

export const EARN_RULES: EarnRule[] = [
  {
    id: 'earn_post',
    title: 'Write a verified post',
    subtitle: 'After a booked visit, with a photo',
    pointsLabel: '+400 P',
  },
  {
    id: 'earn_consult',
    title: 'Complete a consultation',
    subtitle: 'Points land the same evening',
    pointsLabel: '+300 P',
  },
  {
    id: 'earn_reading',
    title: 'Add a skin reading',
    subtitle: 'Once a week during your trip',
    pointsLabel: '+80 P',
  },
]

export const STORE_ITEMS: RewardStoreItem[] = [
  {
    id: 'rw_sheet_mask',
    kind: 'PHYSICAL',
    name: 'Free sheet mask',
    costLabel: '300 P',
    costPoints: 300,
    affordable: true,
    art: 'linear-gradient(150deg,#F7FAFE,#E4EDF9)',
    description: 'Collect at the front desk of any partner clinic. One per visit.',
    expiry: '2 days 14 hours',
  },
  {
    id: 'rw_laser_coupon',
    kind: 'COUPON',
    name: '₩20,000 off any laser session',
    costLabel: '900 P',
    costPoints: 900,
    affordable: true,
    art: 'linear-gradient(150deg,#EFF4FB,#CFDFF4)',
    description: 'Applies once to a single session, at any partner clinic in your district.',
    expiry: '2 days 14 hours',
  },
  {
    id: 'rw_sun_mini',
    kind: 'PHYSICAL',
    name: 'SOLION sunscreen mini',
    costLabel: '1,100 P',
    costPoints: 1100,
    affordable: true,
    art: 'linear-gradient(150deg,#FFFFFF,#E8EFF8)',
    description: 'Collect at the front desk of any partner clinic. One per visit.',
    expiry: '2 days 14 hours',
  },
  {
    id: 'rw_night_serum',
    kind: 'COUPON',
    name: 'LUNION night serum, 30% off',
    costLabel: '1,600 P',
    costPoints: 1600,
    affordable: false,
    art: 'linear-gradient(150deg,#1D3762,#0B1E3D)',
    description: 'Applies once to a single session, at any partner clinic in your district.',
    expiry: '2 days 14 hours',
  },
]

// --- Lookups. The repository's job in the Android build. ---

export const treatmentById = (id: string | null) =>
  TREATMENTS.find((t) => t.id === id)

export const productById = (id: string | null) => PRODUCTS.find((p) => p.id === id)

export const clinicById = (id: string | null) => CLINICS.find((c) => c.id === id)

export const districtByKey = (key: string | null) =>
  DISTRICTS.find((d) => d.key === key) ?? DISTRICTS[0]

export const clinicsIn = (districtKey: string) =>
  CLINICS.filter((c) => c.districtKey === districtKey)

/** The design sorts the clinic list by price, not by distance. */
export const clinicsFor = (districtKey: string, treatmentId: string) =>
  clinicsIn(districtKey)
    .filter((c) => treatmentById(treatmentId)?.source || c.priceByTreatmentId[treatmentId] !== undefined)
    .sort((a, b) => a.priceByTreatmentId[treatmentId] - b.priceByTreatmentId[treatmentId])

/** CSV option prices take precedence; legacy entries use district sample prices. */
export const priceRangeIn = (districtKey: string | null, treatmentId: string): string => {
  const packages = treatmentById(treatmentId)?.source?.packages
  if (packages?.length) {
    const low = Math.min(...packages.map((p) => p.price))
    const high = Math.max(...packages.map((p) => p.price))
    return low === high ? won(low) : `${won(low)}–${high.toLocaleString('en-US')}`
  }
  // No district yet reads as the default one, as everywhere else in the funnel.
  const prices = clinicsIn(districtByKey(districtKey).key)
    .map((c) => c.priceByTreatmentId[treatmentId])
    .filter((p) => p !== undefined)
  if (prices.length === 0) return '—'
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  return low === high ? won(low) : `${won(low)}–${high.toLocaleString('en-US')}`
}

export const cheapestPrice = (districtKey: string, treatmentId: string): number | null => {
  if (treatmentById(treatmentId)?.source) return null
  const prices = clinicsIn(districtKey)
    .map((c) => c.priceByTreatmentId[treatmentId])
    .filter((p) => p !== undefined)
  return prices.length === 0 ? null : Math.min(...prices)
}

export const productsFor = (treatment: Treatment): Product[] =>
  treatment.pairedProductIds
    .map(productById)
    .filter((p): p is Product => p !== undefined)
    .map((p) => ({ ...p, tie: tieFor(p, treatment.id) }))

/** ₩38,000. The design's own `won()`. */
export const won = (amount: number): string => `₩${amount.toLocaleString('en-US')}`
