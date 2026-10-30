/**
 * Screen 10's chrome — the Android app's `ClinicsStrings`.
 *
 * Clinic names, notes, walking distances and district names are catalogue content.
 * Anything that names one is a function, because the languages do not agree on
 * where the name goes ("Clinics in Myeongdong" against "明洞のクリニック"), and
 * Korean picks its object particle per name.
 */
import type { Tables } from './index'
import { object } from './josa'

const en = {
  /** The headline, and the booking screen's back link to this one. */
  title: (district: string) => `Clinics in ${district}`,
  /** Under the headline: which treatment the prices are for, and the order. */
  subtitle: (treatment: string) => `${treatment} · price per session, lowest first`,
  /** The glass label floating on the map. */
  mapLabel: (district: string) => `${district} · 1 km radius`,
  /** The map frame's name, for a screen reader. */
  mapTitle: (district: string) => `Clinic map — ${district}`,
  /** The bookmark's spoken name: the button itself shows only an icon. */
  save: (clinic: string) => `Save ${clinic} to My List`,
  remove: (clinic: string) => `Remove ${clinic} from My List`,
  /** The tag on the cheapest card. */
  lowest: 'LOWEST',
  sampleNote: 'Clinic names and prices are sample data for this prototype.',
}

export const CLINIC_LIST: Tables<typeof en> = {
  en,
  ko: {
    title: (district) => `${district} 지역 병원`,
    subtitle: (treatment) => `${treatment} · 1회 가격, 낮은 순`,
    mapLabel: (district) => `${district} · 반경 1km`,
    mapTitle: (district) => `${district} 병원 지도`,
    save: (clinic) => `${object(clinic)} 내 목록에 저장`,
    remove: (clinic) => `${object(clinic)} 내 목록에서 삭제`,
    lowest: '최저가',
    sampleNote: '병원 이름과 가격은 프로토타입용 예시 데이터입니다.',
  },
  ja: {
    title: (district) => `${district}のクリニック`,
    subtitle: (treatment) => `${treatment} · 1回あたりの料金、安い順`,
    mapLabel: (district) => `${district} · 半径1km`,
    mapTitle: (district) => `${district}のクリニック地図`,
    save: (clinic) => `${clinic}をマイリストに保存`,
    remove: (clinic) => `${clinic}をマイリストから削除`,
    lowest: '最安値',
    sampleNote: 'クリニック名と料金は、このプロトタイプ用のサンプルデータです。',
  },
  zh: {
    title: (district) => `${district}的诊所`,
    subtitle: (treatment) => `${treatment} · 单次价格，由低到高`,
    mapLabel: (district) => `${district} · 半径1公里`,
    mapTitle: (district) => `${district}诊所地图`,
    save: (clinic) => `将${clinic}保存到我的清单`,
    remove: (clinic) => `从我的清单中移除${clinic}`,
    lowest: '最低价',
    sampleNote: '诊所名称和价格均为本原型的示例数据。',
  },
}
