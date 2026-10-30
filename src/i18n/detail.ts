/**
 * Screen 09's chrome — the Android app's `DetailStrings`.
 *
 * A treatment's tag, name, summary, course, downtime, results, steps, aftercare and
 * cautions are catalogue content and arrive translated through `useCatalog()`. The
 * price and session cells' labels are the shared `UI` table's, and the price-basis
 * line is the list screen's (`TREATMENT_LIST.priceBasis`).
 */
import type { Tables } from './index'

const en = {
  /** The back link. Words only: the component draws the arrow. */
  allTreatments: 'All treatments',
  /** The save toggle beside the name, before and after. */
  save: 'Add to Interested',
  saved: 'Saved',
  clinicsNearby: 'CLINICS NEARBY',
  /** The CLINICS NEARBY cell: "4 in Myeongdong". */
  nearbyIn: (count: number, district: string) => `${count} in ${district}`,
  /** The same cell with no district to name. */
  nearbyCount: (count: number) => `${count}`,
  stepsTitle: 'What happens on the day',
  aftercareTitle: 'How the days after go',
  cautionsTitle: 'Before you book',
  /** The clinic call-to-action card. */
  compareTitle: 'Ready to compare clinics?',
  compareBodyIn: (count: number, district: string) =>
    `See the ${count} clinics in ${district} that run this treatment, with prices side by side.`,
  compareBody: 'See the clinics that run this treatment, with prices side by side.',
  findClinics: 'Find Recommended Clinics',
  pairedTitle: 'Pairs well with',
  /** Sits beside `pairedTitle` to say where the products are sold. */
  pairedSource: 'At partner clinics',
  pairedNote: 'Protect during the day, recover at night.',
  buy: 'Buy Product',
}

export const TREATMENT_DETAIL: Tables<typeof en> = {
  en,
  ko: {
    allTreatments: '전체 시술',
    save: '관심 목록에 추가',
    saved: '저장됨',
    clinicsNearby: '주변 병원',
    nearbyIn: (count, district) => `${district} ${count}곳`,
    nearbyCount: (count) => `${count}곳`,
    stepsTitle: '어떻게 진행되나요',
    aftercareTitle: '시술 후 이렇게 지나갑니다',
    cautionsTitle: '미리 알아두세요',
    compareTitle: '병원을 비교해 볼까요?',
    compareBodyIn: (count, district) =>
      `이 시술을 하는 ${district} 병원 ${count}곳의 가격을 나란히 비교해 보세요.`,
    compareBody: '이 시술을 하는 병원들의 가격을 나란히 비교해 보세요.',
    findClinics: '추천 병원 알아보기',
    pairedTitle: '함께 쓰면 좋은 제품',
    pairedSource: '제휴 병원에서 판매',
    pairedNote: '낮에는 보호하고, 밤에는 회복해요.',
    buy: '제품 구매하기',
  },
  ja: {
    allTreatments: '施術一覧',
    save: '気になるリストに追加',
    saved: '保存済み',
    clinicsNearby: '近くのクリニック',
    nearbyIn: (count, district) => `${district}に${count}院`,
    nearbyCount: (count) => `${count}院`,
    stepsTitle: '当日の流れ',
    aftercareTitle: '施術後の経過',
    cautionsTitle: '予約の前に',
    compareTitle: 'クリニックを比べてみませんか？',
    compareBodyIn: (count, district) =>
      `この施術を行う${district}のクリニック${count}院を、料金を並べて比べられます。`,
    compareBody: 'この施術を行うクリニックを、料金を並べて比べられます。',
    findClinics: 'おすすめのクリニックを見る',
    pairedTitle: '一緒に使うなら',
    pairedSource: '提携クリニックで販売',
    pairedNote: '日中は守り、夜は回復。',
    buy: '製品を購入',
  },
  zh: {
    allTreatments: '全部项目',
    save: '加入感兴趣清单',
    saved: '已收藏',
    clinicsNearby: '附近诊所',
    nearbyIn: (count, district) => `${district}${count}家`,
    nearbyCount: (count) => `${count}家`,
    stepsTitle: '当天流程',
    aftercareTitle: '术后恢复过程',
    cautionsTitle: '预约前须知',
    compareTitle: '要比较诊所吗？',
    compareBodyIn: (count, district) => `查看${district}提供此项目的${count}家诊所，价格并排对比。`,
    compareBody: '查看提供此项目的诊所，价格并排对比。',
    findClinics: '查看推荐诊所',
    pairedTitle: '适合搭配的产品',
    pairedSource: '合作诊所有售',
    pairedNote: '白天防护，夜间修护。',
    buy: '购买产品',
  },
}
