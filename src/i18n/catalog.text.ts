/**
 * The shape of one language's catalogue words — the web copy of the app's
 * `CatalogText.kt`.
 *
 * Each text type is its English entity minus the fields every language shares, so a
 * field the English gains is one each language has to fill (or one to add to the
 * shared list below it), and each table is keyed by the English ids, so a language
 * that leaves out a treatment, clinic or post does not compile. Ids, prices,
 * distances, targets and suits are not words and have no place here: they stay in
 * `data/catalog.ts`, once for all languages.
 *
 * What a type cannot see — a list one line short, an id the English gained after the
 * lists below were written — `catalog.ts` reports in development.
 */
import type {
  Clinic,
  CommunityPost,
  District,
  DISTRICT_GANGNAM,
  DISTRICT_HONGDAE,
  DISTRICT_MYEONGDONG,
  EarnRule,
  PD_HYDRA_ESSENCE,
  PD_RECOVERY_SERUM,
  PD_REPAIR_CREAM,
  PD_SUN_FLUID,
  Product,
  RewardStoreItem,
  Treatment,
  TreatmentStep,
  TX_ACNE_CARE,
  TX_BRIGHTENING,
  TX_CALMING,
  TX_CAPRI,
  TX_FILLER,
  TX_INFLAMED_ACNE,
  TX_JAW_BOTOX,
  TX_PICO_FRAXEL,
  TX_PORE_LIFT,
  TX_REDNESS_CARE,
  TX_REJURAN,
  TX_SECRET_RF,
  TX_SHURINK,
  TX_SKIN_BOOSTER,
  TX_SKIN_BOTOX,
  TX_THERMAGE,
  TX_TONING,
  TX_ULTHERA,
  TX_WRINKLE_BOTOX,
} from '../data/catalog'

export type TreatmentId =
  | typeof TX_TONING
  | typeof TX_PORE_LIFT
  | typeof TX_SKIN_BOOSTER
  | typeof TX_ACNE_CARE
  | typeof TX_REDNESS_CARE
  | typeof TX_FILLER
  | typeof TX_BRIGHTENING
  | typeof TX_PICO_FRAXEL
  | typeof TX_SKIN_BOTOX
  | typeof TX_CAPRI
  | typeof TX_INFLAMED_ACNE
  | typeof TX_SECRET_RF
  | typeof TX_WRINKLE_BOTOX
  | typeof TX_REJURAN
  | typeof TX_SHURINK
  | typeof TX_THERMAGE
  | typeof TX_ULTHERA
  | typeof TX_CALMING
  | typeof TX_JAW_BOTOX

export type ProductId =
  | typeof PD_SUN_FLUID
  | typeof PD_RECOVERY_SERUM
  | typeof PD_REPAIR_CREAM
  | typeof PD_HYDRA_ESSENCE

export type DistrictKey =
  | typeof DISTRICT_MYEONGDONG
  | typeof DISTRICT_HONGDAE
  | typeof DISTRICT_GANGNAM

// `data/catalog.ts` writes these ids inline rather than as constants.
export type ClinicId =
  | 'c_solution_myeongdong'
  | 'c_myeongdong_light'
  | 'c_euljiro_skin'
  | 'c_chungmuro'
  | 'c_hongdae_aurora'
  | 'c_yeonnam_lab'
  | 'c_sangsu_derma'
  | 'c_hapjeong_glow'
  | 'c_gangnam_meridian'
  | 'c_sinsa_institute'
  | 'c_yeoksam_clear'
  | 'c_apgujeong_line'

export type PostId = 'post_marie' | 'post_dan' | 'post_sofia' | 'post_yuki'

export type EarnRuleId = 'earn_post' | 'earn_consult' | 'earn_reading'

export type StoreItemId = 'rw_sheet_mask' | 'rw_laser_coupon' | 'rw_sun_mini' | 'rw_night_serum'

export type TreatmentText = Omit<
  Treatment,
  'id' | 'pairedProductIds' | 'targets' | 'suits' | 'steps' | 'priceBasis'
