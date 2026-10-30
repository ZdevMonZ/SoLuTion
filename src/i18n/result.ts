/**
 * 06 Result — the frame around the reading: the Android app's `ResultStrings`, plus
 * what only the web has (the list's heading and intro, the PDF button, the note
 * under the captured frame).
 *
 * The reading's own sentences are not here. The headline, the cohort line, each
 * row's sentence, the capture caveat and the skin-tone card are derived from the
 * stored numbers by `data/strings.ts`; the score plate's label, the row score and
 * the two actions under the list are its shared `UI` table's.
 */
import type { Tables } from './index'

/** How the English heading opens: "Seven readings". Past eight, the numeral. */
const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight']

/** 七, as the Chinese landing page counts the same seven readings. Past ten, the numeral. */
const ZH_NUMERALS = ['零', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十']

const en = {
  /** The guard's copy, for a stray navigation that lands here without a reading. */
  emptyTitle: 'No reading yet.',
  emptyBody: 'Take one and this page fills in.',
  emptyCta: 'Start Diagnosis',
  /** The frame this reading came from, and what becomes of it. */
  frameAlt: 'The frame this reading was taken from',
  frameNote: 'Read in your browser. It is never uploaded, and it goes when this tab does.',
  /** "Seven readings, in order of what to look at first." */
  rowsTitle: (count: number) =>
    `${COUNT_WORDS[count] ?? String(count)} reading${count === 1 ? '' : 's'}, in order of what to look at first.`,
  rowsIntro:
    'A low reading is not a diagnosis. Each row scores out of 100 the same way the headline does — higher is better, so a short bar is the one to look at first, and nothing here is an alarm.',
  /** The browser's own print dialog is what saves it. */
  savePdf: 'Save as PDF',
  /** Under a row's bar, opposite its score: where the row sits in the order. */
  priority: (rank: number) => `Priority ${rank}`,
}

export const RESULT: Tables<typeof en> = {
  en,
  ko: {
    emptyTitle: '아직 진단 결과가 없어요.',
    emptyBody: '진단을 받으면 이 페이지가 채워져요.',
    emptyCta: '진단 시작하기',
    frameAlt: '이번 결과의 바탕이 된 사진',
    frameNote: '브라우저 안에서 분석했어요. 어디에도 업로드되지 않고, 이 탭을 닫으면 함께 사라져요.',
    rowsTitle: (count) => `${count}가지 지표, 먼저 살펴볼 순서대로.`,
    // "The headline" is the score dial; the translations name it by its printed label,
    // held together by a no-break space so a line never splits it.
    rowsIntro:
      '낮은 점수가 곧 의학적 진단은 아니에요. 각 항목은 SKIN SCORE와 같은 방식으로 100점 만점이고, 높을수록 좋아요. 그러니 막대가 짧은 항목부터 살펴보면 되고, 여기 있는 어떤 것도 위험 신호는 아니에요.',
    savePdf: 'PDF로 저장',
    priority: (rank) => `우선순위 ${rank}`,
  },
  ja: {
    emptyTitle: 'まだ診断結果がありません。',
    emptyBody: '診断を受けると、このページに結果が表示されます。',
    emptyCta: '診断をはじめる',
    frameAlt: 'この結果の元になった写真',
    frameNote:
      'ブラウザの中で読み取りました。アップロードされることはなく、このタブを閉じると消えます。',
    rowsTitle: (count) => `${count < 10 ? `${count}つ` : `${count}個`}の指標を、先に見ておきたい順に。`,
    rowsIntro:
      '低いスコアは医学的な診断ではありません。各項目もSKIN SCOREと同じく100点満点で、高いほど良好です。バーが短い項目から見ていけばよく、どれも警告ではありません。',
    savePdf: 'PDFで保存',
    priority: (rank) => `優先度 ${rank}`,
  },
  zh: {
    emptyTitle: '还没有检测结果。',
    emptyBody: '完成一次检测，这里就会显示结果。',
    emptyCta: '开始检测',
    frameAlt: '本次结果所用的画面',
    frameNote: '只在您的浏览器中读取，从不上传，关闭这个标签页后就会消失。',
    rowsTitle: (count) => `${ZH_NUMERALS[count] ?? String(count)}项指标，按优先查看的顺序排列。`,
    rowsIntro:
      '低分并不是诊断。每一项都和 SKIN SCORE 一样以100分为满分，分数越高越好，所以条形越短的项越值得先看，这里的任何一项都不是警报。',
    savePdf: '保存为 PDF',
    priority: (rank) => `优先级 ${rank}`,
  },
}
