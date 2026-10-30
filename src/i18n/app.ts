/**
 * The shell's own words: the browser tab, the description a shared link previews
 * with, and the prototype's jump rail.
 *
 * `index.html` keeps the English title and description for the first paint and for
 * anything that reads the page without running it; the shell swaps in these once the
 * language is known.
 */
import type { Page } from '../state/store'
import type { Tables } from './index'

const rail: Record<Page, string> = {
  landing: 'Landing',
  form: 'Info form',
  capture: 'Webcam',
  analyzing: 'Analyzing',
  result: 'Result',
  treatments: 'Treatments',
  detail: 'Detail',
  clinics: 'Clinics',
  booking: 'Booking',
  product: 'Product',
  mylist: 'My list',
  community: 'Community',
  rewards: 'Rewards',
  qr: 'QR',
}

const en = {
  documentTitle: 'SoLuTion — skin reading',
  description:
    'SoLuTion reads your skin from your webcam, explains what it finds, and shows which Seoul clinics treat it.',
  /** The label at the head of the jump rail. */
  prototype: 'PROTOTYPE',
  /** One name per screen; the design's screen numbers are the shell's, not words. */
  rail,
}

export const APP: Tables<typeof en> = {
  en,
  ko: {
    documentTitle: 'SoLuTion — 피부 진단',
    description:
      'SoLuTion은 웹캠으로 피부를 살펴보고 발견한 내용을 설명해 드려요. 서울 어느 병원에서 시술받을 수 있는지도 알려 드려요.',
    prototype: '프로토타입',
    rail: {
      landing: '첫 화면',
      form: '정보 입력',
      capture: '웹캠',
      analyzing: '분석 중',
      result: '결과',
      treatments: '시술',
      detail: '상세',
      clinics: '병원',
      booking: '예약',
      product: '제품',
      mylist: '내 목록',
      community: '커뮤니티',
      rewards: '리워드',
      qr: 'QR 코드',
    },
  },
  ja: {
    documentTitle: 'SoLuTion — 肌診断',
    description:
      'SoLuTionはウェブカメラで肌を読み取り、わかったことを説明します。その悩みに対応するソウルのクリニックもご案内します。',
    prototype: 'プロトタイプ',
    rail: {
      landing: 'トップ',
      form: '基本情報',
      capture: 'ウェブカメラ',
      analyzing: '分析中',
      result: '結果',
      treatments: '施術',
      detail: '詳細',
      clinics: 'クリニック',
      booking: '予約',
      product: '製品',
      mylist: 'マイリスト',
      community: 'コミュニティ',
      rewards: 'リワード',
      qr: 'QRコード',
    },
  },
  zh: {
    documentTitle: 'SoLuTion — 皮肤检测',
    description: 'SoLuTion 通过摄像头检测您的皮肤，解释它的发现，并告诉您首尔哪些诊所可以处理。',
    prototype: '原型',
    rail: {
      // Not 首页: that is the nav's Home tab, which opens the treatments.
      landing: '起始页',
      form: '基本信息',
      capture: '摄像头',
      analyzing: '分析中',
      result: '结果',
      treatments: '项目',
      detail: '详情',
      clinics: '诊所',
      booking: '预约',
      product: '产品',
      mylist: '我的清单',
      community: '社区',
      rewards: '奖励',
      qr: '二维码',
    },
  },
}
