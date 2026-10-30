/**
 * Screen 12's chrome — the Android app's `ProductStrings`.
 *
 * A product's name, size, tie line, description and ingredient rows are catalogue
 * content. The house name (SOLION, LUNION) is a proper noun and is never translated.
 */
import type { Tables } from './index'

const en = {
  /** The small mono line on the drawn bottle: the real packshot goes there. */
  packshot: 'PACKSHOT PLACEHOLDER',
  /** Over the price: the rate for clinic patients, not retail. */
  memberPrice: 'Clinic member price',
  /** The stepper's two buttons, for a screen reader (they show "−" and "+"). */
  fewer: 'One fewer',
  more: 'One more',
  addToCart: 'Add to Cart',
  buyNow: 'Buy Now',
  /** What either purchase button reveals: there is no checkout behind them. */
  checkoutNote:
    'Checkout is not part of this prototype. Both lines are stocked at the partner clinics — ask at the front desk on your treatment day.',
  deliveryNote:
    'Pick up at the clinic on your treatment day, or have it delivered to your hotel. Free delivery over ₩50,000.',
}

export const PRODUCT: Tables<typeof en> = {
  en,
  ko: {
    packshot: '제품 사진 자리',
    memberPrice: '병원 회원가',
    fewer: '하나 빼기',
    more: '하나 더',
    addToCart: '장바구니 담기',
    buyNow: '구매하기',
    checkoutNote:
      '이 프로토타입에는 결제 기능이 없습니다. 두 라인 모두 제휴 병원에 비치되어 있으니, 시술 당일 접수처에 문의해 주세요.',
    deliveryNote:
      '시술 당일 병원에서 받아 가시거나, 묵고 계신 호텔로 배송받으실 수 있습니다. ₩50,000 이상 무료 배송.',
  },
  ja: {
    packshot: '製品写真 仮置き',
    memberPrice: 'クリニック会員価格',
    fewer: '1つ減らす',
    more: '1つ増やす',
    addToCart: 'カートに追加',
    buyNow: '購入する',
    checkoutNote:
      'このプロトタイプには決済機能がありません。どちらのラインも提携クリニックで取り扱っていますので、施術当日に受付でお尋ねください。',
    deliveryNote:
      '施術当日にクリニックでお受け取りいただけるほか、ホテルへのお届けも可能です。₩50,000以上で送料無料です。',
  },
  zh: {
    packshot: '产品图占位',
    memberPrice: '诊所会员价',
    fewer: '减少一件',
    more: '增加一件',
    addToCart: '加入购物车',
    buyNow: '立即购买',
    checkoutNote:
      '本原型不包含结账功能。两个系列在合作诊所均有供应，请在治疗当天向前台咨询。',
    deliveryNote: '可在治疗当天到诊所自取，也可配送到酒店。满 ₩50,000 免运费。',
  },
}
