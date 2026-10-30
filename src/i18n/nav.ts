/**
 * The top bar — the Android app's `NavStrings` for the tabs and `CommonStrings` for
 * the rest, with their wording.
 *
 * The tabs share a phone's width four ways, so the CJK names stay as short as the
 * language allows rather than tracking the English word count.
 */
import type { Tables } from './index'

const en = {
  /** By the nav's own tab ids. */
  tabs: {
    home: 'Home',
    mylist: 'My List',
    community: 'Community',
    rewards: 'Rewards',
  },
  /** Spoken name of the wordmark, which leads back to the landing page. */
  homeLink: 'SoLuTion home',
  /**
   * The globe's spoken label, on a phone where it shows no words. `current` is the
   * language in force, named in its own script — the word its card in the picker
   * shows, so the two can be matched by ear.
   */
  languageButton: (current: string) => `Language: ${current}`,
  signUp: 'Sign up',
  /** Tooltip on the disc that replaces "Sign up". */
  signedIn: 'Signed in',
  /**
   * The disc itself. English takes the letters of "You"; the other three print their
   * own word for oneself, since Latin initials mean nothing on those screens.
   */
  initials: 'YO',
  /** The two-way switch beside the wordmark: which reading the site is doing. */
  modes: { skin: 'Skin check', health: 'Health checkup' },
  modesLabel: 'Reading mode',
}

export type NavTab = keyof typeof en.tabs

export const NAV: Tables<typeof en> = {
  en,
  ko: {
    tabs: { home: '홈', mylist: '내 목록', community: '커뮤니티', rewards: '리워드' },
    homeLink: 'SoLuTion 홈',
    languageButton: (current) => `언어: ${current}`,
    signUp: '회원가입',
    signedIn: '로그인됨',
    initials: '나',
    modes: { skin: '피부 진단', health: '건강검진 진단' },
    modesLabel: '진단 모드',
  },
  ja: {
    tabs: { home: 'ホーム', mylist: 'マイリスト', community: 'コミュニティ', rewards: 'リワード' },
    homeLink: 'SoLuTion ホーム',
    languageButton: (current) => `言語：${current}`,
    signUp: '新規登録',
    signedIn: 'ログイン中',
    initials: '私',
    modes: { skin: '肌診断', health: '健康診断' },
    modesLabel: '診断モード',
  },
  zh: {
    tabs: { home: '首页', mylist: '我的清单', community: '社区', rewards: '奖励' },
    homeLink: 'SoLuTion 首页',
    languageButton: (current) => `语言：${current}`,
    signUp: '注册',
    signedIn: '已登录',
    initials: '我',
    modes: { skin: '皮肤检测', health: '体检解读' },
    modesLabel: '检测模式',
  },
}
