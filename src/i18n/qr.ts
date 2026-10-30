/**
 * Screen 17, the redemption code — the Android app's `QrStrings`, with its wording.
 *
 * The reward's name, description and expiry are content and come from the
 * catalogue; the kind line is shared with the store, in `REWARD_KIND`. Only the
 * frame around them lives here.
 */
import type { Tables } from './index'

const en = {
  /** The back link, named for where it goes. */
  back: 'Rewards',
  /** What a screen reader says for the drawn code. */
  codeDescription: 'Redemption code, for the clinic front desk',
  /** The countdown pill. `expiry` is the catalogue's already-localised duration. */
  expiresIn: (expiry: string) => `Expires in ${expiry}`,
  howToTitle: 'Show this to clinic staff',
  howToSteps: [
    'Open this page at the front desk before your consultation starts.',
    'Staff scan the code once; it stops working straight after.',
    'Points are deducted only when the scan succeeds.',
  ],
  /** The code is drawn, not issued, and the screen says so. */
  drawnNote: 'Prototype — this code is drawn, not issued, so no scanner will read it.',
}

export const QR: Tables<typeof en> = {
  en,
  ko: {
    back: '리워드',
    codeDescription: '병원 접수처에 보여 줄 교환 코드',
    expiresIn: (expiry) => `${expiry} 후 만료`,
    howToTitle: '병원 직원에게 보여 주세요',
    howToSteps: [
      '상담을 시작하기 전에 접수처에서 이 화면을 열어 주세요.',
      '직원이 코드를 한 번 스캔하면 그 즉시 사용 처리됩니다.',
      '스캔에 성공한 경우에만 포인트가 차감됩니다.',
    ],
    drawnNote:
      '프로토타입 — 이 코드는 발급된 것이 아니라 그려 넣은 것이라 스캐너로 읽히지 않습니다.',
  },
  ja: {
    back: 'リワード',
    codeDescription: 'クリニック受付で提示する引き換えコード',
    expiresIn: (expiry) => `${expiry}後に期限切れ`,
    howToTitle: 'クリニックのスタッフに提示してください',
    howToSteps: [
      'カウンセリングが始まる前に、受付でこの画面を開いてください。',
      'スタッフがコードを一度読み取ると、その時点で無効になります。',
      '読み取りに成功した場合のみポイントが差し引かれます。',
    ],
    drawnNote:
      'プロトタイプ — このコードは発行されたものではなく描画されたものなので、スキャナーでは読み取れません。',
  },
  zh: {
    back: '奖励',
    codeDescription: '兑换码，供诊所前台扫描',
    expiresIn: (expiry) => `${expiry}后到期`,
    howToTitle: '请出示给诊所工作人员',
    howToSteps: [
      '面诊开始前，请在前台打开此页面。',
      '工作人员扫码一次后，该码随即失效。',
      '只有扫码成功后才会扣除积分。',
    ],
    drawnNote: '原型：此码为绘制而非正式签发，扫码器无法识别。',
  },
}
