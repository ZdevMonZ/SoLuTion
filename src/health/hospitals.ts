/**
 * Sample hospitals for the health-checkup mode: four per district, in the same
 * three districts and the same spirit as the dermatology clinics in
 * `data/catalog.ts` — invented names, plausible streets, numbers for the
 * prototype. The screen says so.
 *
 * A hospital lists the departments it runs. A health-checkup centre runs all of
 * them and is marked, because it is the one place every follow-up can start.
 */
import { DISTRICT_GANGNAM, DISTRICT_HONGDAE, DISTRICT_MYEONGDONG } from '../data/catalog'
import type { Lang } from '../i18n'
import type { DepartmentId } from './items'

export interface Hospital {
  id: string
  districtKey: string
  name: Record<Lang, string>
  /** Romanised for every language but Korean — the form a taxi driver and a map app both take. */
  address: { en: string; ko: string }
  lat: number
  lng: number
  walkMinutes: number
  meters: number
  departments: DepartmentId[]
  checkupCenter: boolean
  weekdayHours: string
  saturdayHours: string | null
}

const ALL: DepartmentId[] = ['cardiology', 'endocrinology', 'internal', 'gastro', 'nephrology', 'familyMed']

export const HOSPITALS: Hospital[] = [
  {
    id: 'h_solution_health_md',
    districtKey: DISTRICT_MYEONGDONG,
    name: {
      en: 'SoLuTion Health Center Myeongdong',
      ko: 'SoLuTion 건강검진센터 명동',
      ja: 'SoLuTion 健診センター 明洞',
      zh: 'SoLuTion 体检中心 明洞',
    },
    address: { en: '41 Namdaemun-ro, Jung-gu, 4F', ko: '중구 남대문로 41, 4층' },
    lat: 37.5641,
    lng: 126.9829,
    walkMinutes: 4,
    meters: 300,
    departments: ALL,
    checkupCenter: true,
    weekdayHours: '07:30–17:30',
    saturdayHours: '07:30–12:30',
  },
  {
    id: 'h_namsan_gate_im',
    districtKey: DISTRICT_MYEONGDONG,
    name: {
      en: 'Namsan Gate Internal Medicine',
      ko: '남산게이트 내과의원',
      ja: '南山ゲート内科',
      zh: '南山门内科诊所',
    },
    address: { en: '27 Toegye-ro 20-gil, Jung-gu, 2F', ko: '중구 퇴계로20길 27, 2층' },
    lat: 37.5615,
    lng: 126.9851,
    walkMinutes: 7,
    meters: 550,
    departments: ['internal', 'gastro', 'endocrinology'],
    checkupCenter: false,
    weekdayHours: '09:00–18:30',
    saturdayHours: '09:00–13:00',
  },
  {
    id: 'h_euljiro_heart',
    districtKey: DISTRICT_MYEONGDONG,
    name: {
      en: 'Euljiro Heart & Vessel Clinic',
      ko: '을지로 하트앤베슬 의원',
      ja: '乙支路ハート&ベッセル クリニック',
      zh: '乙支路心血管诊所',
    },
    address: { en: '80 Euljiro, Jung-gu, 6F', ko: '중구 을지로 80, 6층' },
    lat: 37.5662,
    lng: 126.9902,
    walkMinutes: 9,
    meters: 720,
    departments: ['cardiology', 'internal'],
    checkupCenter: false,
    weekdayHours: '09:00–18:00',
    saturdayHours: null,
  },
  {
    id: 'h_hoehyeon_family',
    districtKey: DISTRICT_MYEONGDONG,
    name: {
      en: 'Hoehyeon Family Medicine',
      ko: '회현 가정의학과의원',
      ja: '会賢ファミリークリニック',
      zh: '会贤家庭医学科诊所',
    },
    address: { en: '15 Sogong-ro 6-gil, Jung-gu, 3F', ko: '중구 소공로6길 15, 3층' },
    lat: 37.5589,
    lng: 126.9805,
    walkMinutes: 11,
    meters: 900,
    departments: ['familyMed', 'internal'],
    checkupCenter: false,
    weekdayHours: '09:00–19:00',
    saturdayHours: '09:00–14:00',
  },

  {
    id: 'h_hongdae_checkup',
    districtKey: DISTRICT_HONGDAE,
    name: {
      en: 'Hongdae Checkup & Internal Medicine',
      ko: '홍대 검진내과의원',
      ja: '弘大健診内科',
      zh: '弘大体检内科',
    },
    address: { en: '29 Yanghwa-ro 16-gil, Mapo-gu, 5F', ko: '마포구 양화로16길 29, 5층' },
    lat: 37.5572,
    lng: 126.9236,
    walkMinutes: 3,
    meters: 240,
    departments: ['internal', 'gastro', 'endocrinology', 'familyMed'],
    checkupCenter: true,
    weekdayHours: '08:00–18:00',
    saturdayHours: '08:00–13:00',
  },
  {
    id: 'h_mapo_kidney',
    districtKey: DISTRICT_HONGDAE,
    name: {
      en: 'Mapo Kidney & Internal Medicine',
      ko: '마포 신장내과의원',
      ja: '麻浦腎臓内科',
      zh: '麻浦肾内科诊所',
    },
    address: { en: '61 Wausan-ro, Mapo-gu, 3F', ko: '마포구 와우산로 61, 3층' },
    lat: 37.5547,
    lng: 126.9268,
    walkMinutes: 6,
    meters: 480,
    departments: ['nephrology', 'internal'],
    checkupCenter: false,
    weekdayHours: '09:00–18:00',
    saturdayHours: '09:00–13:00',
  },
  {
    id: 'h_seogyo_heart',
    districtKey: DISTRICT_HONGDAE,
    name: {
      en: 'Seogyo Heart Clinic',
      ko: '서교 하트의원',
      ja: '西橋ハートクリニック',
      zh: '西桥心脏诊所',
    },
    address: { en: '12 Hongik-ro 3-gil, Mapo-gu, 4F', ko: '마포구 홍익로3길 12, 4층' },
    lat: 37.5555,
    lng: 126.9208,
    walkMinutes: 8,
    meters: 600,
    departments: ['cardiology', 'internal'],
    checkupCenter: false,
    weekdayHours: '09:30–18:30',
    saturdayHours: null,
  },
  {
    id: 'h_yeonnam_family',
    districtKey: DISTRICT_HONGDAE,
    name: {
      en: 'Yeonnam Family Medicine',
      ko: '연남 가정의학과의원',
      ja: '延南ファミリークリニック',
      zh: '延南家庭医学科诊所',
    },
    address: { en: '38 Donggyo-ro 25-gil, Mapo-gu, 2F', ko: '마포구 동교로25길 38, 2층' },
    lat: 37.56,
    lng: 126.923,
    walkMinutes: 10,
    meters: 800,
    departments: ['familyMed', 'endocrinology'],
    checkupCenter: false,
    weekdayHours: '09:00–19:00',
    saturdayHours: '09:00–14:00',
  },

  {
    id: 'h_gangnam_station_health',
    districtKey: DISTRICT_GANGNAM,
    name: {
      en: 'Gangnam Station Health Center',
      ko: '강남역 건강검진센터',
      ja: '江南駅健診センター',
      zh: '江南站体检中心',
    },
    address: { en: '390 Gangnam-daero, Gangnam-gu, 7F', ko: '강남구 강남대로 390, 7층' },
    lat: 37.4985,
    lng: 127.0275,
    walkMinutes: 3,
    meters: 220,
    departments: ALL,
    checkupCenter: true,
    weekdayHours: '07:00–17:00',
    saturdayHours: '07:00–12:00',
  },
  {
    id: 'h_yeoksam_endo',
    districtKey: DISTRICT_GANGNAM,
    name: {
      en: 'Yeoksam Diabetes & Thyroid Clinic',
      ko: '역삼 당뇨갑상선내과',
      ja: '駅三糖尿病・甲状腺内科',
      zh: '驿三糖尿病甲状腺内科',
    },
    address: { en: '14 Teheran-ro 2-gil, Gangnam-gu, 5F', ko: '강남구 테헤란로2길 14, 5층' },
    lat: 37.5003,
    lng: 127.0316,
    walkMinutes: 6,
    meters: 450,
    departments: ['endocrinology', 'internal'],
    checkupCenter: false,
    weekdayHours: '09:00–18:30',
    saturdayHours: '09:00–13:00',
  },
  {
    id: 'h_seocho_gi',
    districtKey: DISTRICT_GANGNAM,
    name: {
      en: 'Seocho Liver & GI Clinic',
      ko: '서초 간·소화기내과',
      ja: '瑞草肝臓・消化器内科',
      zh: '瑞草肝脏消化内科',
    },
    address: { en: '8 Seocho-daero 77-gil, Seocho-gu, 3F', ko: '서초구 서초대로77길 8, 3층' },
    lat: 37.4968,
    lng: 127.0262,
    walkMinutes: 7,
    meters: 520,
    departments: ['gastro', 'internal'],
    checkupCenter: false,
    weekdayHours: '08:30–18:00',
    saturdayHours: '08:30–13:00',
  },
  {
    id: 'h_nonhyeon_heart_kidney',
    districtKey: DISTRICT_GANGNAM,
    name: {
      en: 'Nonhyeon Heart & Kidney Clinic',
      ko: '논현 심장신장내과',
      ja: '論峴心臓・腎臓内科',
      zh: '论岘心肾内科',
    },
    address: { en: '21 Gangnam-daero 118-gil, Gangnam-gu, 4F', ko: '강남구 강남대로118길 21, 4층' },
    lat: 37.5018,
    lng: 127.0249,
    walkMinutes: 10,
    meters: 780,
    departments: ['cardiology', 'nephrology'],
    checkupCenter: false,
    weekdayHours: '09:00–18:00',
    saturdayHours: null,
  },
]

/**
 * A district's hospitals for one department: the ones that run it first, then the
 * rest, each by walking distance. The rest stay listed — a checkup follow-up often
 * starts at whichever internal medicine is nearest.
 */
export function hospitalsFor(districtKey: string, department: DepartmentId): Hospital[] {
  return HOSPITALS.filter((h) => h.districtKey === districtKey).sort(
    (a, b) =>
      Number(b.departments.includes(department)) - Number(a.departments.includes(department)) ||
      a.meters - b.meters,
  )
}
