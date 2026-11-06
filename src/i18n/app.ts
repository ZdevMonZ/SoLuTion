/**
 * The shell's own words: the browser tab, and the description a shared link
 * previews with.
 *
 * `index.html` keeps the English title and description for the first paint and for
 * anything that reads the page without running it; the shell swaps in these once the
 * language is known.
 */
import type { Tables } from './index'

const en = {
  documentTitle: 'SoLuTion — skin reading',
  description:
    'SoLuTion reads your skin from your webcam, explains what it finds, and shows which Seoul clinics treat it.',
}

export const APP: Tables<typeof en> = {
  en,
  ko: {
    documentTitle: 'SoLuTion — 피부 진단',
    description:
      'SoLuTion은 웹캠으로 피부를 살펴보고 발견한 내용을 설명해 드려요. 서울 어느 병원에서 시술받을 수 있는지도 알려 드려요.',
  },
  ja: {
    documentTitle: 'SoLuTion — 肌診断',
    description:
      'SoLuTionはウェブカメラで肌を読み取り、わかったことを説明します。その悩みに対応するソウルのクリニックもご案内します。',
  },
  zh: {
    documentTitle: 'SoLuTion — 皮肤检测',
    description: 'SoLuTion 通过摄像头检测您的皮肤，解释它的发现，并告诉您首尔哪些诊所可以处理。',
  },
}
