import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TREATMENTS } from '../src/data/catalog.ts'
import { catalogFor } from '../src/i18n/catalog.ts'
import { treatmentText } from '../src/i18n/treatmentContent.ts'
import { classificationFor, CLASSIFICATION_SOURCES } from '../src/data/treatmentConcerns.ts'
import words from '../src/i18n/treatmentText.json'
import original from '../src/data/treatments.generated.json'
import { LangProvider } from '../src/i18n/index.tsx'
import { StoreProvider } from '../src/state/store.tsx'
import { Treatments } from '../src/screens/Treatments.tsx'
import { Detail } from '../src/screens/Detail.tsx'
import { Clinics } from '../src/screens/Clinics.tsx'
import { Booking } from '../src/screens/Booking.tsx'

const korean = /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u
const displayStrings = (source) => [
  source.name, source.category, source.effects, source.overview,
  ...source.advantages, ...source.recommendedFor, ...source.cautions,
  ...source.packages.flatMap((p) => [p.name, p.description]),
  ...source.faqs.flatMap((f) => [f.question, f.answer]),
]

test('all treatment copy, classification notes and references have three translations', () => {
  assert.equal(words.sourceSha256, original.sha256, 'review translations after importing a new CSV')
  const strings = TREATMENTS.flatMap((t) => [
    ...displayStrings(t.source), classificationFor(t.id).summary, classificationFor(t.id).note,
  ]).concat(Object.values(CLASSIFICATION_SOURCES).map((s) => s.title)).filter(Boolean)
  for (const text of new Set(strings)) {
    const translations = words.translations[text]
    assert.equal(translations?.length, 3, `missing translations: ${text}`)
    for (const value of translations) {
      assert.ok(value.trim(), `empty translation: ${text}`)
      assert.doesNotMatch(value, korean, `Korean leaked into translation: ${text}`)
    }
  }
})

test('all four catalogues preserve every option, price, FAQ and matching rule', () => {
  const snapshot = JSON.stringify(TREATMENTS)
  for (const lang of ['en', 'ja', 'zh', 'ko']) {
    const cat = catalogFor(lang)
    assert.equal(cat.TREATMENTS.length, 30)
    for (const base of TREATMENTS) {
      const t = cat.treatment(base)
      assert.equal(t, cat.treatmentById(base.id))
      assert.equal(cat.treatment(t), t)
      assert.deepEqual(t.targets, base.targets)
      assert.deepEqual(t.suits, base.suits)
      assert.deepEqual(t.source.raw, base.source.raw)
      assert.equal(t.source.image, base.source.image)
      assert.equal(t.source.faqs.length, base.source.faqs.length)
      assert.equal(t.source.packages.length, base.source.packages.length)
      assert.equal(t.source.advantages.length, base.source.advantages.length)
      assert.equal(t.source.recommendedFor.length, base.source.recommendedFor.length)
      assert.equal(t.source.cautions.length, base.source.cautions.length)
      t.source.packages.forEach((p, i) => {
        const { name: _name, description: _description, ...data } = p
        const { name: _oldName, description: _oldDescription, ...expected } = base.source.packages[i]
        assert.deepEqual(data, expected)
        // Preserve quantities and numeric product names in the booking options.
        assert.deepEqual(p.name.replaceAll(t.name, '').match(/\d+(?:\.\d+)?/g), base.source.packages[i].name.replaceAll(base.name, '').match(/\d+(?:\.\d+)?/g))
      })
      if (lang === 'ko') assert.equal(t, base)
      else {
        for (const text of [...displayStrings(t.source), t.cardSummary]) assert.doesNotMatch(text, korean)
        assert.notEqual(t.summary, base.summary)
        assert.notEqual(t.cardSummary, base.cardSummary)
      }
    }
  }
  assert.equal(JSON.stringify(TREATMENTS), snapshot, 'language switching must not mutate source data')
})

test('language switching uses current names throughout cards, detail, clinics and booking', () => {
  let lang = 'en'
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key) => key === 'solution.lang.v1' ? lang : null,
    setItem() {},
  } })
  const render = (screen) => renderToStaticMarkup(createElement(LangProvider, null,
    createElement(StoreProvider, null, createElement(screen))))
  const escapeText = (value) => renderToStaticMarkup(createElement('span', null, value)).slice(6, -7)
  for (lang of ['en', 'ja', 'zh', 'ko', 'en']) {
    const cat = catalogFor(lang)
    const cards = render(Treatments)
    for (const t of cat.TREATMENTS) {
      assert.ok(cards.includes(escapeText(t.cardSummary)), `${lang}: missing ${t.id} card summary`)
    }
    const detail = render(Detail)
    assert.ok(detail.includes(cat.TREATMENTS[0].source.overview))
    assert.ok(detail.includes(escapeText(treatmentText(classificationFor(cat.TREATMENTS[0].id).note, lang))), "classification notes are available in detail")
    assert.ok(detail.includes(`lang="${lang}"`))
    for (const screen of [Treatments, Detail, Clinics, Booking]) {
      const html = render(screen)
      if (lang !== 'ko') assert.doesNotMatch(html, korean, `${lang}: ${screen.name} leaks Korean`)
      assert.doesNotMatch(html, /provided in Korean|韓国語で提供|以韩语提供|undefined|NaN/)
    }
  }
})