> & {
  /** A step's number comes from the English step in the same place. */
  steps: Omit<TreatmentStep, 'order'>[]
  /**
   * Required here, unlike on `Treatment`: null where the English has none, so a
   * basis a language forgot is a compile error rather than an English word on its page.
   */
  priceBasis: string | null
}

export type ProductText = Omit<Product, 'id' | 'brand' | 'price'>

/** The walking distance is `CatalogText.walk`'s, built from the English label's numbers. */
export type ClinicText = Omit<
  Clinic,
  'id' | 'lat' | 'lng' | 'distanceLabel' | 'badge' | 'priceByTreatmentId' | 'districtKey' | 'posts'
>

export type DistrictText = Omit<District, 'key'>

/**
 * The writer keeps their name, and the treatment tag is the treatment's own short
 * name in that language, so the tag and the filter chip it sits beside always agree.
 */
export type PostText = Omit<
  CommunityPost,
  | 'id'
  | 'author'
  | 'initials'
  | 'verified'
  | 'treatmentTag'
  | 'likes'
  | 'comments'
  | 'treatmentId'
  | 'districtKey'
>

/** Points read "+400 P" and "1,100 P" in every language, as the app writes them. */
export type EarnRuleText = Omit<EarnRule, 'id' | 'pointsLabel'>

export type StoreItemText = Omit<
  RewardStoreItem,
  'id' | 'kind' | 'costLabel' | 'costPoints' | 'affordable' | 'art'
>

/**
 * The pairing lines that depend on which treatment led to the product: one per pair
 * in the English `TIE_OVERRIDES`, no more and no fewer. Any other pair reads the
 * product's own `tie`. A type literal rather than an interface, so `catalog.ts` can
 * read it with the plain-string ids the English objects hold.
 */
export type TieTexts = {
  [PD_RECOVERY_SERUM]: Record<
    | typeof TX_REDNESS_CARE
    | typeof TX_FILLER
    | typeof TX_SKIN_BOTOX
    | typeof TX_WRINKLE_BOTOX
    | typeof TX_JAW_BOTOX
    | typeof TX_REJURAN
    | typeof TX_CALMING
    | typeof TX_BRIGHTENING,
    string
  >
  [PD_SUN_FLUID]: Record<
    | typeof TX_REDNESS_CARE
    | typeof TX_CALMING
    | typeof TX_CAPRI
    | typeof TX_SECRET_RF
    | typeof TX_INFLAMED_ACNE
    | typeof TX_SHURINK
    | typeof TX_THERMAGE
    | typeof TX_ULTHERA
    | typeof TX_JAW_BOTOX,
    string
  >
  [PD_REPAIR_CREAM]: Record<
    typeof TX_CAPRI | typeof TX_INFLAMED_ACNE | typeof TX_SHURINK | typeof TX_ULTHERA,
    string
  >
  [PD_HYDRA_ESSENCE]: Record<typeof TX_SKIN_BOTOX | typeof TX_WRINKLE_BOTOX, string>
}

export interface CatalogText {
  treatments: Record<TreatmentId, TreatmentText>
  products: Record<ProductId, ProductText>
  ties: TieTexts
  districts: Record<DistrictKey, DistrictText>
  clinics: Record<ClinicId, ClinicText>
  /**
   * A clinic's walk as this language writes it — "도보 3분 · 240m" — from the minutes
   * and metres in the English label ("3 min walk · 240 m").
   */
  walk: (minutes: number, metres: number) => string
  posts: Record<PostId, PostText>
  earnRules: Record<EarnRuleId, EarnRuleText>
  storeItems: Record<StoreItemId, StoreItemText>
}

/**
 * "240m" and "1.0km" with `unitGap` '', or "240 m" and "1.0 km" with ' ': metres
 * below a kilometre, one decimal from there up, as every language's labels write it.
 */
export const metric = (metres: number, unitGap: string): string =>
  metres < 1000 ? `${metres}${unitGap}m` : `${(metres / 1000).toFixed(1)}${unitGap}km`
