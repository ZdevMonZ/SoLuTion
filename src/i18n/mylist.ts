/**
 * Screen 13, My list — the Android app's `MyListStrings`, with its wording.
 *
 * The two empty states stay separate sentences: either column can be empty while
 * the other is not, and naming the wrong card would send the reader to the wrong
 * screen.
 */
import type { Tables } from './index'

const en = {
  title: 'My list',
  /**
   * Where the list lives and what clears it. The saved ids are held in memory only
   * (the store persists the last reading, nothing else), so a reload is what clears
   * them — not clearing browser data, which an earlier line claimed.
   */
  subtitle: 'Kept in this browser tab only. Reloading or closing the page clears this list.',
  treatmentsTitle: 'Interested treatments',
  clinicsTitle: 'Interested clinics',
  /** The quiet links at the end of each column's heading line. */
  browseMore: 'Browse more',
  comparePrices: 'Compare prices',
  emptyTreatments: 'Nothing saved yet. Use the bookmark on any treatment card.',
  emptyClinics: 'Nothing saved yet. Use the bookmark on any clinic card.',
  /**
   * The posts pill on each card. A function because only English inflects the noun
   * for a count of one, and the CJK counters sit on the other side of the number.
   */
  posts: (count: number) => (count === 1 ? '1 post' : `${count} posts`),
  /** The bookmark button's name for a screen reader; it shows only the icon. */
  remove: (name: string) => `Remove ${name}`,
}

export const MY_LIST: Tables<typeof en> = {
  en,
  ko: {
    title: '내 목록',
    subtitle: '이 브라우저 탭에만 보관돼요. 페이지를 새로 고치거나 닫으면 목록도 지워져요.',
    treatmentsTitle: '관심 시술',
    clinicsTitle: '관심 병원',
    browseMore: '더 둘러보기',
    comparePrices: '가격 비교',
    emptyTreatments: '아직 저장한 시술이 없어요. 시술 카드의 북마크를 눌러 보세요.',
    emptyClinics: '아직 저장한 병원이 없어요. 병원 카드의 북마크를 눌러 보세요.',
    posts: (count) => `글 ${count}개`,
    remove: (name) => `${name} 삭제`,
  },
  ja: {
    title: 'マイリスト',
    subtitle:
      'このブラウザのタブにだけ保存されます。ページを再読み込みするか閉じると、リストは消えます。',
    treatmentsTitle: '気になる施術',
    clinicsTitle: '気になるクリニック',
    browseMore: 'もっと見る',
    comparePrices: '料金を比較',
    emptyTreatments: 'まだ何も保存していません。施術カードのブックマークから保存できます。',
    emptyClinics: 'まだ何も保存していません。クリニックカードのブックマークから保存できます。',
    posts: (count) => `投稿${count}件`,
    remove: (name) => `${name}を削除`,
  },
  zh: {
    title: '我的清单',
    subtitle: '仅保存在当前浏览器标签页中，刷新或关闭页面后清单会清空。',
    treatmentsTitle: '感兴趣的项目',
    clinicsTitle: '感兴趣的诊所',
    browseMore: '浏览更多',
    comparePrices: '比较价格',
    emptyTreatments: '还没有收藏。点按任意项目卡片上的书签即可保存。',
    emptyClinics: '还没有收藏。点按任意诊所卡片上的书签即可保存。',
    posts: (count) => `${count}条帖子`,
    remove: (name) => `移除${name}`,
  },
}
