import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TREATMENTS } from '../src/data/catalog.ts'
import { classificationFor, CLASSIFICATION_SOURCES, TREATMENT_CONCERNS, concernTier, filterTreatments } from '../src/data/treatmentConcerns.ts'
import { rankTreatments, matchesLeadingConcern } from '../src/analysis/treatmentRecommendations.ts'
import { SKIN_CATEGORIES } from '../src/analysis/types.ts'
import { TREATMENT_CONCERN_COPY } from '../src/i18n/treatmentConcerns.ts'

const ids = (concern) => filterTreatments(TREATMENTS, concern).map((t) => t.id)
const resultFor = (lead) => ({
  categories: SKIN_CATEGORIES.map((category) => ({ category, score: category === lead ? 20 : 90, level: category === lead ? 'FOCUS' : 'EASE' })),
})

test('active acne is separated from acne-scar and generic delivery procedures', () => {
  assert.equal(ids('ACNE')[0], 'tx_capri')
  assert.ok(ids('ACNE').includes('tx_pore_lift'))
  assert.equal(concernTier('tx_pore_lift', 'ACNE'), 2)
  for (const id of ['tx_secret_rf', 'tx_mts', 'tx_curejet', 'tx_juvelook', 'tx_skin_botox']) assert.ok(!ids('ACNE').includes(id))
  for (const id of ['tx_pore_lift', 'tx_secret_rf', 'tx_mts']) assert.ok(ids('SCARS').includes(id))
  assert.ok(!ids('SCARS').includes('tx_capri'))
})
test('hydration, contour and unclear products do not inherit unrelated score matches', () => {
  assert.ok(ids('HYDRATION').includes('tx_skinvive'))
  assert.ok(!ids('WRINKLES').includes('tx_skinvive'))
  assert.ok(!ids('LAXITY').includes('tx_skinvive'))
  assert.deepEqual(ids('BALANCE'), [])
  for (const id of ['tx_jaw_botox', 'tx_parotid_botox', 'tx_temporal_botox', 'tx_contour', 'tx_delivery', 'tx_salmon', 'tx_lilied']) {
    assert.deepEqual(classificationFor(id).matchTargets, [])
    assert.ok(classificationFor(id).manualOnly)
  }
  assert.ok(!ids('HYDRATION').includes('tx_olidia'))
})
test('redness is conditional and can never receive a top-match badge', () => {
  assert.deepEqual(ids('REDNESS'), ['tx_pore_lift'])
  assert.equal(concernTier('tx_pore_lift', 'REDNESS'), 2)
  for (const lead of ['REDNESS', 'BALANCE']) {
    for (const treatment of TREATMENTS) assert.equal(matchesLeadingConcern(treatment.id, resultFor(lead)), false)
  }
})
test('ranking favors the reviewed purpose rather than an unrelated multi-use or manual treatment', () => {
  assert.equal(rankTreatments(TREATMENTS, resultFor('ACNE'))[0].id, 'tx_capri')
  const wrinkles = rankTreatments(TREATMENTS, resultFor('WRINKLES')).map((t) => t.id)
  assert.ok(wrinkles.indexOf('tx_wrinkle_botox') < wrinkles.indexOf('tx_thermage'))
  assert.equal(matchesLeadingConcern('tx_capri', resultFor('ACNE')), true)
  assert.equal(matchesLeadingConcern('tx_pore_lift', resultFor('ACNE')), false)
  assert.equal(matchesLeadingConcern('tx_skinvive', resultFor('WRINKLES')), false)
})
test('all thirty entries have coherent classification, provenance, and translated concern labels', () => {
  assert.equal(filterTreatments(TREATMENTS, 'all').length, 30)
  for (const t of TREATMENTS) {
    const rule = classificationFor(t.id)
    assert.ok(rule.primary.length > 0)
    assert.ok(rule.summary.length > 0)
    assert.ok(rule.sourceIds.length > 0)
    const concerns = [...rule.primary, ...rule.secondary, ...rule.conditional]
    assert.equal(new Set(concerns).size, concerns.length)
    for (const concern of concerns) assert.ok(TREATMENT_CONCERNS.includes(concern))
    assert.deepEqual(t.targets, t.source.targets)
    assert.ok(!t.targets.includes('REDNESS') && !t.targets.includes('BALANCE'))
    if (rule.manualOnly) assert.deepEqual(t.targets, [])
    for (const target of t.targets) assert.ok([...rule.primary, ...rule.secondary].includes(target))
    for (const id of rule.sourceIds) assert.equal(new URL(CLASSIFICATION_SOURCES[id].url).protocol, 'https:')
  }
  for (const lang of ['en', 'ko', 'ja', 'zh']) {
    for (const concern of TREATMENT_CONCERNS) {
      assert.ok(TREATMENT_CONCERN_COPY[lang].labels[concern])
      assert.ok(TREATMENT_CONCERN_COPY[lang].descriptions[concern])
    }
  }
})
test('filtering is stable, deduplicated, and does not mutate the recommendation order', () => {
  const original = TREATMENTS.map((t) => t.id)
  for (const concern of TREATMENT_CONCERNS) {
    const filtered = filterTreatments(TREATMENTS, concern)
    assert.equal(new Set(filtered.map((t) => t.id)).size, filtered.length)
    const tiers = filtered.map((t) => concernTier(t.id, concern))
    assert.deepEqual(tiers, [...tiers].sort())
  }
  assert.deepEqual(TREATMENTS.map((t) => t.id), original)
})
