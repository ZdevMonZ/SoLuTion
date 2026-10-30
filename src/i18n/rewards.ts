/**
 * Screen 16, Rewards — the Android app's `RewardsStrings`, with its wording.
 *
 * The rows are content and come from the catalogue: an earn rule's title, subtitle
 * and "+400 P", a store item's name and cost. Only the frame around them lives here.
 */
import type { RewardKind } from '../data/catalog'
import type { Tables } from './index'

/**
 * A point figure as the catalogue prints its costs, "1,240". The en-US grouping
 * reads the same in all four languages, so the figures on one screen cannot
 * disagree in format.
 */
const points = (value: number): string => value.toLocaleString('en-US')

const en = {
  /** Eyebrow over the dial. */
  pointsBalance: 'POINTS BALANCE',
  /**
   * Caption under the numeral inside the dial. Translated, unlike the SKIN SCORE
   * wordmark — this one names the unit the number counts in.
   */
  pointsCaption: 'POINTS',
  /**
   * Beside the dial. A function because the figure falls in a different place in
   * each language: English opens on it, the other three close on it, with the "P"
   * the earn rules and costs already use so the bare number does not read as a price.
   */
  toNextTier: (remaining: number) => `${points(remaining)} more to reach the next tier`,
  /** What the next tier brings, under that line. */
  tierPerk: 'Tier two adds a free product mini with every booked consultation.',
  waysToEarn: 'Ways to earn',
  rewardsStore: 'Rewards store',
  /** Beside the store heading: where a reward is actually handed over. */
  redeemedBy: 'Redeemed in clinic by QR',
  /** A store card's action; the screen draws the arrow, so this is the word alone. */
  redeem: 'Redeem',
  /** Stands where `redeem` would be on an item the balance cannot cover. */
  locked: 'Locked',
  /** Under the store: the balance is fixed and nothing is spent. */
  sampleNote: 'Points and rewards are sample data for this prototype; nothing is deducted.',
}

export const REWARDS: Tables<typeof en> = {
  en,
  ko: {
    pointsBalance: '포인트 잔액',
    pointsCaption: '포인트',
    toNextTier: (remaining) => `다음 등급까지 ${points(remaining)}P 남았어요`,
    tierPerk: '2등급부터는 예약한 상담마다 제품 미니어처를 무료로 드려요.',
    waysToEarn: '포인트 모으는 방법',
    rewardsStore: '리워드 스토어',
    redeemedBy: '병원에서 QR로 사용',
    redeem: '교환하기',
    locked: '잠김',
    sampleNote: '포인트와 리워드는 이 프로토타입의 예시 데이터예요. 실제로 차감되지 않아요.',
  },
  ja: {
    pointsBalance: 'ポイント残高',
    pointsCaption: 'ポイント',
    toNextTier: (remaining) => `次のランクまであと${points(remaining)}P`,
    tierPerk:
      'ランク2になると、カウンセリングのご予約ごとに製品のミニサイズを無料でお渡しします。',
    waysToEarn: 'ポイントの貯め方',
    rewardsStore: 'リワードストア',
    redeemedBy: 'クリニックでQRを提示して交換',
    redeem: '交換する',
    locked: 'ロック中',
    sampleNote:
      'ポイントとリワードはこのプロトタイプのサンプルデータです。実際には差し引かれません。',
  },
  zh: {
    pointsBalance: '积分余额',
    pointsCaption: '积分',
    toNextTier: (remaining) => `距离下一等级还差${points(remaining)}P`,
    tierPerk: '升到第二等级后，每次预约面诊都会赠送一份产品小样。',
    waysToEarn: '积分获取方式',
    rewardsStore: '奖励商城',
    redeemedBy: '到诊所出示二维码兑换',
    redeem: '兑换',
    locked: '未解锁',
    sampleNote: '积分和奖励均为此原型的示例数据，不会实际扣除。',
  },
}

/**
 * The small caps line over a reward's name, so a coupon is told from a parcel
 * first. Shared by the store cards and the QR screen, which name the same item.
 */
export const REWARD_KIND: Tables<Record<RewardKind, string>> = {
  en: { PHYSICAL: 'PHYSICAL ITEM', COUPON: 'DIGITAL COUPON' },
  ko: { PHYSICAL: '실물 상품', COUPON: '디지털 쿠폰' },
  ja: { PHYSICAL: '実物アイテム', COUPON: 'デジタルクーポン' },
  zh: { PHYSICAL: '实物商品', COUPON: '电子优惠券' },
}
