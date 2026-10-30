/**
 * The mock content set, in English.
 *
 * Two sources, deliberately merged rather than picked between:
 *
 * - **Copy and structure** come from `web_design/Solution.dc.html`, which is the
 *   canonical web design — its treatment text, clinic rows, product lines, posts
 *   and reward store are transcribed here as-is.
 * - **Ids and `targets`** come from the Android catalogue (`data/mock/catalog/
 *   CatalogEn.kt`), because those are what the ranking reads. A treatment's
 *   `targets` is the list of categories it answers, and it is the only reason the
 *   matched list can be ordered by a real reading instead of by hand.
 *
 * The design draws four treatments; the app has six. The two extra ones (vascular
 * laser, volume filler) exist because the app measures two categories the design's
 * five cards never showed — redness and left/right balance — and a reading that
 * puts one of those first has to have something to recommend. They are transcribed
 * from the Android catalogue and styled like the design's own four.
 *
 * The thirteen after those were added in October 2026 so each area has a ladder,
 * gentlest first, rather than one answer for every degree of it: brightening care
 * before toning before fractional pico for pigmentation, Shurink before Thermage
 * before Ulthera for laxity, and so on. Which treatments exist, what a course looks
 * like, the downtime and the cautions were checked against a published Gangnam
 * clinic menu (31 treatment pages, read 2026-10-17); every sentence here is our own,
 * written in the design's voice, and no clinic's copy or prices are reproduced.
 * `suits` is what turns the ladder into an order — see `levelDistance`.
 *
 * Everything here is sample data, and every screen that shows a price says so.
 */
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

