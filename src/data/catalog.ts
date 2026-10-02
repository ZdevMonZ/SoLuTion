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
 * Everything here is sample data, and every screen that shows a price says so.
 */
import type { SkinCategory } from '../analysis/types'

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
  priceRange: string
  duration: string
  steps: TreatmentStep[]
  aftercare: AftercareNote[]
  cautions: string[]
  pairedProductIds: string[]
  /** Categories this treatment answers — drives the recommendation ordering. */
  targets: SkinCategory[]
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
    priceRange: '₩135,000–180,000',
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
    priceRange: '₩450,000–610,000',
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
    priceRange: '₩250,000–320,000',
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
    priceRange: '₩85,000–120,000',
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
    priceRange: '₩145,000–195,000',
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
    priceRange: '₩400,000–550,000',
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
const TIE_OVERRIDES: Record<string, Record<string, string>> = {
  [PD_RECOVERY_SERUM]: {
    [TX_REDNESS_CARE]: 'For the nights after a vascular laser session, while the flush settles.',
    [TX_FILLER]: 'Calms the injection points over the first few nights.',
  },
  [PD_SUN_FLUID]: {
    [TX_REDNESS_CARE]: 'Daily sunscreen is what stops the same vessels dilating again.',
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
    name: 'Solution Clinic Myeongdong',
    lat: 37.56338,
    lng: 126.98405,
    distanceLabel: '3 min walk · 240 m',
    badge: 'AVAILABLE',
    note: 'Reads your Solution result directly',
    address: '12 Myeongdong 8-gil, Jung-gu, 3F',
    priceByTreatmentId: price(150000, 480000, 290000, 95000, 160000, 450000),
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
    priceByTreatmentId: price(135000, 520000, 250000, 88000, 145000, 400000),
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
    priceByTreatmentId: price(165000, 450000, 320000, 110000, 175000, 500000),
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
    priceByTreatmentId: price(180000, 610000, 275000, 120000, 195000, 550000),
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
    priceByTreatmentId: price(142000, 495000, 268000, 90000, 152000, 460000),
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
    priceByTreatmentId: price(128000, 530000, 245000, 82000, 138000, 405000),
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
    priceByTreatmentId: price(158000, 470000, 300000, 105000, 168000, 520000),
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
    priceByTreatmentId: price(175000, 588000, 282000, 118000, 188000, 560000),
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
    priceByTreatmentId: price(168000, 520000, 310000, 112000, 178000, 490000),
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
    priceByTreatmentId: price(155000, 575000, 288000, 98000, 165000, 440000),
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
    priceByTreatmentId: price(185000, 498000, 335000, 125000, 198000, 545000),
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
    priceByTreatmentId: price(210000, 640000, 360000, 140000, 225000, 600000),
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
    clinicTag: 'Solution Myeongdong',
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
