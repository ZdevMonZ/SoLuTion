/**
 * Screen 14, the community feed — the Android app's `CommunityStrings`, with its
 * wording.
 *
 * A seeded post's author, meta line, body and tags are content: they come from the
 * catalogue in the page's language. A post written here keeps its own words. Only
 * the chrome around them lives here — which includes the byline on a post written
 * here, since "You · Just now" is the page speaking, not the writer.
 */
import type { Tables } from './index'

const en = {
  title: 'Community',
  /**
   * Under the title. The feed is served in the page's language, so each table names
   * its own — "Posts in English" is the English case of that, not a fixed claim.
   */
  subtitle: (count: number) => `Posts in English · ${count} shown`,
  /** The button that opens the composer. The "+" before it is the screen's. */
  writePost: 'Write a post',
  /** Heading over the filter column on a laptop; a phone shows the chips alone. */
  filtersHeading: 'FILTERS',
  filterAll: 'All posts',
  filterVerified: 'Verified only',
  /** Badge on a post written after a visit booked through SoLuTion. */
  verifiedBadge: 'VERIFIED VISIT',
  /**
   * Caption in the corner of a seeded post's picture well. The well is a labelled
   * stand-in, never a real photo, and the label is what says so.
   */
  photoPlaceholder: 'PHOTO PLACEHOLDER',
  empty: 'No posts under this filter yet. Yours would be the first.',
  /** Heading of the key that explains the badge. */
  verifiedTitle: 'Verified Visit',
  verifiedBody: 'Shown on posts from users who booked that clinic through SoLuTion.',
  /** Author line on a post written here. */
  you: 'You',
  /**
   * Its avatar disc. English takes the letters of "You"; the other three print their
   * own word for oneself — the top bar's signed-in disc in the app — since a pair of
   * Latin initials means nothing on a Korean, Japanese or Chinese screen.
   */
  youInitials: 'YO',
  /** Its meta line, where a seeded post has country, age and district. */
  justNow: 'Just now',
}

export const COMMUNITY: Tables<typeof en> = {
  en,
  ko: {
    title: '커뮤니티',
    subtitle: (count) => `한국어 게시글 · ${count}개 표시 중`,
    writePost: '글쓰기',
    filtersHeading: '필터',
    filterAll: '전체 글',
    filterVerified: '방문 인증만',
    verifiedBadge: '방문 인증',
    photoPlaceholder: '사진 자리',
    empty: '이 필터에는 아직 글이 없어요. 첫 글을 남겨 보세요.',
    verifiedTitle: '방문 인증',
    verifiedBody: 'SoLuTion으로 해당 병원을 예약한 사용자의 글에 표시돼요.',
    you: '나',
    youInitials: '나',
    justNow: '방금 전',
  },
  ja: {
    title: 'コミュニティ',
    subtitle: (count) => `日本語の投稿 · ${count}件を表示中`,
    writePost: '投稿を書く',
    filtersHeading: '絞り込み',
    filterAll: 'すべて',
    filterVerified: '来院認証のみ',
    verifiedBadge: '来院認証',
    photoPlaceholder: '写真スペース',
    empty: 'この条件の投稿はまだありません。最初の投稿をどうぞ。',
    verifiedTitle: '来院認証',
    verifiedBody: 'SoLuTion経由でそのクリニックを予約したユーザーの投稿に表示されます。',
    you: '私',
    youInitials: '私',
    justNow: 'たった今',
  },
  zh: {
    title: '社区',
    subtitle: (count) => `中文帖子 · 显示${count}条`,
    writePost: '发帖',
    filtersHeading: '筛选',
    filterAll: '全部',
    filterVerified: '仅认证',
    verifiedBadge: '到店认证',
    photoPlaceholder: '照片占位',
    empty: '该筛选下还没有帖子，来发第一条吧。',
    verifiedTitle: '到店认证',
    verifiedBody: '通过 SoLuTion 预约该诊所的用户，其帖子会显示此标识。',
    you: '我',
    youInitials: '我',
    justNow: '刚刚',
  },
}
