/**
 * The catalogue, read in the page's language.
 *
 * `data/catalog.ts` stays the English source and the only place ids, prices,
 * targets and ordering live. The store keeps holding those English objects — its
 * logic runs on ids — and every screen reads the words through `useCatalog()`,
 * which swaps in the chosen language's text for the same ids.
 *
 * Each language's words are a `CatalogText` (`catalog.text.ts`) in `catalog.<lang>.ts`,
 * laid over the English objects by id. Every lookup below runs the English one and
 * swaps in the result's words, so ordering, filters and fallbacks cannot differ by
 * language.
 *
 * This is the public surface the screens depend on. Language-independent helpers
 * (`won`, `cheapestPrice`, the `TX_*` / `PD_*` ids) are still imported from
 * `data/catalog` directly.
 */
import { useMemo } from 'react'
import {
  CLINICS,
  DISTRICTS,
  EARN_RULES,
  PRODUCTS,
  SEED_POSTS,
  STORE_ITEMS,
  TREATMENTS,
  clinicById,
  clinicsFor,
  clinicsIn,
  districtByKey,
  priceRangeIn,
  productById,
  productsFor,
  tieFor,
  treatmentById,
  type Clinic,
  type CommunityPost,
  type District,
  type EarnRule,
  type Product,
  type RewardStoreItem,
  type Treatment,
} from '../data/catalog'
import { useLang, type Lang } from './index'
import { CATALOG_JA } from './catalog.ja'
import { CATALOG_KO } from './catalog.ko'
import type { CatalogText, TreatmentText } from './catalog.text'
import { CATALOG_ZH } from './catalog.zh'

export interface LocalCatalog {
  TREATMENTS: Treatment[]
  PRODUCTS: Product[]
  CLINICS: Clinic[]
  DISTRICTS: District[]
  SEED_POSTS: CommunityPost[]
  EARN_RULES: EarnRule[]
  STORE_ITEMS: RewardStoreItem[]
  treatmentById: (id: string | null) => Treatment | undefined
  productById: (id: string | null) => Product | undefined
  clinicById: (id: string | null) => Clinic | undefined
  districtByKey: (key: string | null) => District
  clinicsIn: (districtKey: string) => Clinic[]
  clinicsFor: (districtKey: string, treatmentId: string) => Clinic[]
  productsFor: (treatment: Treatment) => Product[]
  tieFor: (product: Product, treatmentId: string) => string
  priceRangeIn: (districtKey: string | null, treatmentId: string) => string
  /** Re-reads an object the store is holding (English) in the page's language. */
  treatment: (t: Treatment) => Treatment
}

const ENGLISH: LocalCatalog = {
  TREATMENTS,
  PRODUCTS,
  CLINICS,
  DISTRICTS,
  SEED_POSTS,
  EARN_RULES,
  STORE_ITEMS,
  treatmentById,
  productById,
  clinicById,
  districtByKey,
  clinicsIn,
  clinicsFor,
  productsFor,
  tieFor,
  priceRangeIn,
  treatment: (t) => t,
}

const WORDS: Record<Exclude<Lang, 'en'>, CatalogText> = {
  ko: CATALOG_KO,
  ja: CATALOG_JA,
  zh: CATALOG_ZH,
}

// Built on first use and kept: a language nobody picks is never assembled.
const built = new Map<Lang, LocalCatalog>()

/** Builds the catalogue for one language. English is the source, returned as is. */
export function catalogFor(lang: Lang): LocalCatalog {
  if (lang === 'en') return ENGLISH
  let catalog = built.get(lang)
  if (!catalog) {
    if (import.meta.env.DEV) reportGaps(lang, WORDS[lang])
    catalog = overlay(WORDS[lang])
    built.set(lang, catalog)
  }
  return catalog
}

export function useCatalog(): LocalCatalog {
  const { lang } = useLang()
  return useMemo(() => catalogFor(lang), [lang])
}

/** A table's words for an id the English objects hold as a plain string. */
const entry = <V>(table: Readonly<Record<string, V | undefined>>, id: string): V | undefined =>
  table[id]

/** `TieTexts`, read the same way. */
type TieRows = Readonly<Record<string, Readonly<Record<string, string | undefined>> | undefined>>

/** The English label's numbers: "12 min walk · 1.0 km" is 12 minutes and 1,000 metres. */
const WALK = /^(\d+) min walk · (\d+(?:\.\d+)?) (m|km)$/

function walkLabel(english: string, walk: CatalogText['walk']): string {
  const match = WALK.exec(english)
  if (!match) return english
  const metres = Math.round(Number(match[2]) * (match[3] === 'km' ? 1000 : 1))
  return walk(Number(match[1]), metres)
}

function withWords(en: Treatment, words: TreatmentText | undefined): Treatment {
  if (!words) return en
  const { steps, priceBasis, ...rest } = words
  return {
    ...en,
    ...rest,
    steps: steps.map((step, i) => ({ order: en.steps[i]?.order ?? String(i + 1), ...step })),
    priceBasis: priceBasis ?? undefined,
  }
}

const byId = <T extends { id: string }>(list: T[]): Map<string, T> =>
  new Map(list.map((item) => [item.id, item]))

