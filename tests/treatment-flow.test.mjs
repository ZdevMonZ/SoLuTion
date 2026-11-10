import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { navigate, finishSignup, dismissSignup } from '../src/state/navigation.ts'
import { StoreProvider } from '../src/state/store.tsx'
import { LangProvider } from '../src/i18n/index.tsx'
import { catalogFor } from '../src/i18n/catalog.ts'
import { treatmentImage } from '../src/data/treatmentImages.ts'
import { TREATMENTS, SEED_POSTS, priceRangeIn, cheapestPrice } from '../src/data/catalog.ts'
import { Treatments } from '../src/screens/Treatments.tsx'
import { Detail } from '../src/screens/Detail.tsx'
import { Clinics } from '../src/screens/Clinics.tsx'
import { Booking } from '../src/screens/Booking.tsx'
import { Community } from '../src/screens/Community.tsx'
import { TopNav } from '../src/components/TopNav.tsx'
import { SignupModal } from '../src/components/Modals.tsx'

const preferences = new Map()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key) => preferences.get(key) ?? null, setItem: (key, value) => preferences.set(key, value) } })

const guest = { page: 'booking', modal: null, signedIn: false, pendingPage: null, communityFilterId: 'tx:tx_thermage' }
const merge = (state, patch) => ({ ...state, ...patch })
const render = (Screen) => renderToStaticMarkup(createElement(LangProvider, null, createElement(StoreProvider, null, createElement(Screen))))

test('the diagnosis-to-booking path is open to guests; reviews alone require signup', () => {
  for (const page of ['landing', 'capture', 'analyzing', 'result', 'treatments', 'detail', 'clinics', 'booking']) {
    assert.deepEqual(navigate(guest, page), { page, modal: null, pendingPage: null })
  }
  const gated = merge(guest, navigate(guest, 'community'))
  assert.equal(gated.page, 'booking')
  assert.equal(gated.modal, 'signup')
  const signedIn = merge(gated, finishSignup(gated))
  assert.equal(signedIn.page, 'community')
  assert.equal(signedIn.communityFilterId, 'tx:tx_thermage')
  assert.equal(signedIn.signedIn, true)
  assert.equal(navigate(signedIn, 'community').modal, null)
})
test('cancel stays on the originating page, without granting review access', () => {
  for (const page of ['landing', 'detail', 'booking']) {
    const origin = { ...guest, page }
    const canceled = merge(merge(origin, navigate(origin, 'community')), dismissSignup())
    assert.equal(canceled.page, page)
    assert.equal(canceled.pendingPage, null)
    assert.equal(canceled.signedIn, false)
    assert.equal(navigate(canceled, 'community').modal, 'signup')
    assert.equal(finishSignup(canceled).page, page) // voluntary signup has no stale redirect
  }
})
test('30 source records keep their content in every UI language and have unique English artwork', () => {
  assert.equal(TREATMENTS.length, 30)
  const imageUrls = new Set()
  for (const lang of ['en', 'ko', 'ja', 'zh']) {
    const cat = catalogFor(lang)
    for (const t of cat.TREATMENTS) {
      assert.equal(t.summary, t.source.raw['시술 안내'].trim())
      assert.equal(t.cardSummary, t.source.raw['효과'].trim())
      assert.equal(t.name, t.source.raw['장비(시술)'].trim())
      assert.ok(t.source.faqs.length > 0)
      assert.ok(t.source.cautions.length > 0)
      assert.equal(cat.productsFor(t).length, 0)
      assert.equal(cheapestPrice('myeongdong', t.id), null)
      assert.doesNotMatch(priceRangeIn('myeongdong', t.id), /NaN|undefined|^—$/)
      const image = treatmentImage(t.id)
      assert.ok(image.src.startsWith('/SoLuTion/images/treatments/'))
      assert.ok(existsSync(new URL(`../public/images/treatments/${t.source.image}`, import.meta.url)))
      imageUrls.add(image.src)
    }
  }
  assert.equal(imageUrls.size, 30)
})
test('discounted package prices, not crossed-out prices, define the displayed range', () => {
  assert.equal(priceRangeIn('gangnam', 'tx_thermage'), '₩1,200,000–3,200,000')
  assert.equal(priceRangeIn('myeongdong', 'tx_olidia'), '₩240,000')
  assert.equal(priceRangeIn('hongdae', 'tx_toning'), '₩49,000–69,000')
})
test('updated screens render through the real providers without missing prices or products', () => {
  const cards = render(Treatments)
  assert.equal((cards.match(/class="treatment-photo"/g) ?? []).length, 30)
  assert.doesNotMatch(cards, /NaN|undefined/)
  const detail = render(Detail)
  assert.equal((detail.match(/class="treatment-faq"/g) ?? []).length, TREATMENTS[0].source.faqs.length)
  assert.doesNotMatch(detail, /SOLION|LUNION|pairs well|함께 쓰면/)
  for (const Screen of [Clinics, Booking]) {
    const markup = render(Screen)
    assert.doesNotMatch(markup, /NaN|undefined/)
    assert.match(markup, /Confirm with clinic/)
  }
  const nav = render(TopNav)
  assert.match(nav, /Home/)
  assert.match(nav, /Skin check/)
  assert.match(nav, /Treatments/)
  assert.match(nav, /Community/)
  assert.doesNotMatch(nav, /Health checkup|My List|Rewards/)
  const signup = render(SignupModal)
  assert.match(signup, /type="email"/)
  assert.match(signup, /minLength="8"/)
  assert.doesNotMatch(signup, /Google|Apple|continue without/i)
  const community = render(Community)
  for (const post of SEED_POSTS) assert.ok(!community.includes(post.text))
})

test('Korean navigation and source details render without stale translated catalog text', () => {
  preferences.set('solution.lang.v1', 'ko')
  const nav = render(TopNav)
  for (const label of ['홈', '피부 진단하기', '시술 둘러보기', '커뮤니티']) assert.ok(nav.includes(label))
  assert.doesNotMatch(nav, /건강검진|내 목록|리워드/)
  const detail = render(Detail)
  assert.match(detail, /추천 병원 알아보기/)
  assert.match(detail, /리뷰 \/ 후기 보기/)
  assert.match(detail, /자주 묻는 질문/)
  assert.ok(detail.includes(TREATMENTS[0].summary))
  preferences.clear()
})
