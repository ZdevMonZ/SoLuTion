/**
 * Screen 11's chrome — the Android app's `BookingStrings`.
 *
 * The offered days are real dates (`DAYS` in the screen), so each language names
 * them with its own calendar words from `Intl` rather than an English "MON" or
 * "Sep"; only the arrangement around the clock time is written here.
 */
import type { Tables } from './index'

/** One `Intl` formatter, built once per language rather than on every render. */
const dates = (locale: string, options: Intl.DateTimeFormatOptions) => {
  const format = new Intl.DateTimeFormat(locale, options)
  return (date: Date) => format.format(date)
}

const enWeekday = dates('en-US', { weekday: 'short' })
// en-US, not en-GB: the design writes "Sep", and en-GB's short month is "Sept".
const enMonth = dates('en-US', { month: 'short' })

// The other three write the whole date as their own calendars do — "9월 22일 (화)",
// "9月22日(火)", "9月22日周二" — and only the time is added after it.
const DAY_OPTIONS: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'short' }
const koDay = dates('ko-KR', DAY_OPTIONS)
const jaDay = dates('ja-JP', DAY_OPTIONS)
const zhDay = dates('zh-CN', DAY_OPTIONS)

const en = {
  title: 'Book a consultation',
  dayLabel: 'PREFERRED DAY',
  timeLabel: 'TIME',
  /** Over a day's number: "MON". English sets it in caps, as the design does. */
  weekday: (date: Date) => enWeekday(date).toUpperCase(),
  /** A slot already taken: "18:00 full". */
  slotFull: (time: string) => `${time} full`,
  /** The well's heading: nothing here is a confirmed appointment. */
  doctorTitle: 'Final confirmation happens with the doctor',
  doctorBody:
    'The reading is a starting point. At the consultation a dermatologist reviews it with you and adjusts the plan — you can also leave without booking anything.',
  /** Opening hours and the change policy, under the well. */
  hoursNote:
    'Open weekdays 10:00–19:00, Saturday 10:00–15:00. Change or cancel until the day before. Bring your passport for the tourist tax refund.',
  /** Eyebrow over the summary panel. */
  selectionLabel: 'YOUR SELECTION',
  /** "3 min walk · 240 m · English-speaking staff". */
  staffLine: (distance: string) => `${distance} · English-speaking staff`,
  /** The summary's price row: "Pico Fraxel · per session". */
  perSession: (shortName: string) => `${shortName} · per session`,
  consultation: 'Consultation',
  /** The consultation's price. */
  free: 'Free',
  appointment: 'Appointment',
  /** The chosen slot: "TUE 22 Sep, 14:00". */
  appointmentAt: (date: Date, time: string) =>
    `${enWeekday(date).toUpperCase()} ${date.getDate()} ${enMonth(date)}, ${time}`,
  request: 'Request this appointment',
  /** Reassurance under the request button. */
  noDeposit: 'No deposit. Pay at the clinic after your consultation.',
}

export const BOOKING: Tables<typeof en> = {
  en,
  ko: {
    title: '상담 예약',
    dayLabel: '희망 날짜',
    timeLabel: '시간',
    weekday: dates('ko-KR', { weekday: 'short' }),
    slotFull: (time) => `${time} 마감`,
    doctorTitle: '최종 확인은 의사 상담에서 이루어집니다',
    doctorBody:
      '진단 결과는 출발점입니다. 상담에서는 피부과 전문의가 결과를 함께 살펴보며 계획을 조정해 드리고, 아무것도 예약하지 않고 돌아가셔도 됩니다.',
    hoursNote:
      '평일 10:00–19:00, 토요일 10:00–15:00 진료합니다. 예약 변경과 취소는 전날까지 가능합니다. 외국인 관광객 부가세 환급을 받으시려면 여권을 지참해 주세요.',
    selectionLabel: '선택 내역',
    staffLine: (distance) => `${distance} · 영어 응대 가능`,
    perSession: (shortName) => `${shortName} · 1회`,
    consultation: '상담',
    free: '무료',
    appointment: '예약 일시',
    appointmentAt: (date, time) => `${koDay(date)} ${time}`,
    request: '이 일정으로 예약 요청',
    noDeposit: '예약금은 없습니다. 상담 후 병원에서 결제하세요.',
  },
  ja: {
    title: 'カウンセリング予約',
    dayLabel: '希望日',
    timeLabel: '時間',
    weekday: dates('ja-JP', { weekday: 'short' }),
    slotFull: (time) => `${time} 満席`,
    doctorTitle: '最終的な確認は医師の診察で',
    doctorBody:
      '診断結果は出発点です。カウンセリングでは皮膚科医が結果を一緒に確認しながらプランを調整します。何も予約せずにお帰りいただいても大丈夫です。',
    hoursNote:
      '平日10:00–19:00、土曜10:00–15:00に診療しています。変更・キャンセルは前日まで可能です。観光客の税金還付にはパスポートをお持ちください。',
    selectionLabel: '選択内容',
    staffLine: (distance) => `${distance} · 英語対応スタッフ在籍`,
    perSession: (shortName) => `${shortName} · 1回`,
    consultation: 'カウンセリング',
    free: '無料',
    appointment: '予約日時',
    appointmentAt: (date, time) => `${jaDay(date)} ${time}`,
    request: 'この日時で予約をリクエスト',
    noDeposit: '予約金は不要です。カウンセリング後にクリニックでお支払いください。',
  },
  zh: {
    title: '预约面诊',
    dayLabel: '期望日期',
    timeLabel: '时间',
    weekday: dates('zh-CN', { weekday: 'short' }),
    slotFull: (time) => `${time} 已满`,
    doctorTitle: '最终确认由医生面诊完成',
    doctorBody:
      '检测结果只是起点。面诊时，皮肤科医生会和您一起查看结果并调整方案，您也可以不预约任何项目直接离开。',
    hoursNote:
      '工作日 10:00–19:00，周六 10:00–15:00 接诊。最晚可在预约前一天更改或取消。办理游客退税请携带护照。',
    selectionLabel: '已选内容',
    staffLine: (distance) => `${distance} · 提供英语服务`,
    perSession: (shortName) => `${shortName} · 单次`,
    consultation: '面诊',
    free: '免费',
    appointment: '预约时间',
    appointmentAt: (date, time) => `${zhDay(date)} ${time}`,
    request: '申请此时段预约',
    noDeposit: '无需预约金，面诊后在诊所付款。',
  },
}
