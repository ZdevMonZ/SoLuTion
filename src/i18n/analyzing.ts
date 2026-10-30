/**
 * 05 Analyzing — the Android app's `AnalyzingStrings`, with its wording.
 *
 * The footnote is the web's own: the app deletes the photo from the phone, the web
 * discards the frame in the browser, and each is true only of itself.
 */
import type { Tables } from './index'

const en = {
  title: 'Reading your skin',
  /**
   * The captions the screen rotates through as the bar climbs. Each gets an equal
   * share of the bar, so the count is free — but every language should tell the
   * same four steps.
   */
  steps: [
    'Mapping pore density',
    'Reading pigment spread',
    'Comparing texture and firmness',
    'Checking against clinical ranges',
  ],
  /** Standing reassurance at the foot of the screen. */
  footnote:
    'The captured frame is processed in your browser and discarded when the reading finishes.',
}

export const ANALYZING: Tables<typeof en> = {
  en,
  ko: {
    title: '피부를 분석하고 있어요',
    steps: [
      '모공 밀도를 확인하고 있어요',
      '색소 분포를 살펴보고 있어요',
      '탄력과 결을 비교하고 있어요',
      // "Checking against", not a second 비교: 대조 is the 照らし合わせ / 对照 of
      // the other two languages.
      '임상 기준과 대조하고 있어요',
    ],
    footnote: '촬영한 사진은 브라우저 안에서 처리되고, 분석이 끝나면 삭제돼요.',
  },
  ja: {
    title: '肌を分析しています',
    // Firmness is ハリ, as the reading's own sentences say it; 弾力 would be the
    // elasticity a still photo cannot show.
    steps: [
      '毛穴の密度を測っています',
      '色素の広がりを見ています',
      'キメとハリを比べています',
      '臨床基準と照らし合わせています',
    ],
    footnote: '撮影した写真はブラウザの中で処理され、分析が終わると破棄されます。',
  },
  zh: {
    title: '正在分析肌肤',
    steps: ['正在测量毛孔密度', '正在读取色素分布', '正在比较肤质与紧致度', '正在对照临床标准'],
    footnote: '拍摄的画面在您的浏览器中处理，分析结束后即被丢弃。',
  },
}
