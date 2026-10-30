/**
 * Screen 08's own copy — the Android app's `TreatmentsStrings`, less what the shared
 * `UI` table already carries (the title, TOP MATCH, the two stat labels, the price
 * note and the matched subtitle).
 *
 * Anything that names a treatment or a district is a function, because the four
 * languages do not agree on where the name goes, and Korean picks its particle per
 * name.
 */
import type { Tables } from './index'
import { object } from './josa'

const en = {
  /** The first filter chip. */
  all: 'All',
  /** The line under the title without a reading: the catalogue, unranked. */
  browseSubtitle: (count: number) => `The full list · ${count} treatments`,
  /** Either line, then which district's prices these are: each prices differently. */
  inDistrict: (line: string, district: string) => `${line} · staying in ${district}`,
  /**
   * The small line under a price quoted per unit, "for full face". The detail
   * screen's price cell reads it from here too. Two bases already carry their own
   * preposition ("per visit", "with extraction") and stand as they are.
   */
  priceBasis: (basis: string) => (/^(per|with) /.test(basis) ? basis : `for ${basis}`),
  /** The card foot's link. Words only: the screen draws the arrow. */
  details: 'Details',
  /** The bookmark's spoken name: the button itself shows only an icon. */
  save: (name: string) => `Save ${name} to My List`,
  remove: (name: string) => `Remove ${name} from My List`,
}

export const TREATMENT_LIST: Tables<typeof en> = {
  en,
  ko: {
    all: '전체',
    browseSubtitle: (count) => `전체 목록 · 시술 ${count}가지`,
    inDistrict: (line, district) => `${line} · ${district}에 머무는 중`,
    // A noun phrase rather than 기준: one basis, "1회 방문 기준", already ends in it.
    priceBasis: (basis) => `${basis} 가격`,
    details: '자세히',
    save: (name) => `${object(name)} 내 목록에 저장`,
    remove: (name) => `${object(name)} 내 목록에서 삭제`,
  },
  ja: {
    all: 'すべて',
    browseSubtitle: (count) => `すべての施術 · ${count}件`,
    inDistrict: (line, district) => `${line} · ${district}に滞在中`,
    priceBasis: (basis) => `${basis}の料金`,
    details: '詳細',
    save: (name) => `${name}をマイリストに保存`,
    remove: (name) => `${name}をマイリストから削除`,
  },
  zh: {
    all: '全部',
    browseSubtitle: (count) => `全部项目 · 共${count}项`,
    inDistrict: (line, district) => `${line} · 住在${district}`,
    priceBasis: (basis) => `${basis}价格`,
    details: '详情',
    save: (name) => `将${name}保存到我的清单`,
    remove: (name) => `从我的清单中移除${name}`,
  },
}