/** The English catalogue with one language's words laid over it, id for id. */
function overlay(words: CatalogText): LocalCatalog {
  const treatments = TREATMENTS.map((t) => withWords(t, entry(words.treatments, t.id)))
  const products = PRODUCTS.map((p) => {
    const w = entry(words.products, p.id)
    return w ? { ...p, ...w } : p
  })
  const clinics = CLINICS.map((c) => {
    const w = entry(words.clinics, c.id)
    return w ? { ...c, ...w, distanceLabel: walkLabel(c.distanceLabel, words.walk) } : c
  })
  const districts = DISTRICTS.map((d) => {
    const w = entry(words.districts, d.key)
    return w ? { ...d, ...w } : d
  })

  const treatmentsById = byId(treatments)
  const productsById = byId(products)
  const clinicsById = byId(clinics)
  const districtsByKey = new Map(districts.map((d) => [d.key, d]))

  const treatment = (t: Treatment) => treatmentsById.get(t.id) ?? t
  const product = (p: Product) => productsById.get(p.id) ?? p
  const clinic = (c: Clinic) => clinicsById.get(c.id) ?? c

  const ties: TieRows = words.ties
  // The product passed in may be the English one the store holds, so the fallback
  // is this language's own tie for it, never `product.tie`.
  const localTieFor = (p: Product, treatmentId: string) =>
    ties[p.id]?.[treatmentId] ?? product(p).tie

  return {
    TREATMENTS: treatments,
    PRODUCTS: products,
    CLINICS: clinics,
    DISTRICTS: districts,
    SEED_POSTS: SEED_POSTS.map((post) => {
      const w = entry(words.posts, post.id)
      if (!w) return post
      // Tagged with the treatment's own short name, as the app does, so the tag
      // reads the same as the treatment it names.
      const tag = treatmentsById.get(post.treatmentId)?.shortName ?? post.treatmentTag
      return { ...post, ...w, treatmentTag: tag }
    }),
    EARN_RULES: EARN_RULES.map((rule) => {
      const w = entry(words.earnRules, rule.id)
      return w ? { ...rule, ...w } : rule
    }),
    STORE_ITEMS: STORE_ITEMS.map((item) => {
      const w = entry(words.storeItems, item.id)
      return w ? { ...item, ...w } : item
    }),
    treatmentById: (id) => {
      const t = treatmentById(id)
      return t && treatment(t)
    },
    productById: (id) => {
      const p = productById(id)
      return p && product(p)
    },
    clinicById: (id) => {
      const c = clinicById(id)
      return c && clinic(c)
    },
    districtByKey: (key) => {
      const d = districtByKey(key)
      return districtsByKey.get(d.key) ?? d
    },
    clinicsIn: (districtKey) => clinicsIn(districtKey).map(clinic),
    clinicsFor: (districtKey, treatmentId) => clinicsFor(districtKey, treatmentId).map(clinic),
    productsFor: (t) => productsFor(t).map((p) => ({ ...product(p), tie: localTieFor(p, t.id) })),
    tieFor: localTieFor,
    // "₩135,000–180,000" is written the same way in every language.
    priceRangeIn,
    treatment,
  }
}

/**
 * What the types cannot catch: a list a line short, a price basis on one side only,
 * or an id the English gained after `catalog.text.ts` listed them. Each would
 * otherwise show English, or a different count, on a translated page without anyone
 * noticing. Development only.
 */
function reportGaps(lang: Lang, words: CatalogText): void {
  const gaps: string[] = []
  const missing = (what: string, id: string) => gaps.push(`${what} ${id}: no words`)
  for (const t of TREATMENTS) {
    const w = entry(words.treatments, t.id)
    if (!w) {
      missing('treatment', t.id)
      continue
    }
    for (const list of ['steps', 'aftercare', 'cautions', 'goodFor'] as const) {
      if (w[list].length !== t[list].length) {
        gaps.push(`treatment ${t.id}: ${w[list].length} ${list}, the English has ${t[list].length}`)
      }
    }
    if ((w.priceBasis === null) !== (t.priceBasis === undefined)) {
      gaps.push(`treatment ${t.id}: priceBasis on one side only`)
    }
  }
  const ties: TieRows = words.ties
  for (const p of PRODUCTS) {
    const w = entry(words.products, p.id)
    if (!w) missing('product', p.id)
    else if (w.keys.length !== p.keys.length) {
      gaps.push(`product ${p.id}: ${w.keys.length} keys, the English has ${p.keys.length}`)
    }
    for (const t of TREATMENTS) {
      if ((tieFor(p, t.id) !== p.tie) !== (ties[p.id]?.[t.id] !== undefined)) {
        gaps.push(`tie ${p.id} after ${t.id}: on one side only`)
      }
    }
  }
  for (const c of CLINICS) {
    if (!entry(words.clinics, c.id)) missing('clinic', c.id)
    if (!WALK.test(c.distanceLabel)) gaps.push(`clinic ${c.id}: cannot read "${c.distanceLabel}"`)
  }
  for (const d of DISTRICTS) if (!entry(words.districts, d.key)) missing('district', d.key)
  for (const p of SEED_POSTS) if (!entry(words.posts, p.id)) missing('post', p.id)
  for (const r of EARN_RULES) if (!entry(words.earnRules, r.id)) missing('earn rule', r.id)
  for (const s of STORE_ITEMS) if (!entry(words.storeItems, s.id)) missing('store item', s.id)
  if (gaps.length > 0) {
    console.warn(`[catalog] ${lang} is out of step with the English:\n${gaps.join('\n')}`)
  }
}