export const TREATMENTS: Treatment[] = [
  {
    id: TX_TONING,
    tag: 'PIGMENTATION',
    name: 'Laser Toning Program',
    shortName: 'Laser Toning',
    summary:
      'A low-power laser passes over the skin several times across separate sessions, lifting faded melasma and sun spots gradually instead of all at once. There is no crusting and you can wear makeup the same day.',
    cardSummary:
      'Low-power sessions that lift faded melasma and sun spots with almost no downtime.',
    duration: '20 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 10 min',
        body: 'A dermatologist reads your result with you and checks how deep the pigment sits.',
      },
      {
        order: '2',
        title: 'Cleanse and numbing cream · 20 min',
        body: 'Optional. Ask for it if you are sensitive to stinging.',
      },
      {
        order: '3',
        title: 'Laser pass · 20 min',
        body: 'Short warm snaps, repeated. Your eyes stay under a shield.',
      },
      {
        order: '4',
        title: 'Soothing and sunscreen · 10 min',
        body: 'A calming pack, then sunscreen before you leave.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Mild flushing that settles within a few hours.' },
      { when: 'Days 3–7', what: 'Pigment darkens slightly, then fades on its own.' },
      { when: 'Week 3–4', what: 'Next session. Tone usually shifts visibly by the third.' },
    ],
    cautions: [
      'Wear sunscreen and reapply for two weeks — Seoul sun undoes the work quickly.',
      'Tell the doctor if you are pregnant or have taken oral acne medication recently.',
      'Deep or congenital pigment may need a different device. The consultation will say so.',
    ],
    pairedProductIds: [PD_RECOVERY_SERUM, PD_SUN_FLUID],
    targets: ['PIGMENT'],
    suits: { PIGMENT: ['ATTENTION', 'FOCUS'] },
    goodFor: [
      'Faint melasma spread across the cheeks',
      'Uneven tone with scattered light spots',
      'Wanting steady progress with nothing to recover from',
    ],
    course: '5–10 sessions, 2–4 weeks apart',
    downtime: 'None — makeup the same day',
    results: 'Visible from the 3rd session',
  },
  {
    id: TX_PORE_LIFT,
    tag: 'PORES · LAXITY',
    name: 'Microneedle RF Lifting',
    shortName: 'RF Lifting',
    summary:
      'Very fine needles carry radiofrequency heat beneath the surface, treating widened pores and cheeks that have started to slacken in the same session. Because the surface is barely touched, recovery is quicker than it sounds.',
    cardSummary:
      'Very fine needles carry heat under the surface to tighten pores and slack cheeks together.',
    duration: '40 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 10 min',
        body: 'Depth is set per area based on pore size and oil levels.',
      },
      { order: '2', title: 'Numbing cream · 30 min', body: 'Full numbing before anything starts.' },
      {
        order: '3',
        title: 'Microneedle RF · 30 min',
        body: 'Two or three passes at different depths.',
      },
      {
        order: '4',
        title: 'Recovery care · 15 min',
        body: 'Calming ampoule and cooling to bring the heat down.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Red and warm. Wash with lukewarm water only.' },
      { when: 'Days 2–3', what: 'Redness drops, some light flaking.' },
      { when: 'Week 4', what: 'Pore texture looks tighter. Three sessions is typical.' },
    ],
    cautions: [
      'No sauna, jjimjilbang, hard exercise or alcohol for three days.',
      'Leave at least a week before an event you want to look your best for.',
      'If you have active inflamed acne, the doctor may treat that first.',
    ],
    pairedProductIds: [PD_REPAIR_CREAM, PD_SUN_FLUID],
    targets: ['PORES', 'LAXITY'],
    suits: { PORES: ['ATTENTION', 'FOCUS'], LAXITY: ['ATTENTION'] },
    goodFor: [
      'Widened pores across the cheeks',
      'Cheeks that are starting to slacken at the same time',
      'Old acne marks with a rough surface',
    ],
    course: '3 sessions, 3–4 weeks apart',
    downtime: 'Redness 2–3 days',
    results: 'Pores look tighter by week 4',
  },
  {
    id: TX_SKIN_BOOSTER,
    tag: 'HYDRATION · FINE LINES',
    name: 'Skin Booster Injection',
    shortName: 'Skin Booster',
    summary:
      'Water and repair ingredients are placed directly under the skin to soften texture and the fine lines that come with dryness. It is gentle enough to be a first treatment and pairs easily with others.',
    cardSummary:
      'Water and repair ingredients placed just under the skin to soften texture and fine lines.',
    duration: '30 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 10 min',
        body: 'Dry areas and fine-line positions are mapped.',
      },
      { order: '2', title: 'Numbing cream · 20 min', body: 'Applied thinly, then a short wait.' },
      { order: '3', title: 'Injection · 20 min', body: 'Small amounts spread evenly across the face.' },
      { order: '4', title: 'Cooling · 10 min', body: 'A cool mask to reduce puffiness.' },
    ],
    aftercare: [
      { when: 'Same day', what: 'Tiny bumps at each entry point are normal.' },
      { when: 'Days 1–2', what: 'They absorb and texture starts to smooth.' },
      { when: 'Week 2', what: 'Second session. Three to four make a course.' },
    ],
    cautions: [
      'Skip makeup on the day of treatment; the next day is fine.',
      'Small bruises are possible, so avoid the three days before an event.',
      'Mention any injectable allergies at the consultation.',
    ],
    pairedProductIds: [PD_HYDRA_ESSENCE, PD_RECOVERY_SERUM],
    targets: ['WRINKLES'],
    suits: { WRINKLES: ['EASE', 'NORMAL'] },
    goodFor: [
      'Dry, tight skin that makeup will not sit on',
      'Fine lines that come from dryness',
      'A first injectable — gentle and easy to combine',
    ],
    course: '3–4 sessions, 2 weeks apart',
    downtime: 'Small bumps 1–2 days',
    results: 'Hydration lasts 3–6 months',
  },
  {
    id: TX_ACNE_CARE,
    tag: 'ACNE · TEXTURE',
    name: 'Gentle Acne Care',
    shortName: 'Acne Care',
    summary:
      'Congested pores are cleared by hand under magnification, then calming light brings redness down. It is the least invasive option here and suits a short trip.',
    cardSummary:
      'Careful extraction with calming light for congested forehead and chin texture.',
    duration: '25 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 5 min',
        body: 'Which lesions can be safely cleared today.',
      },
      { order: '2', title: 'Softening steam · 10 min', body: 'Opens congested pores before extraction.' },
      { order: '3', title: 'Extraction · 15 min', body: 'Done under magnification, one area at a time.' },
      { order: '4', title: 'Calming light · 10 min', body: 'Low-level light to settle redness.' },
    ],
    aftercare: [
      { when: 'Same day', what: 'Small red marks where lesions were cleared.' },
      { when: 'Days 2–3', what: 'Marks fade; skin feels noticeably smoother.' },
      { when: 'Week 2', what: 'Repeat if congestion returns. No course needed.' },
    ],
    cautions: [
      'Do not pick at treated areas — that is what leaves marks.',
      'Hold off on exfoliating acids for three days afterwards.',
      'Cystic acne is treated medically instead, not by extraction.',
    ],
    pairedProductIds: [PD_REPAIR_CREAM, PD_SUN_FLUID],
    targets: ['ACNE'],
    suits: { ACNE: ['EASE', 'NORMAL'] },
    goodFor: [
      'Blackheads and whiteheads on the forehead and chin',
      'Congestion without much inflammation',
      'A short trip with no time to recover',
    ],
    course: 'As needed — no fixed course',
    downtime: 'Red marks 1–2 days',
    results: 'Smoother within days',
  },
  {
    id: TX_REDNESS_CARE,
    tag: 'REDNESS',
    name: 'Vascular Laser Redness Care',
    shortName: 'Vascular Laser',
    summary:
      'A laser tuned to the wavelength blood vessels absorb passes over dilated capillaries and diffusely red areas, calming them without touching the surrounding skin. The target sits just under the surface, so there is no open wound and light activity is fine the same day.',
    cardSummary:
      'A vessel-targeting laser calms dilated capillaries and diffuse redness. Expect a few days of redness or light bruising after.',
    duration: '45 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 10 min',
        body: 'The dermatologist maps where redness and visible vessels sit and sets the laser strength.',
      },
      {
        order: '2',
        title: 'Cooling · 10 min',
        body: 'The area is cooled thoroughly first, since this laser can otherwise burn.',
      },
      {
        order: '3',
        title: 'Laser pass · 15 min',
        body: 'Short snaps, like a rubber band flicking the skin, repeated over the reddened areas.',
      },
      {
        order: '4',
        title: 'Soothing and sunscreen · 10 min',
        body: 'A cooling mask brings the heat down, then sunscreen before you leave.',
      },
    ],
    aftercare: [
      {
        when: 'Same day',
        what: 'The area looks flushed and swollen, with small bruises where vessels were treated.',
      },
      { when: 'Days 2–5', what: 'Bruising fades and the redness starts to settle.' },
      {
        when: 'Week 3–4',
        what: 'Next session. Vessels are usually visibly reduced after two or three.',
      },
    ],
    cautions: [
      'Skip sauna, jjimjilbang, hard exercise and alcohol for two weeks — anything that flushes the face undoes the work.',
      'Wear sunscreen every day. UV exposure dilates the same vessels again.',
      'Tell the doctor if you take blood thinners or scar easily (keloid-prone).',
    ],
    pairedProductIds: [PD_RECOVERY_SERUM, PD_SUN_FLUID],
    targets: ['REDNESS'],
    suits: { REDNESS: ['FOCUS'] },
    goodFor: [
      'Thread veins visible on the cheeks and nose',
      'Redness that stays even when your skin is cool',
      'Flushing that no longer fades',
    ],
    course: '2–3 sessions, 3–4 weeks apart',
    downtime: 'Flushed 1–2 days, bruising up to 5',
    results: 'Vessels fade after 2–3 sessions',
  },
  {
    id: TX_FILLER,
    tag: 'BALANCE',
    name: 'Hyaluronic Acid Volume Filler',
    shortName: 'Volume Filler',
    summary:
      'Hyaluronic acid filler is placed in small amounts, mostly on the flatter side, to soften the difference in cheek volume between the two sides. There is no incision, recovery is quick, and it can be dissolved with an enzyme if you are not happy with it.',
    cardSummary:
      'Small amounts of filler, mostly on the flatter side, soften the left-right volume difference. Swelling settles within a few days.',
    duration: '40 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 10 min',
        body: 'The dermatologist checks the volume difference between the cheeks and plans how much to place, and where.',
      },
      {
        order: '2',
        title: 'Numbing cream · 15 min',
        body: 'Applied and given time to work before anything starts.',
      },
      {
        order: '3',
        title: 'Filler injection · 10 min',
        body: 'Small amounts go in mostly on the flatter side, checking both sides against each other as it goes.',
      },
      {
        order: '4',
        title: 'Massage and cooling · 5 min',
        body: 'The area is shaped and cooled to bring swelling down.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Some swelling and small injection marks are normal.' },
      { when: 'Days 2–3', what: 'Swelling settles and the two sides start to look more even.' },
      { when: 'Week 2', what: 'The final shape settles. A small top-up is possible if needed.' },
    ],
    cautions: [
      'Do not press or massage the area hard for three days — it can shift the shape.',
      'Small bruises are possible, so leave at least a week before an important event.',
      'Tell the doctor if you take blood thinners or have had a filler complication before (such as vascular occlusion).',
    ],
    pairedProductIds: [PD_RECOVERY_SERUM, PD_SUN_FLUID],
    targets: ['BALANCE'],
    suits: { BALANCE: ['FOCUS'] },
    goodFor: [
      'One cheek looking flatter than the other',
      'A difference that shows in every photo, not just one',
      'Wanting a change that can be reversed',
    ],
    course: 'One session; a small top-up if needed',
    downtime: 'Swelling 2–3 days',
    results: 'Immediate; lasts about a year',
  },

  // --- Added from the reference menu (2026-10). Grouped by the area they answer,
  // gentlest first within each group. ---

  {
    id: TX_BRIGHTENING,
    tag: 'PIGMENTATION · DULLNESS',
    name: 'Vitamin C Brightening Care',
    shortName: 'Brightening Care',
    summary:
      'A gentle current and ultrasound carry a vitamin C ampoule further into the skin than it would go on its own, brightening dull tone and softening light spots. Nothing is heated or broken, so it suits sensitive skin and the day before a flight.',
    cardSummary:
      'Vitamin C carried in by a gentle current to brighten dull tone and light spots. No downtime at all.',
    priceBasis: 'full face',
    duration: '40 min',
    steps: [
      {
        order: '1',
        title: 'Skin check · 5 min',
        body: 'The therapist checks for irritation and confirms vitamin C suits your skin.',
      },
      {
        order: '2',
        title: 'Cleanse and light exfoliation · 10 min',
        body: 'Clears the dead surface layer so the ampoule can reach further.',
      },
      {
        order: '3',
        title: 'Ion and ultrasound infusion · 20 min',
        body: 'A smooth probe glides over the skin. A faint tingle, or a metallic taste, is normal.',
      },
      {
        order: '4',
        title: 'Mask and sunscreen · 10 min',
        body: 'A soothing sheet mask, then sunscreen before you leave.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Brighter and well hydrated. Makeup is fine straight away.' },
      { when: 'Week 1', what: 'The glow settles. Daily sunscreen is what holds it.' },
      { when: 'Week 2', what: 'Next session. Four to six give the steadiest tone.' },
    ],
    cautions: [
      'The current is not used with a pacemaker, metal implants in the face, or during pregnancy.',
      'Very reactive skin can sting with vitamin C, so a small test area comes first.',
      'It evens tone; it does not remove distinct spots. Those need a laser.',
    ],
    pairedProductIds: [PD_RECOVERY_SERUM, PD_SUN_FLUID],
    targets: ['PIGMENT'],
    suits: { PIGMENT: ['EASE', 'NORMAL'] },
    goodFor: [
      'Dull, tired-looking tone with a few light spots',
      'Upkeep between laser sessions, or just before an event',
      'Sensitive skin that does not tolerate peels or lasers',
    ],
    course: '4–6 sessions, 1–2 weeks apart',
    downtime: 'None',
    results: 'Brighter the same day',
  },
  {
    id: TX_PICO_FRAXEL,
    tag: 'PIGMENTATION · TEXTURE',
    name: 'Pico Fraxel Resurfacing',
    shortName: 'Pico Fraxel',
    summary:
      'A picosecond laser — the same family as toning — is split into a grid of microscopic points that reach deeper than a toning pass. It breaks up pigment that toning has not shifted and prompts new collagen around old acne marks and widened pores, at the cost of a few days of fine flaking.',
    cardSummary:
      'A deeper, fractional pico laser for stubborn pigment, old marks and rough texture. Expect 3–5 days of fine flaking.',
    priceBasis: 'full face',
    duration: '20 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 10 min',
        body: 'The doctor checks whether the pigment is melasma, which needs a gentler setting, or sun spots and marks, which this suits.',
      },
      {
        order: '2',
        title: 'Numbing cream · 30 min',
        body: 'Fractional passes sting more than toning, so numbing is standard.',
      },
      {
        order: '3',
        title: 'Fractional laser pass · 15 min',
        body: 'Quick hot pinpricks across the face. Your eyes stay under a shield.',
      },
      {
        order: '4',
        title: 'Cooling and sunscreen · 10 min',
        body: 'A cooling pack takes the heat out, then sunscreen before you leave.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Red with a sandpaper feel, like a mild sunburn.' },
      { when: 'Days 3–5', what: 'Tiny dark specks form and flake away. Let them go on their own.' },
      { when: 'Week 4', what: 'Next session. Most courses run three to five, a month apart.' },
    ],
    cautions: [
      'Strong laser work can darken melasma. If that is your pigment, the doctor may keep you to toning.',
      'Leave five clear days before an event — the specks show through makeup.',
      'No retinol or AHA/BHA for a week either side, and sunscreen every day for a month.',
    ],
    pairedProductIds: [PD_RECOVERY_SERUM, PD_SUN_FLUID],
    targets: ['PIGMENT', 'PORES'],
    suits: { PIGMENT: ['FOCUS'], PORES: ['ATTENTION', 'FOCUS'] },
    goodFor: [
      'Pigment that a course of toning has not shifted',
      'Sun spots or brown marks with rough texture around them',
      'Old acne marks and widened pores alongside uneven tone',
    ],
    course: '3–5 sessions, 4 weeks apart',
    downtime: 'Fine flaking 3–5 days',
    results: 'Visible after 2–3 sessions',
  },
  {
    id: TX_SKIN_BOTOX,
    tag: 'PORES · OIL',
    name: 'Skin Botox for Pores',
    shortName: 'Skin Botox',
    summary:
      'Tiny amounts of botulinum toxin are placed just under the surface instead of into muscle. The oil glands and fine muscles there relax, so pores look smaller, shine drops and the surface reads smoother — without changing how your face moves.',
    cardSummary:
      'Toxin placed just under the surface to shrink the look of pores and cut shine. No downtime; lasts two to four months.',
    priceBasis: 'full face',
    duration: '15 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 5 min',
        body: 'Where pores and oil gather is marked, and the toxin chosen — domestic or imported.',
      },
      {
        order: '2',
        title: 'Numbing cream · 20 min',
        body: 'There are many small injections, so the face is numbed first.',
      },
      {
        order: '3',
        title: 'Micro-injections · 10 min',
        body: 'A very fine needle places small amounts across the T-zone and cheeks.',
      },
      {
        order: '4',
        title: 'Cooling · 5 min',
        body: 'Settles the small bumps left at each point.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Small bumps at the injection points flatten within hours.' },
      { when: 'Days 3–7', what: 'Shine drops and pores start to look tighter.' },
      { when: 'Month 2–4', what: 'The effect fades gradually. Repeat when the shine returns.' },
    ],
    cautions: [
      'Stay upright and do not press on your face for four hours afterwards.',
      'Leave two weeks between this and any other toxin treatment.',
      'Not done during pregnancy or breastfeeding, or with a neuromuscular condition.',
    ],
    pairedProductIds: [PD_HYDRA_ESSENCE, PD_RECOVERY_SERUM],
    targets: ['PORES'],
    suits: { PORES: ['NORMAL', 'ATTENTION'] },
    goodFor: [
      'Widened pores with an oily T-zone',
      'Makeup that slides off by midday',
      'Fine, crepey texture across the cheeks',
    ],
    course: 'One session, repeated every 2–4 months',
    downtime: 'None',
    results: 'Shows in 3–7 days, lasts 2–4 months',
  },
  {
    id: TX_CAPRI,
    tag: 'ACNE · OIL',
    name: 'Capri Laser for Oil and Acne',
    shortName: 'Capri Laser',
    summary:
      'A 1,450 nm laser heats the oil glands under the skin and calms them, so less oil reaches the surface and fewer breakouts start. With extraction added, the blackheads and whiteheads already there are cleared in the same visit.',
    cardSummary:
      'A laser that quiets overactive oil glands, with extraction for current congestion. For breakouts that keep coming back.',
    priceBasis: 'with extraction',
    duration: '30 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 5 min',
        body: 'Decides whether you need extraction today or only the laser.',
      },
      {
        order: '2',
        title: 'Extraction · 15 min',
        body: 'Blackheads and whiteheads are cleared under magnification.',
      },
      {
        order: '3',
        title: 'Laser pass · 10 min',
        body: 'A stinging warmth with each pulse, eased by a cooling spray.',
      },
      {
        order: '4',
        title: 'Soothing pack · 10 min',
        body: 'Brings the redness down before you leave.',
      },
    ],
    aftercare: [
      {
        when: 'Same day',
        what: 'Red for a day or two. Extracted spots can stay pink a few days longer.',
      },
      { when: 'Week 1', what: 'Oil is noticeably lower by the end of the first week.' },
      { when: 'Week 2–4', what: 'Next session. Three to five keep oil down for months.' },
    ],
    cautions: [
      'No retinol or peeling products for three to five days.',
      'Do not pick at extracted spots or the small scabs they form.',
      'Tell the doctor if you take isotretinoin (oral acne medication).',
    ],
    pairedProductIds: [PD_REPAIR_CREAM, PD_SUN_FLUID],
    targets: ['ACNE', 'PORES'],
    suits: { ACNE: ['NORMAL', 'ATTENTION'], PORES: ['NORMAL', 'ATTENTION'] },
    goodFor: [
      'Breakouts that return in the same places every month',
      'An oily nose and cheeks with widened pores',
      'Skin that is calm now but congests quickly',
    ],
    course: '3–5 sessions, 2–4 weeks apart',
    downtime: 'Redness 1–2 days',
    results: 'Less oil within a week',
  },
  {
    id: TX_INFLAMED_ACNE,
    tag: 'INFLAMED ACNE',
    name: 'Inflamed Acne Clinic Care',
    shortName: 'Inflamed Acne Care',
    summary:
      'For breakouts that are swollen and painful, a doctor treats the inflammation directly. A light-activated gel calms acne bacteria and oil glands across the face, lesions that are ready are cleared, and the largest swollen ones get a tiny anti-inflammatory injection that flattens them within days. A prescription may be added.',
    cardSummary:
      'Doctor-led care for swollen, painful breakouts: light therapy, careful extraction, and spot injections that flatten the worst within days.',
    priceBasis: 'per visit',
    duration: '40 min',
    steps: [
      {
        order: '1',
        title: 'Doctor examination · 10 min',
        body: 'Which lesions need an injection, which can be cleared, and whether medication would help.',
      },
      {
        order: '2',
        title: 'Light-activated gel · 20 min',
        body: 'A light-sensitising gel is applied, then activated under a light panel. Warm and slightly prickly.',
      },
      {
        order: '3',
        title: 'Extraction · 10 min',
        body: 'Only lesions that are ready. Deep, swollen ones are left to the injection.',
      },
      {
        order: '4',
        title: 'Spot injections · 5 min',
        body: 'A tiny anti-inflammatory dose into each of the largest lesions.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Skin is pink. Keep out of direct sun for two days.' },
      { when: 'Days 2–4', what: 'Injected lesions flatten and stop hurting.' },
      { when: 'Week 1–2', what: 'Review visit. Repeat until breakouts are under control.' },
    ],
    cautions: [
      'After the light treatment your skin burns easily for 48 hours — cover up outdoors.',
      'Spot injections are kept to one or two per lesion; overuse can leave a small dent.',
      'Tell the doctor about pregnancy and any acne medication you already take.',
    ],
    pairedProductIds: [PD_REPAIR_CREAM, PD_SUN_FLUID],
    targets: ['ACNE'],
    suits: { ACNE: ['FOCUS'] },
    goodFor: [
      'Red, swollen or painful breakouts in several places',
      'Spots that leave a mark every time they heal',
      'Acne that skincare alone is not bringing under control',
    ],
    course: 'Every 1–2 weeks until settled',
    downtime: 'Pink 1–2 days; avoid sun for 48 h',
    results: 'Swelling down in 2–4 days',
  },
  {
    id: TX_SECRET_RF,
    tag: 'ACNE SCARS · PORES',
    name: 'Secret RF for Acne Scars',
    shortName: 'Secret RF',
    summary:
      'Insulated microneedles deliver radiofrequency heat into the deeper skin, where acne scars are tethered and oil glands sit. The heat loosens scar tissue and triggers new collagen, so pitted scars fill in gradually and recurring breakouts calm. It is microneedle RF aimed squarely at acne and its marks.',
    cardSummary:
      'Microneedle RF aimed at acne scars and recurring breakouts. Scars fill in gradually over a course.',
    priceBasis: 'full face',
    duration: '30 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 10 min',
        body: 'Scar type and depth set the needle depth. Severe inflammation is treated first.',
      },
      {
        order: '2',
        title: 'Numbing cream · 40 min',
        body: 'Thorough numbing — the needles go deeper than the other treatments here.',
      },
      {
        order: '3',
        title: 'Microneedle RF · 20 min',
        body: 'Two or three passes over the scarred areas. Pressure and heat rather than sharp pain.',
      },
      {
        order: '4',
        title: 'Cooling and ampoule · 10 min',
        body: 'A regenerating ampoule goes on while the channels are still open.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Red and warm. No washing or makeup until tomorrow.' },
      {
        when: 'Days 2–3',
        what: 'Redness fades. A fine grid of small scabs may show — let them fall off.',
      },
      { when: 'Week 4', what: 'Next session. Scars improve over three to five.' },
    ],
    cautions: [
      'No sauna, jjimjilbang or hard exercise for three days.',
      'Tell the doctor if you have taken isotretinoin in the last six months.',
      'Keloid-prone skin is tested on a small area first.',
    ],
    pairedProductIds: [PD_REPAIR_CREAM, PD_SUN_FLUID],
    targets: ['ACNE', 'PORES'],
    suits: { ACNE: ['NORMAL', 'ATTENTION'], PORES: ['ATTENTION', 'FOCUS'] },
    goodFor: [
      'Pitted or rolling acne scars',
      'Breakouts that keep returning to the same areas',
      'Widened pores alongside old acne marks',
    ],
    course: '3–5 sessions, 4 weeks apart',
    downtime: 'Redness 2–3 days',
    results: 'Scars soften over the course',
  },
  {
    id: TX_WRINKLE_BOTOX,
    tag: 'WRINKLES · EXPRESSION LINES',
    name: 'Expression Line Botox',
    shortName: 'Wrinkle Botox',
    summary:
      "Botulinum toxin relaxes the small muscles that fold the skin into forehead lines, the frown line between the brows, and crow's feet. Lines that stay when your face is at rest soften, and lines that are only starting stop deepening. In small doses your expressions still move.",
    cardSummary:
      "Relaxes the muscles behind forehead lines, frown lines and crow's feet. Ten minutes, no downtime.",
    priceBasis: '3 areas',
    duration: '10 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 5 min',
        body: 'You make the expressions; the doctor marks where the lines fold and sets a dose per area.',
      },
      {
        order: '2',
        title: 'Cooling · 3 min',
        body: 'An ice pack rather than numbing cream — the needle is very fine.',
      },
      {
        order: '3',
        title: 'Injections · 5 min',
        body: 'A few small injections per area, each a brief sting.',
      },
      {
        order: '4',
        title: 'Check · 2 min',
        body: 'The points are checked, and you can leave straight away.',
      },
    ],
    aftercare: [
      { when: 'First 4 hours', what: 'Stay upright and do not rub the area.' },
      { when: 'Days 3–7', what: 'Lines soften as the muscles relax. Full effect at two weeks.' },
      { when: 'Month 3–6', what: 'Movement returns gradually. Repeat when the lines come back.' },
    ],
    cautions: [
      'Not done during pregnancy or breastfeeding, or with a neuromuscular condition.',
      'Leave two weeks from other toxin treatments, and skip alcohol on the day.',
      'Ask which toxin you are getting — domestic and imported brands differ in price and how long they last.',
    ],
    pairedProductIds: [PD_HYDRA_ESSENCE, PD_RECOVERY_SERUM],
    targets: ['WRINKLES'],
    suits: { WRINKLES: ['NORMAL', 'ATTENTION', 'FOCUS'] },
    goodFor: [
      'Forehead or frown lines that stay at rest',
      "Crow's feet that deepen when you smile",
      'Stopping early lines from setting',
    ],
    course: 'One session, every 3–6 months',
    downtime: 'None',
    results: 'Shows in 3–7 days, lasts 3–6 months',
  },
  {
    id: TX_REJURAN,
    tag: 'WRINKLES · SKIN REPAIR',
    name: 'Rejuran Healer (PDRN)',
    shortName: 'Rejuran',
    summary:
      "Rejuran is PDRN — purified DNA fragments from salmon — placed in small blebs across the face. It supports the skin's own repair, so thin, tired skin thickens, fine lines soften and tone evens over a course. Korean clinics use it for skin that needs rebuilding rather than filling.",
    cardSummary:
      'Salmon-derived PDRN injected across the face to repair thin, tired skin and soften fine lines over a course.',
    priceBasis: '2 cc',
    duration: '30 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 5 min',
        body: 'The full-face version, or the eye version for fine lines underneath the eyes.',
      },
      {
        order: '2',
        title: 'Numbing cream · 30 min',
        body: 'One of the more stinging injections, so numbing matters.',
      },
      {
        order: '3',
        title: 'Injections · 15 min',
        body: 'Small raised blebs are placed evenly across the face.',
      },
      {
        order: '4',
        title: 'Cooling · 10 min',
        body: 'Settles the redness. The blebs stay a little longer.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Small bumps at each point, like mosquito bites.' },
      { when: 'Days 1–3', what: 'The bumps absorb. Skin feels better hydrated almost at once.' },
      { when: 'Week 2–4', what: 'Next session. Three to four make a course.' },
    ],
    cautions: [
      'Tell the doctor about any fish or salmon allergy.',
      'Leave three clear days before an event — the bumps show.',
      'Skip alcohol for two to three days, and the sauna on the day.',
    ],
    pairedProductIds: [PD_HYDRA_ESSENCE, PD_RECOVERY_SERUM],
    targets: ['WRINKLES'],
    suits: { WRINKLES: ['ATTENTION', 'FOCUS'] },
    goodFor: [
      'Fine lines that come with thin, dry skin',
      'Skin that looks tired and has lost its bounce',
      'Fine lines under the eyes (the eye version)',
    ],
    course: '3–4 sessions, 2–4 weeks apart',
    downtime: 'Small bumps 1–3 days',
    results: 'Builds over the course',
  },
  {
    id: TX_SHURINK,
    tag: 'LAXITY · FIRST LIFT',
    name: 'Shurink HIFU Lifting',
    shortName: 'Shurink',
    summary:
      'Focused ultrasound places small points of heat in the firm layer beneath the skin — the layer a surgical facelift tightens. Collagen rebuilds around those points over the following weeks, so the jawline and cheeks lift a little at a time. It is the lighter, lower-cost relative of Ulthera, suited to starting early and repeating.',
    cardSummary:
      'Focused ultrasound tightens the layer under the skin for a gradual lift. An affordable first step for early slackening.',
    priceBasis: '300 shots',
    duration: '30 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 10 min',
        body: 'Shots and depth are set per area — jawline, cheeks, under the chin.',
      },
      {
        order: '2',
        title: 'Numbing cream · 20 min',
        body: 'Optional, but most people take it for the jawline.',
      },
      {
        order: '3',
        title: 'Ultrasound lines · 20 min',
        body: 'A deep, prickly heat along each line, strongest over bone.',
      },
      {
        order: '4',
        title: 'Calming ampoule · 10 min',
        body: 'A soothing finish. Makeup is fine afterwards.',
      },
    ],
    aftercare: [
      {
        when: 'Same day',
        what: 'Slight redness or puffiness for a few hours. Some feel tighter straight away.',
      },
      { when: 'Week 2–3', what: 'The lift begins to show as collagen rebuilds.' },
      { when: 'Month 3–6', what: 'Peak result. Many repeat every four to six months.' },
    ],
    cautions: [
      'Avoid alcohol, sauna and hard exercise on the day.',
      'Tell the doctor about pregnancy, metal implants, or fillers in the area.',
      'Too many shots on a very slim face can look hollow — the doctor adjusts for that.',
    ],
    pairedProductIds: [PD_REPAIR_CREAM, PD_SUN_FLUID],
    targets: ['LAXITY'],
    suits: { LAXITY: ['NORMAL', 'ATTENTION'] },
    goodFor: [
      'Cheeks and a jawline that have just started to soften',
      'A first lifting treatment, at a modest price',
      'Regular upkeep between stronger treatments',
    ],
    course: 'One session, repeated every 4–6 months',
    downtime: 'None',
    results: 'Shows in 2–3 weeks, lasts about 6 months',
  },
  {
    id: TX_THERMAGE,
    tag: 'LAXITY · FINE LINES',
    name: 'Thermage FLX Tightening',
    shortName: 'Thermage',
    summary:
      'Monopolar radiofrequency heats the deeper skin evenly across the whole face. Existing collagen tightens on the day and new collagen builds over the following months — firmer, smoother skin with finer lines, rather than a lift in one place. Each shot measures the skin and sets its own energy.',
    cardSummary:
      'Radiofrequency heats and tightens the deeper skin across the whole face. Firmer skin and finer lines, with no downtime.',
    priceBasis: '300 shots',
    duration: '60 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 10 min',
        body: 'Shots are chosen — 300 for the face, 600 or 900 to include the eyes or neck.',
      },
      {
        order: '2',
        title: 'Grid and numbing · 30 min',
        body: 'A temporary grid is printed on the skin so every square gets an even dose. Numbing is optional.',
      },
      {
        order: '3',
        title: 'Radiofrequency pass · 40 min',
        body: 'Each shot is a deep warmth followed by a cooling burst.',
      },
      {
        order: '4',
        title: 'Cleanse and moisture · 10 min',
        body: 'The grid washes off. Makeup is fine the same day.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Slight redness and warmth that fade within hours.' },
      { when: 'Month 1–2', what: 'Skin feels firmer as new collagen builds.' },
      { when: 'Month 6', what: 'Peak result. Repeat every six to twelve months.' },
    ],
    cautions: [
      'Not done with a pacemaker or metal implants in the area. Tell the doctor about pregnancy.',
      'Avoid sauna and heavy drinking for a week.',
      'Ask to see the sealed, genuine tip opened in front of you — counterfeit tips exist.',
    ],
    pairedProductIds: [PD_REPAIR_CREAM, PD_SUN_FLUID],
    targets: ['LAXITY', 'WRINKLES'],
    suits: { LAXITY: ['ATTENTION', 'FOCUS'], WRINKLES: ['ATTENTION', 'FOCUS'] },
    goodFor: [
      'Skin that feels thinner and less firm than it used to',
      'Fine lines across the cheeks and around the eyes',
      'Wanting no visible recovery at all',
    ],
    course: 'One session, every 6–12 months',
    downtime: 'None',
    results: 'Builds over 1–2 months, peaks at 6',
  },
  {
    id: TX_ULTHERA,
    tag: 'LAXITY · JAWLINE',
    name: 'Ulthera Prime HIFU Lifting',
    shortName: 'Ulthera',
    summary:
      'The original focused-ultrasound lift, now with a live image of the skin layers so each line lands at the right depth in the firm layer under the skin. It reaches deeper and harder than lighter ultrasound devices, which is why it is the one for a jawline or cheeks that have clearly dropped.',
    cardSummary:
      'The deepest-reaching ultrasound lift, guided by a live image of the skin layers. For a jawline or cheeks that have clearly dropped.',
    priceBasis: '300 shots',
    duration: '60 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 15 min',
        body: 'How far things have dropped decides the shots — usually 300 to 600 for the lower face.',
      },
      {
        order: '2',
        title: 'Numbing · 30 min',
        body: 'Numbing cream, sometimes with a painkiller — this is the strongest sensation on the menu.',
      },
      {
        order: '3',
        title: 'Imaging and ultrasound lines · 40 min',
        body: 'Each line is checked on screen before it fires. Expect a deep ache over the jaw.',
      },
      {
        order: '4',
        title: 'Cooling · 10 min',
        body: 'Brings any swelling down. You leave without visible marks.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Some swelling and tenderness along the jaw, rarely visible.' },
      { when: 'Weeks 1–2', what: 'Tenderness fades. A little tightness shows early.' },
      { when: 'Month 2–3', what: 'The lift shows as collagen rebuilds, and lasts about a year.' },
    ],
    cautions: [
      'Numbness or small bruises along the jaw can happen, and pass within weeks.',
      'Tell the doctor about pregnancy, metal implants, or fillers and threads in the area.',
      'A once-a-year treatment. Repeating sooner adds cost, not lift.',
    ],
    pairedProductIds: [PD_REPAIR_CREAM, PD_SUN_FLUID],
    targets: ['LAXITY'],
    suits: { LAXITY: ['FOCUS'] },
    goodFor: [
      'A jawline that has lost its edge',
      'Folds from nose to mouth that are deepening',
      'Wanting one strong treatment rather than a course',
    ],
    course: 'One session a year',
    downtime: 'Tender 1–2 weeks, rarely visible',
    results: 'Shows over 2–3 months, lasts about a year',
  },
  {
    id: TX_CALMING,
    tag: 'REDNESS · SENSITIVE SKIN',
    name: 'LDM Calming Care',
    shortName: 'Calming Care',
    summary:
      'Two gentle devices for flushed, reactive skin. LDM sends dual-frequency ultrasound into the skin to settle inflammation and support the barrier, then cryo cooling takes the heat out of the surface. Nothing is broken or heated, so it can be repeated weekly and paired with anything.',
    cardSummary:
      'Ultrasound and cryo cooling to calm flushed, reactive skin. No downtime, and it can be repeated weekly.',
    priceBasis: 'per visit',
    duration: '30 min',
    steps: [
      {
        order: '1',
        title: 'Skin check · 5 min',
        body: 'Where the redness sits, and what sets it off.',
      },
      {
        order: '2',
        title: 'Gentle cleanse · 5 min',
        body: 'No scrubbing and no extraction on reactive skin.',
      },
      {
        order: '3',
        title: 'LDM ultrasound · 15 min',
        body: 'A smooth probe glides over a soothing gel. Most people find it relaxing.',
      },
      {
        order: '4',
        title: 'Cryo cooling · 10 min',
        body: 'A cold probe passes over the flushed areas until the heat drops.',
      },
    ],
    aftercare: [
      { when: 'Same day', what: 'Skin looks calmer and cooler straight away.' },
      { when: 'Week 1', what: 'Repeat weekly while the redness is active.' },
      { when: 'Week 4–6', what: 'Once calm, monthly upkeep holds it.' },
    ],
    cautions: [
      'It calms redness; visible broken vessels need a vascular laser.',
      'Skip hot showers, sauna and spicy food on the day — heat undoes the cooling.',
      'Tell the therapist about a pacemaker or metal implants in the face.',
    ],
    pairedProductIds: [PD_RECOVERY_SERUM, PD_SUN_FLUID],
    targets: ['REDNESS'],
    suits: { REDNESS: ['NORMAL', 'ATTENTION'] },
    goodFor: [
      'Flushing that comes and goes',
      'Skin that stings with products or after other treatments',
      'Redness from a weakened skin barrier',
    ],
    course: '4–6 sessions, weekly',
    downtime: 'None',
    results: 'Calmer the same day',
  },
  {
    id: TX_JAW_BOTOX,
    tag: 'BALANCE · JAWLINE',
    name: 'Jaw Botox for Balance',
    shortName: 'Jaw Botox',
    summary:
      'When one side of the lower face looks wider, the cause is often a jaw muscle that has grown bulkier from chewing on that side. Botulinum toxin relaxes the muscle so it slims over the following weeks, and a larger dose on the bulkier side brings the two sides closer.',
    cardSummary:
      'Relaxes a bulkier jaw muscle so the lower face evens out. Ten minutes; the change shows over 2–4 weeks.',
    priceBasis: '50 units',
    duration: '10 min',
    steps: [
      {
        order: '1',
        title: 'Doctor consultation · 5 min',
        body: 'You clench; the doctor feels both muscles and sets a dose for each side.',
      },
      {
        order: '2',
        title: 'Cooling · 3 min',
        body: 'An ice pack rather than numbing cream.',
      },
      {
        order: '3',
        title: 'Injections · 5 min',
        body: 'A few injections into each jaw muscle.',
      },
      {
        order: '4',
        title: 'Check · 2 min',
        body: 'You can leave straight away.',
      },
    ],
    aftercare: [
      { when: 'Days 1–3', what: 'Chewing tough food may feel tiring. Nothing is visible.' },
      { when: 'Week 2–4', what: 'The muscle slims and the two sides look more even.' },
      { when: 'Month 4–6', what: 'The effect fades. Repeats can be spaced further apart.' },
    ],
    cautions: [
      'Avoid chewy food such as gum or dried squid for a few days, and do not massage the area.',
      'Not done during pregnancy or breastfeeding.',
      'If the difference is bone or fat rather than muscle, toxin will not change it. The doctor checks first.',
    ],
    pairedProductIds: [PD_RECOVERY_SERUM, PD_SUN_FLUID],
    targets: ['BALANCE'],
    suits: { BALANCE: ['FOCUS'] },
    goodFor: [
      'One side of the jaw looking wider than the other',
      'A habit of chewing on one side, or grinding at night',
      'Wanting the difference softened without filler',
    ],
    course: 'One session, every 4–6 months',
    downtime: 'None',
    results: 'Shows in 2–4 weeks, lasts 4–6 months',
  },
]

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

export const SEED_POSTS: CommunityPost[] = [
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
    .filter((c) => c.priceByTreatmentId[treatmentId] !== undefined)
    .sort((a, b) => a.priceByTreatmentId[treatmentId] - b.priceByTreatmentId[treatmentId])

/**
 * "₩135,000–180,000": the spread across one district's clinics. Computed rather
 * than written down, so the range on a card can never disagree with the clinic
 * list it leads to — the design's fixed ranges were Myeongdong's, and read wrong
 * the moment someone staying in Gangnam opened the list.
 */
export const priceRangeIn = (districtKey: string | null, treatmentId: string): string => {
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
