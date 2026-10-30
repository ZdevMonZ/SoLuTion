/**
 * Every sentence the reading is described with, in the page's language.
 *
 * The web copy of the Android app's `ui/i18n/` tables, kept in the same shape: the
 * result model carries numbers only, and each sentence is rendered from those
 * numbers at display time rather than baked into the reading. That is what lets a
 * stored report be re-read later without freezing the wording it was taken with —
 * or the language: switch the page and the same reading reads in the new one. It
 * is also why the copy lives here and not in the screens.
 *
 * Screens take it from `useStrings()`, whose members keep the names and signatures
 * this file used to export one by one. Each section below is a `Tables<T>`: every
 * language required, each typed by the English one, so a missing sentence is a
 * compile error rather than a blank label. A sentence assembled from runtime words
 * is a whole function per language, never one English template with slots — the
 * four languages put the pieces in different orders, and Korean picks its
 * particles from the word in front of them (`i18n/josa.ts`).
 */
import type {
  AgeBand,
  AnalysisNotice,
  CaptureRejection,
  CategoryResult,
  Gender,
  SeverityLevel,
  SkinAnalysisResult,
  SkinCategory,
} from '../analysis/types'
import { focusCategories } from '../analysis/types'
import type { Pitch, Suits } from '../analysis/ranking'
import { PHOTOTYPES, type FitzpatrickType } from '../analysis/phototype'
import { sunReactionFor } from './fitzpatrick'
import { useCopy, type Lang, type Tables } from '../i18n'
import { joinAnd as joinAndKo, topic } from '../i18n/josa'

// --- Enum labels (EnumStrings.kt) ---

/**
 * Title case in English because the design draws these as chip labels; prose that
 * needs them mid-sentence recases its own copy. LAXITY reads as sagging in every
 * language (처짐 / たるみ / 松弛), never as elasticity: a photograph shows
 * slackening, not how skin springs back.
 */
const CATEGORY: Tables<Record<SkinCategory, string>> = {
  en: {
    PORES: 'Pores',
    LAXITY: 'Laxity',
    WRINKLES: 'Wrinkles',
    ACNE: 'Acne',
    PIGMENT: 'Pigmentation',
    REDNESS: 'Redness',
    BALANCE: 'Balance',
  },
  ko: {
    PORES: '모공',
    LAXITY: '처짐',
    WRINKLES: '주름',
    ACNE: '여드름',
    PIGMENT: '색소',
    REDNESS: '홍조',
    BALANCE: '좌우 균형',
  },
  ja: {
    PORES: '毛穴',
    LAXITY: 'たるみ',
    WRINKLES: 'しわ',
    ACNE: 'ニキビ',
    PIGMENT: '色素',
    REDNESS: '赤み',
    BALANCE: '左右バランス',
  },
  zh: {
    PORES: '毛孔',
    LAXITY: '松弛',
    WRINKLES: '皱纹',
    ACNE: '痘痘',
    PIGMENT: '色素',
    REDNESS: '泛红',
    BALANCE: '左右平衡',
  },
}

/**
 * Reassuring, never clinical: the worst rung says "look here first", not
 * "something is wrong".
 */
const LEVEL: Tables<Record<SeverityLevel, string>> = {
  en: { EASE: 'Comfortable', NORMAL: 'Steady', ATTENTION: 'Needs care', FOCUS: 'Focus first' },
  ko: { EASE: '여유', NORMAL: '보통', ATTENTION: '관리 필요', FOCUS: '집중 관리' },
  ja: { EASE: '良好', NORMAL: '安定', ATTENTION: '要ケア', FOCUS: '重点ケア' },
  zh: { EASE: '良好', NORMAL: '平稳', ATTENTION: '需护理', FOCUS: '优先护理' },
}

/**
 * The band, not an age. Each language writes the span the way its own readers do
 * ("Under 20" against 10대 / 10代), so no shared numeric form would work.
 */
const AGE_BAND: Tables<Record<AgeBand, string>> = {
  en: { TEENS: 'Under 20', TWENTIES: '20s', THIRTIES: '30s', FORTIES: '40s', FIFTIES_PLUS: '50+' },
  ko: { TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES_PLUS: '50대 이상' },
  ja: { TEENS: '10代', TWENTIES: '20代', THIRTIES: '30代', FORTIES: '40代', FIFTIES_PLUS: '50代以上' },
  zh: {
    TEENS: '20岁以下',
    TWENTIES: '20多岁',
    THIRTIES: '30多岁',
    FORTIES: '40多岁',
    FIFTIES_PLUS: '50岁以上',
  },
}

/** OTHER declines the question rather than naming a third option. */
const GENDER: Tables<Record<Gender, string>> = {
  en: { FEMALE: 'Female', MALE: 'Male', OTHER: 'Prefer not to say' },
  ko: { FEMALE: '여성', MALE: '남성', OTHER: '선택 안 함' },
  ja: { FEMALE: '女性', MALE: '男性', OTHER: '回答しない' },
  zh: { FEMALE: '女性', MALE: '男性', OTHER: '不便透露' },
}

type ClinicBadge = 'AVAILABLE' | 'POPULAR' | 'BUSY'

/** Capitals in English, as the design sets the chip; CJK has no case and reads as written. */
const CLINIC_BADGE: Tables<Record<ClinicBadge, string>> = {
  en: { AVAILABLE: 'BOOKABLE', POPULAR: 'POPULAR', BUSY: 'BUSY' },
  ko: { AVAILABLE: '예약 가능', POPULAR: '인기', BUSY: '대기 많음' },
  ja: { AVAILABLE: '予約可', POPULAR: '人気', BUSY: '混雑' },
  zh: { AVAILABLE: '可预约', POPULAR: '热门', BUSY: '繁忙' },
}

// --- Headline and cohort line (AnalysisStrings.kt) ---

/** "pores and pigmentation", "wrinkles, acne and laxity". */
const joinAndEn = (words: string[]): string => {
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]
  if (words.length === 2) return `${words[0]} and ${words[1]}`
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
}

/** "毛穴と色素"; three or more are set with the enumeration comma, "毛穴、色素、赤み". */
const joinAndJa = (words: string[]): string =>
  words.length === 2 ? words.join('と') : words.join('、')

/** "毛孔和色素"; three or more comma all but the last pair, "毛孔、色素和泛红". */
const joinAndZh = (words: string[]): string =>
  words.length <= 2
    ? words.join('和')
    : `${words.slice(0, -1).join('、')}和${words[words.length - 1]}`

const sentenceCase = (phrase: string): string =>
  phrase.charAt(0).toUpperCase() + phrase.slice(1).toLowerCase()

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** "2026.09.05" — how the app stamps a date in Korean, Japanese and Chinese. */
const dotted = (at: Date): string =>
  [at.getFullYear(), at.getMonth() + 1, at.getDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('.')

const READING_EN = {
  /** Shown when nothing reached ATTENTION. */
  healthy: 'Healthy overall. Nothing needs attention right now.',
  /**
   * `names` are the focus categories' labels, most urgent first. The design writes
   * them as prose here, not as the chip labels they are elsewhere, so the joined
   * phrase is recased to open the sentence.
   */
  focus: (names: string[]) =>
    `Healthy overall. ${sentenceCase(joinAndEn(names))} ${names.length === 1 ? 'is' : 'are'} worth attention.`,
  /**
   * Who the average is taken over: "women in their 30s", or '' when the profile
   * names neither.
   *
   * Deliberately not built from the chip labels. Those are things the user taps
   * ("30s", "Prefer not to say"); this is a noun phrase inside a sentence, which
   * English cannot form from the chip alone. A gender the user did not state also
   * has no cohort of its own — the comparison then falls back to everyone in that
   * age band, which is a different word again.
   */
  cohort: (band: AgeBand | null, gender: Gender | null): string => {
    const people = gender === 'FEMALE' ? 'women' : gender === 'MALE' ? 'men' : 'people'
    if (band === null) return gender === null ? '' : people
    return {
      TEENS: `${people} under 20`,
      TWENTIES: `${people} in their 20s`,
      THIRTIES: `${people} in their 30s`,
      FORTIES: `${people} in their 40s`,
      FIFTIES_PLUS: `${people} aged 50 and over`,
    }[band]
  },
  /** The cohort line itself: `who` is the cohort above, `diff` the signed gap to it. */
  comparison: (who: string, diff: number): string => {
    const gap = Math.abs(diff)
    const unit = gap === 1 ? 'point' : 'points'
    const against = who === '' ? 'the average' : `the average for ${who}`
    if (diff === 0) return `The same as ${against}`
    return diff > 0 ? `${gap} ${unit} above ${against}` : `${gap} ${unit} below ${against}`
  },
  /** The stamp after the cohort line. */
  date: (at: Date): string => DATE_FORMAT.format(at),
}

const READING: Tables<typeof READING_EN> = {
  en: READING_EN,
  ko: {
    healthy: '전반적으로 건강한 편이에요. 지금 당장 신경 쓸 부분은 없어요.',
    // 와/과 is chosen by the join and 은/는 by the syllable the join ends on, so the
    // particle goes on after joining, never into the template.
    focus: (names) => `전반적으로 건강한 편이에요. ${topic(joinAndKo(names))} 눈여겨볼 만해요.`,
    cohort: (band, gender) => {
      const age =
        band &&
        { TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES_PLUS: '50대 이상' }[
          band
        ]
      const who = gender === 'FEMALE' ? '여성' : gender === 'MALE' ? '남성' : null
      return [age, who].filter(Boolean).join(' ')
    },
    comparison: (who, diff) => {
      const against = who === '' ? '' : `${who} `
      const gap = Math.abs(diff)
      if (diff === 0) return `${against}평균과 같아요`
      return diff > 0 ? `${against}평균보다 ${gap}점 높아요` : `${against}평균보다 ${gap}점 낮아요`
    },
    date: dotted,
  },
  ja: {
    healthy: '全体的に健康的な状態です。今のところ、特に気になる点はありません。',
    focus: (names) => `全体的に健康的ですが、${joinAndJa(names)}は注目しておきたいポイントです。`,
    cohort: (band, gender) => {
      const age =
        band &&
        { TEENS: '10代', TWENTIES: '20代', THIRTIES: '30代', FORTIES: '40代', FIFTIES_PLUS: '50代以上' }[
          band
        ]
      const who = gender === 'FEMALE' ? '女性' : gender === 'MALE' ? '男性' : null
      return [age, who].filter(Boolean).join('')
    },
    comparison: (who, diff) => {
      const against = who === '' ? '' : `${who}の`
      const gap = Math.abs(diff)
      if (diff === 0) return `${against}平均と同じです`
      return diff > 0 ? `${against}平均より${gap}点高めです` : `${against}平均より${gap}点低めです`
    },
    date: dotted,
  },
  zh: {
    healthy: '整体状态健康，目前没有需要特别关注的地方。',
    focus: (names) => `整体状态健康，${joinAndZh(names)}值得多加关注。`,
    cohort: (band, gender) => {
      const age =
        band &&
        { TEENS: '20岁以下', TWENTIES: '20多岁', THIRTIES: '30多岁', FORTIES: '40多岁', FIFTIES_PLUS: '50岁以上' }[
          band
        ]
      // An age band alone needs a noun, as English says "people in their 30s":
      // 30多岁人群, not a bare 30多岁 in front of 平均.
      const who = gender === 'FEMALE' ? '女性' : gender === 'MALE' ? '男性' : age ? '人群' : null
      return [age, who].filter(Boolean).join('')
    },
    comparison: (who, diff) => {
      const gap = Math.abs(diff)
      if (diff === 0) return `与${who}平均持平`
      return diff > 0 ? `比${who}平均高${gap}分` : `比${who}平均低${gap}分`
    },
    date: dotted,
  },
}

// --- One line per category row ---

/**
 * The hedges are part of the sentence, at the same strength in every language: an
 * imbalance is "often lighting" and worth "another shot" before it means anything,
 * and the strongest rung still only says a doctor is worth seeing.
 */
const EXPLANATIONS: Tables<Record<SkinCategory, Record<SeverityLevel, string>>> = {
  en: {
    PORES: {
      EASE: 'Pores are barely visible and the surface is even.',
      NORMAL: 'A few pores show on the inner cheeks, nothing beyond that.',
      ATTENTION: 'Widened around the nose and inner cheeks, with more oil than average.',
      FOCUS: 'Pores are widened across the face and the surface reads as rough.',
    },
    LAXITY: {
      EASE: 'Jawline and cheeks are holding their line.',
      NORMAL: 'Jawline still defined. Cheeks are beginning to soften.',
      ATTENTION: 'Cheeks and jawline are starting to look heavier.',
      FOCUS: 'Slackening is noticeable, so firmness is the place to start.',
    },
    WRINKLES: {
      EASE: 'Faint expression lines at the eyes. Moisturiser is enough for now.',
      NORMAL: 'Fine lines are showing at the eyes and across the forehead.',
      ATTENTION: 'Lines are beginning to stay once the expression relaxes.',
      FOCUS: 'Lines on the forehead and around the eyes are clearly set.',
    },
    ACNE: {
      EASE: 'No inflammation. Slight congestion across the forehead.',
      NORMAL: 'Some redness, and marks left by past breakouts.',
      ATTENTION: 'Redness covers a wide area, so calming it comes first.',
      FOCUS: 'Inflamed breakouts in several places. Worth seeing a doctor.',
    },
    PIGMENT: {
      EASE: 'Tone is holding evenly.',
      NORMAL: 'Light spots here and there.',
      ATTENTION: 'Tone is uneven across the cheeks and cheekbones. Sun protection comes first.',
      FOCUS: 'Faint melasma and sun spots gather above the cheekbones. Sun protection comes first.',
    },
    REDNESS: {
      EASE: 'Very little redness, and the tone stays calm.',
      NORMAL: 'Light redness shows around the cheeks and nose.',
      ATTENTION: 'Redness has spread across the face, so calming it comes first.',
      FOCUS: 'Visible capillaries and redness that will not settle. Worth seeing a doctor.',
    },
    BALANCE: {
      EASE: 'Brightness and texture look even on both sides.',
      NORMAL:
        'A slight brightness difference between the two sides — usually just angle or lighting.',
      ATTENTION:
        'One side reads noticeably brighter or more shadowed than the other. Often lighting — worth another shot from a different angle before reading too much into it.',
      FOCUS:
        'If this same left-right difference shows up across several photos, it may reflect a real volume difference between the cheeks. Worth asking about filler at a consultation.',
    },
  },
  ko: {
    PORES: {
      EASE: '모공이 눈에 띄지 않고 결이 고른 편이에요.',
      NORMAL: '볼 안쪽 모공이 조금 보이지만 심하지 않아요.',
      ATTENTION: '코와 볼 안쪽 모공이 넓어져 있어요. 피지 분비가 많은 편이에요.',
      FOCUS: '모공이 전반적으로 넓어져 결이 거칠어 보여요.',
    },
    LAXITY: {
      EASE: '턱선과 볼이 또렷하게 유지되고 있어요.',
      NORMAL: '턱선은 아직 또렷해요. 볼 부위가 조금 처지기 시작했어요.',
      ATTENTION: '볼과 턱선이 무거워 보이기 시작하는 시기예요.',
      FOCUS: '처짐이 눈에 띄는 편이라 탄력부터 챙기는 게 좋아요.',
    },
    WRINKLES: {
      EASE: '눈가에 표정 주름이 옅게 보이는 정도, 지금은 보습으로 충분해요.',
      NORMAL: '눈가와 이마에 잔주름이 조금 보여요.',
      ATTENTION: '표정을 풀어도 남는 주름이 보이기 시작했어요.',
      FOCUS: '이마와 눈가의 주름이 뚜렷한 편이에요.',
    },
    ACNE: {
      EASE: '염증은 없고, 이마에 좁쌀 같은 결이 조금 있어요.',
      NORMAL: '부분적으로 붉은 기와 여드름 자국이 보여요.',
      ATTENTION: '붉은 기가 넓게 올라와 있어 진정이 먼저 필요해요.',
      FOCUS: '염증성 여드름이 여러 곳에 보여요. 의사와 상담해 보는 게 좋아요.',
    },
    PIGMENT: {
      EASE: '톤이 고르게 유지되고 있어요.',
      NORMAL: '군데군데 옅은 잡티가 보여요.',
      ATTENTION: '볼과 광대 쪽 톤이 고르지 않아요. 자외선 차단이 먼저예요.',
      FOCUS: '광대 위쪽에 옅은 기미와 잡티가 모여 있어요. 자외선 차단이 먼저예요.',
    },
    REDNESS: {
      EASE: '붉은 기가 거의 없고 톤이 차분해요.',
      NORMAL: '볼과 코 주변에 옅은 붉은 기가 보여요.',
      ATTENTION: '얼굴 전체에 붉은 기가 퍼져 있어 진정 관리가 먼저 필요해요.',
      FOCUS: '실핏줄이 두드러지고 붉은 기가 가라앉지 않아요. 의사와 상담해 보는 게 좋아요.',
    },
    BALANCE: {
      EASE: '좌우 밝기와 결이 고르게 보여요.',
      NORMAL: '좌우에 아주 약간의 밝기 차이가 있어요. 대부분 사진 각도나 조명 때문이에요.',
      ATTENTION:
        '한쪽이 다른 쪽보다 눈에 띄게 밝거나 그늘져 보여요. 조명 탓인 경우가 많으니, 너무 의미를 두기 전에 다른 각도에서 한 번 더 찍어 보세요.',
      FOCUS:
        '같은 좌우 차이가 여러 장의 사진에서 반복된다면 실제 양쪽 볼의 부피 차이일 수 있어요. 상담 때 필러에 대해 물어볼 만해요.',
    },
  },
  ja: {
    PORES: {
      EASE: '毛穴は目立たず、肌の表面は整っています。',
      NORMAL: '頬の内側に毛穴が少し見えますが、目立つほどではありません。',
      ATTENTION: '鼻と頬の内側の毛穴が広がり、皮脂も多めです。',
      FOCUS: '毛穴が全体に広がり、肌の表面が粗く見えます。',
    },
    LAXITY: {
      EASE: 'フェイスラインも頬も、輪郭がはっきりしています。',
      NORMAL: 'フェイスラインはまだはっきりしています。頬がゆるみ始めています。',
      ATTENTION: '頬とフェイスラインが重く見え始める時期です。',
      FOCUS: 'たるみが目立つため、ハリのケアから始めるのがおすすめです。',
    },
    WRINKLES: {
      EASE: '目もとに表情じわがうっすら見える程度で、今は保湿で十分です。',
      NORMAL: '目もとと額に小じわが少し見えます。',
      ATTENTION: '表情をゆるめても残るしわが出てきました。',
      FOCUS: '額と目もとのしわがはっきりしています。',
    },
    ACNE: {
      EASE: '炎症はなく、額にざらつきが少しあります。',
      NORMAL: '部分的に赤みとニキビ跡が見えます。',
      ATTENTION: '赤みが広く出ているので、まず鎮静が必要です。',
      FOCUS: '炎症性のニキビが数か所に見えます。一度、医師に診てもらうとよいでしょう。',
    },
    PIGMENT: {
      EASE: '肌のトーンは均一に保たれています。',
      NORMAL: 'ところどころに薄いシミが見えます。',
      ATTENTION: '頬と頬骨まわりのトーンが不均一です。まず紫外線対策から。',
      FOCUS: '頬骨の上に薄い肝斑やシミが集まっています。まず紫外線対策から。',
    },
    REDNESS: {
      EASE: '赤みはほとんどなく、トーンも落ち着いています。',
      NORMAL: '頬と鼻まわりに薄い赤みが見えます。',
      ATTENTION: '顔全体に赤みが広がっているので、まず鎮静が必要です。',
      FOCUS: '毛細血管が目立ち、赤みが引きません。一度、医師に診てもらうとよいでしょう。',
    },
    BALANCE: {
      EASE: '左右の明るさと質感が均一に見えます。',
      NORMAL: '左右にわずかな明るさの差があります。多くは角度や照明によるものです。',
      ATTENTION:
        '片側がもう片方よりはっきり明るいか、影になって見えます。照明によることが多いので、気にしすぎる前に、別の角度からもう一枚撮ってみてください。',
      FOCUS:
        'この左右差が複数の写真で繰り返し出る場合は、頬の実際のボリューム差の可能性があります。カウンセリングの際に、フィラーについて相談してみるのもよいでしょう。',
    },
  },
  zh: {
    PORES: {
      EASE: '毛孔不明显，肤质均匀。',
      NORMAL: '内侧脸颊有少许毛孔，但并不明显。',
      ATTENTION: '鼻翼和内侧脸颊毛孔变粗，出油也偏多。',
      FOCUS: '毛孔整体变粗，肤质看起来偏粗糙。',
    },
    LAXITY: {
      EASE: '下颌线和脸颊轮廓保持清晰。',
      NORMAL: '下颌线依然清晰，脸颊开始有些松弛。',
      ATTENTION: '脸颊和下颌线开始显得下沉。',
      FOCUS: '松弛较为明显，建议先从紧致开始护理。',
    },
    WRINKLES: {
      EASE: '眼周有淡淡的表情纹，目前做好保湿即可。',
      NORMAL: '眼周和额头有少许细纹。',
      ATTENTION: '开始出现表情放松后也不消失的纹路。',
      FOCUS: '额头和眼周的皱纹较为明显。',
    },
    ACNE: {
      EASE: '没有炎症，额头有轻微的毛孔堵塞。',
      NORMAL: '局部有泛红和痘印。',
      ATTENTION: '泛红范围较大，需要先做舒缓。',
      FOCUS: '多处可见炎症性痘痘，建议找医生面诊。',
    },
    PIGMENT: {
      EASE: '肤色保持均匀。',
      NORMAL: '个别位置有淡淡的斑点。',
      ATTENTION: '脸颊和颧骨区域肤色不均，先做好防晒。',
      FOCUS: '颧骨上方有淡淡的黄褐斑和斑点，先做好防晒。',
    },
    REDNESS: {
      EASE: '几乎没有泛红，肤色也很平稳。',
      NORMAL: '脸颊和鼻翼周围有淡淡的泛红。',
      ATTENTION: '泛红已经扩散到整个面部，需要先做舒缓护理。',
      FOCUS: '红血丝明显，泛红持续不退，建议找医生面诊。',
    },
    BALANCE: {
      EASE: '左右的明暗和质感看起来很均匀。',
      NORMAL: '左右有一点点明暗差异，大多是角度或光线造成的。',
      ATTENTION:
        '一侧看起来明显比另一侧更亮或更暗。这往往是光线造成的，先别过度解读，换个角度再拍一张看看。',
      FOCUS:
        '如果这种左右差异在多张照片里都反复出现，可能反映脸颊真实的容积差异。面诊时可以顺便咨询一下填充剂。',
    },
  },
}

/**
 * A row that did not come from the photograph says so, on the row.
 *
 * Only LAXITY has one. `laxityFromAge` returns a number chosen from the stated age
 * band and reads no pixels at all, which is invisible next to six rows that were
 * measured — and the row sits in the same ranked list, so it can be presented as
 * the thing to treat first on the strength of a birthday.
 */
const LAXITY_NOTE: Tables<string> = {
  en: 'Estimated from your age, not from this photo. A still frame cannot show how skin springs back.',
  ko: '사진이 아니라 나이대로 추정한 값이에요. 정지된 사진으로는 피부가 되돌아오는 탄력을 볼 수 없어요.',
  ja: 'この写真ではなく、年齢から推定した値です。静止画では、肌が元に戻る弾力までは分かりません。',
  zh: '此项根据您的年龄估算，并非来自这张照片。静态画面无法看出皮肤的回弹情况。',
}

// --- Skin tone (SkinToneStrings.kt, for analysis/phototype.ts) ---

/** The six types, lightest first: the order the question and the card both list them in. */
const TYPES: FitzpatrickType[] = PHOTOTYPES.map((p) => p.type)

/** "Burns mildly at first. Tans gradually and evenly." English and Korean end on ". ". */
const sentences = (...parts: string[]): string => parts.map((p) => `${p}.`).join(' ')
/** The same in Japanese and Chinese, whose full stop needs no space after it. */
const sentencesCjk = (...parts: string[]): string => parts.map((p) => `${p}。`).join('')

interface TypeWords {
  /** What an hour of midday sun does, unprotected — the first half of the type. */
  burn: string
  /** What is left a week later — the second half. */
  tan: string
  /** What the ITA° class with the same numeral looks like. */
  look: string
}

/**
 * One instrument, so one set of words: the form's question and the result card
 * have to name the six types the same way.
 *
 * English is the source data itself — the question's own table in
 * `data/fitzpatrick.ts` and the class names in `analysis/phototype.ts` — so there is
 * one English to edit. Korean says 빨갛게 익다 for a burn and 그을리다 for a tan:
 * the everyday 타다 covers both, and the two halves would read the same.
 */
const TYPE_WORDS: Tables<Record<FitzpatrickType, TypeWords>> = {
  en: Object.fromEntries(
    PHOTOTYPES.map(({ type, name }) => {
      const { burn, tan } = sunReactionFor(type)
      return [type, { burn, tan, look: name }]
    }),
  ) as Record<FitzpatrickType, TypeWords>,
  ko: {
    I: { burn: '늘 빨갛게 익고 따가워요', tan: '전혀 그을리지 않아요', look: '매우 밝은 톤' },
    II: { burn: '대체로 빨갛게 익어요', tan: '잘 그을리지 않고, 그을려도 조금이에요', look: '밝은 톤' },
    III: { burn: '처음엔 살짝 빨갛게 익어요', tan: '서서히 고르게 그을려요', look: '중간 톤' },
    IV: { burn: '거의 빨갛게 익지 않아요', tan: '쉽게 그을려요', look: '그을린 톤' },
    V: { burn: '아주 드물게 빨갛게 익어요', tan: '빠르고 짙게 그을려요', look: '갈색 톤' },
    VI: { burn: '전혀 빨갛게 익지 않아요', tan: '원래 피부색이 짙어요', look: '어두운 톤' },
  },
  ja: {
    I: { burn: 'いつも赤くなり、ひりひり痛む', tan: 'まったく黒くならない', look: 'とても明るい' },
    II: { burn: 'たいてい赤くなる', tan: '黒くなりにくく、なっても少しだけ', look: '明るい' },
    III: { burn: '最初は軽く赤くなる', tan: '徐々にむらなく黒くなる', look: '中間' },
    IV: { burn: 'めったに赤くならない', tan: '黒くなりやすい', look: '小麦色' },
    V: { burn: 'ごくまれにしか赤くならない', tan: 'すぐに濃く黒くなる', look: '褐色' },
    VI: { burn: 'まったく赤くならない', tan: 'もともと色が濃い', look: '濃い褐色' },
  },
  zh: {
    I: { burn: '总是晒伤，而且很疼', tan: '从不晒黑', look: '极浅' },
    II: { burn: '通常会晒伤', tan: '不易晒黑，只会稍微变黑', look: '浅色' },
    III: { burn: '起初会轻微晒伤', tan: '会逐渐均匀地晒黑', look: '中等' },
    IV: { burn: '很少晒伤', tan: '很容易晒黑', look: '小麦色' },
    V: { burn: '极少晒伤', tan: '很快就晒得很黑', look: '棕色' },
    VI: { burn: '从不晒伤', tan: '肤色本来就很深', look: '深色' },
  },
}

const SKIN_TONE_EN = {
  title: 'Skin tone',
  /** Heading over the type the user told us. */
  reported: 'You said',
  /** Heading over what the pixels said. */
  measured: 'This photo reads',
  question: 'After an hour of midday sun, unprotected, your skin:',
  questionHint: 'Optional. Fitzpatrick is a question about sun reaction — no camera can see it.',
  clear: 'Prefer not to say',
  unanswered: 'Not answered',
  /** Shown on the result card when the form question was walked past. */
  ask: 'You did not answer the sun-reaction question, so there is nothing to check the photo against. One tap fixes that:',
  /** Shown when the two agree, or sit one class apart. */
  agrees: 'The photo agrees with what you said.',
  near: 'One class apart — normal for room lighting.',
  /** Two or more classes apart. */
  differs:
    'Two or more classes apart. Lighting moves this reading more than skin does, so trust your own answer.',
  /** Always shown under the measured value. */
  caveat:
    'Measured as ITA°, an angle in a colour space — it reads the skin as lit, not as pigmented. Without a colour reference card in frame, the same face can read several classes lighter by a window than under a lamp.',
  unusable: 'The frame was too dark or too bright for a tone reading.',
  none: 'No tone reading — too little skin in the frame.',
  /** The skip path took no photo at all, so there was nothing to read. */
  noPhoto: 'No photo was taken, so there is no tone reading to compare against.',
  /** One rung by its numeral — the user's answer, or the class a photo fell in. */
  typeLabel: (type: FitzpatrickType) => `Type ${type}`,
  /**
   * What an ITA° class looks like. Printed beside a *measured* class only: a stated
   * Fitzpatrick type is about how skin burns and tans, which a colour name would
   * misdescribe.
   */
  className: (type: FitzpatrickType) => TYPE_WORDS.en[type].look,
  /** One answer on the form, beside its numeral: "Burns mildly at first. Tans gradually and evenly." */
  option: (type: FitzpatrickType) => sentences(TYPE_WORDS.en[type].burn, TYPE_WORDS.en[type].tan),
  /** The spoken name of a numeral-only chip. A bare "III" says nothing aloud. */
  optionDescription: (type: FitzpatrickType) =>
    sentences(`Type ${type}`, TYPE_WORDS.en[type].burn, TYPE_WORDS.en[type].tan),
  /**
   * The key under the card's numeral chips: "I always burns, painfully · II usually
   * burns · …". Lowercased in English only, where the burn opens a sentence elsewhere.
   */
  burnSummary: TYPES.map((t) => `${t} ${TYPE_WORDS.en[t].burn.toLowerCase()}`).join(' · '),
}

const SKIN_TONE: Tables<typeof SKIN_TONE_EN> = {
  en: SKIN_TONE_EN,
  ko: {
    title: '피부 톤',
    reported: '내 답변',
    measured: '이 사진의 측정값',
    question: '자외선 차단 없이 한낮의 햇볕을 한 시간 쬐면, 내 피부는:',
    questionHint:
      '선택 사항이에요. 피츠패트릭 유형은 햇볕에 피부가 어떻게 반응하는지 묻는 질문이라, 카메라로는 알 수 없어요.',
    clear: '선택 안 함',
    unanswered: '답하지 않음',
    // 한 번 is one word to a Korean reader; the no-break space keeps 한 off a line's end.
    ask: '햇볕 반응 질문에 답하지 않아서 사진과 비교할 기준이 없어요. 한 번만 누르면 돼요:',
    agrees: '사진 측정값이 내 답변과 같아요.',
    near: '한 단계 차이예요. 실내 조명에서는 흔한 차이예요.',
    differs:
      '두 단계 이상 차이가 나요. 이 측정값은 피부보다 조명에 더 크게 흔들리니, 직접 답한 쪽을 믿으세요.',
    caveat:
      'ITA°(색 공간 안의 각도)로 측정했어요. 색소가 아니라 빛을 받은 그대로의 피부를 읽기 때문에, 사진에 색상 기준 카드가 없으면 같은 얼굴도 램프 아래보다 창가에서 몇 단계 더 밝게 나올 수 있어요.',
    unusable: '사진이 너무 어둡거나 밝아서 톤을 측정하지 못했어요.',
    none: '톤 측정값이 없어요. 사진 속 피부가 너무 적어요.',
    noPhoto: '사진을 찍지 않아서 비교할 톤 측정값이 없어요.',
    typeLabel: (type) => `${type}형`,
    className: (type) => TYPE_WORDS.ko[type].look,
    option: (type) => sentences(TYPE_WORDS.ko[type].burn, TYPE_WORDS.ko[type].tan),
    optionDescription: (type) =>
      sentences(`${type}형`, TYPE_WORDS.ko[type].burn, TYPE_WORDS.ko[type].tan),
    burnSummary: TYPES.map((t) => `${t} ${TYPE_WORDS.ko[t].burn}`).join(' · '),
  },
  ja: {
    title: '肌のトーン',
    reported: 'あなたの回答',
    measured: 'この写真の測定値',
    question: '日焼け止めなしで真昼の日差しを1時間浴びると、あなたの肌は：',
    questionHint:
      '任意です。フィッツパトリック分類は日差しへの肌の反応を尋ねるもので、カメラには写りません。',
    clear: '回答しない',
    unanswered: '未回答',
    ask: '日差しへの反応の質問に回答していないため、写真と照らし合わせる基準がありません。ワンタップで回答できます：',
    agrees: '写真の測定値はあなたの回答と一致しています。',
    near: '1段階の差です。室内の照明ではよくあることです。',
    differs:
      '2段階以上の差があります。この測定値は肌そのものより照明で大きく変わるため、ご自身の回答を優先してください。',
    caveat:
      'ITA°（色空間上の角度）で測定しています。色素ではなく、光が当たった状態の肌を読み取るため、カラー基準カードが写っていなければ、同じ顔でもライトの下より窓辺のほうが数段階明るく出ることがあります。',
    unusable: '写真が暗すぎるか明るすぎたため、トーンを測定できませんでした。',
    none: 'トーンの測定値はありません。写っている肌が少なすぎます。',
    noPhoto: '写真を撮影していないため、比較できるトーンの測定値がありません。',
    typeLabel: (type) => `タイプ${type}`,
    className: (type) => TYPE_WORDS.ja[type].look,
    option: (type) => sentencesCjk(TYPE_WORDS.ja[type].burn, TYPE_WORDS.ja[type].tan),
    optionDescription: (type) =>
      sentencesCjk(`タイプ${type}`, TYPE_WORDS.ja[type].burn, TYPE_WORDS.ja[type].tan),
    burnSummary: TYPES.map((t) => `${t} ${TYPE_WORDS.ja[t].burn}`).join(' · '),
  },
  zh: {
    title: '肤色',
    reported: '您的回答',
    measured: '照片读数',
    question: '不做防晒、在正午阳光下晒一小时后，您的皮肤会：',
    // No ——: the page's Latin face draws it as two short dashes with a gap between.
    questionHint: '选填。菲茨帕特里克分型问的是皮肤对日晒的反应，摄像头看不到这一点。',
    clear: '不便透露',
    unanswered: '未回答',
    ask: '您没有回答日晒反应的问题，所以没有可以和照片对照的依据。点一下就能补上：',
    agrees: '照片读数与您的回答一致。',
    near: '相差一级，在室内光线下很常见。',
    differs: '相差两级或以上。光线对这个读数的影响比皮肤本身更大，请以您自己的回答为准。',
    caveat:
      '以 ITA°（色彩空间中的一个角度）测量，读取的是光照下呈现的皮肤，而不是色素本身。画面中没有色卡作参照时，同一张脸在窗边可能比在台灯下浅好几级。',
    unusable: '画面过暗或过亮，无法读取肤色。',
    none: '没有肤色读数：画面中的皮肤太少。',
    noPhoto: '没有拍照，所以没有可供对照的肤色读数。',
    typeLabel: (type) => `${type}型`,
    className: (type) => TYPE_WORDS.zh[type].look,
    option: (type) => sentencesCjk(TYPE_WORDS.zh[type].burn, TYPE_WORDS.zh[type].tan),
    optionDescription: (type) =>
      sentencesCjk(`${type}型`, TYPE_WORDS.zh[type].burn, TYPE_WORDS.zh[type].tan),
    burnSummary: TYPES.map((t) => `${t} ${TYPE_WORDS.zh[t].burn}`).join(' · '),
  },
}

// --- Capture caveats ---

/**
 * Each says what went wrong *and* what to do about it: the first four are worth a
 * retake, the last two explain why the numbers on screen are a sample. The guide is
 * an oval, not a circle, so every language names it as the capture screen does:
 * outline / 가이드라인 / 枠 / 框.
 */
const NOTICES: Tables<Record<AnalysisNotice, string>> = {
  en: {
    SMALL_FACE:
      'Your face sat small inside the outline, so this reading may be less accurate. Try again with your face filling the outline.',
    TOO_DARK:
      'The frame was dark, so the reading may come out lower than it should. Try again somewhere brighter.',
    TOO_BRIGHT:
      'Strong light washed the texture out. Move out of direct sunlight and take it again for a closer reading.',
    BLURRY:
      'The frame moved, so the texture was hard to read. Another try will be more accurate.',
    NO_FACE_FOUND:
      'No face was found in the frame, so this is a sample reading. Take another somewhere bright, with your face inside the outline.',
    NO_PHOTO: 'You continued without a capture, so this is a sample reading.',
  },
  ko: {
    SMALL_FACE:
      '얼굴이 가이드라인 안에 작게 잡혀 정확도가 낮을 수 있어요. 얼굴이 가이드라인을 가득 채우도록 다시 찍어보세요.',
    TOO_DARK: '사진이 어두워 결과가 실제보다 낮게 나올 수 있어요. 밝은 곳에서 다시 찍어보세요.',
    TOO_BRIGHT: '빛이 강해 피부 결이 날아갔어요. 직사광선을 피해 다시 찍으면 더 정확하게 볼 수 있어요.',
    BLURRY: '사진이 흔들려 결을 자세히 보지 못했어요. 다시 찍으면 더 정확해져요.',
    NO_FACE_FOUND:
      '사진에서 얼굴을 찾지 못해 예시 결과를 보여드려요. 밝은 곳에서 얼굴을 가이드라인 안에 맞춰 다시 찍어주세요.',
    NO_PHOTO: '사진 없이 진행해 예시 결과를 보여드려요.',
  },
  ja: {
    SMALL_FACE:
      '顔が枠の中で小さく写っているため、精度が下がることがあります。顔が枠いっぱいになるように撮り直してください。',
    TOO_DARK: '写真が暗く、実際より低い結果になることがあります。明るい場所で撮り直してください。',
    TOO_BRIGHT: '光が強く、肌の質感がとんでいます。直射日光を避けて撮り直すとより正確です。',
    BLURRY: '写真がぶれて、質感を細かく読み取れませんでした。撮り直すとより正確です。',
    NO_FACE_FOUND:
      '写真から顔を見つけられなかったため、サンプルの結果を表示しています。明るい場所で顔を枠に合わせて撮り直してください。',
    NO_PHOTO: '写真なしで進めたため、サンプルの結果を表示しています。',
  },
  zh: {
    SMALL_FACE: '面部在框内偏小，结果可能不够准确。请让面部填满框后重拍。',
    TOO_DARK: '照片偏暗，结果可能低于实际。请在明亮处重拍。',
    TOO_BRIGHT: '光线过强，肤质细节被冲淡。避开直射阳光重拍会更准确。',
    BLURRY: '照片有抖动，未能看清肤质。重拍会更准确。',
    NO_FACE_FOUND: '照片中未找到面部，这里显示的是示例结果。请在明亮处将面部对准框内重拍。',
    NO_PHOTO: '未拍照直接继续，这里显示的是示例结果。',
  },
}

// --- The capture screen (CameraStrings.kt) ---

/**
 * What to fix, one sentence per rejection. Each names what the frame showed and
 * the single move that changes it — the dialog offers no other choice, so a line
 * the user cannot act on just sends them back into the same rejection.
 */
const REJECTIONS: Tables<Record<CaptureRejection, string>> = {
  en: {
    NO_FACE:
      'No face was found in the frame. Try again somewhere bright, with your face clearly visible.',
    MULTIPLE_FACES:
      'There is more than one face in the frame. Take it again with just you in view.',
    FACE_TOO_SMALL: 'Your face came out too small. Come a little closer and fill the outline.',
    FACE_OFF_CENTRE: 'Your face sat outside the outline. Line it up inside and take it again.',
  },
  ko: {
    NO_FACE: '사진에서 얼굴을 찾지 못했어요. 밝은 곳에서 얼굴이 잘 보이게 다시 찍어 주세요.',
    MULTIPLE_FACES: '사진에 얼굴이 둘 이상 보여요. 혼자 나오게 다시 찍어 주세요.',
    FACE_TOO_SMALL: '얼굴이 너무 작게 나왔어요. 조금 더 가까이 와서 가이드라인을 채워 주세요.',
    FACE_OFF_CENTRE: '얼굴이 가이드라인 밖으로 벗어났어요. 가이드라인 안에 맞춰 다시 찍어 주세요.',
  },
  ja: {
    NO_FACE:
      '写真から顔を見つけられませんでした。明るい場所で、顔がはっきり写るように撮り直してください。',
    MULTIPLE_FACES: '写真に2人以上の顔が写っています。ご自身だけが写るように撮り直してください。',
    FACE_TOO_SMALL: '顔が小さく写りすぎています。もう少し近づいて、枠いっぱいに顔を収めてください。',
    FACE_OFF_CENTRE: '顔が枠からはみ出しています。枠の中に合わせて撮り直してください。',
  },
  zh: {
    NO_FACE: '照片中未找到面部。请在明亮处重拍，让面部清晰可见。',
    MULTIPLE_FACES: '照片中不止一张脸。请只让自己入镜后重拍。',
    FACE_TOO_SMALL: '面部拍得太小。请再靠近一些，让面部填满框。',
    FACE_OFF_CENTRE: '面部偏出了框外。请对准框内后重拍。',
  },
}

/**
 * The capture screen's sentences that answer the detector and the gate. The rest of
 * the screen's chrome — title, the camera-blocked panel, the buttons — is
 * `i18n/capture.ts`.
 */
const CAPTURE_EN = {
  rejectionBody: (reason: CaptureRejection) => REJECTIONS.en[reason],
  gateTitle: 'This capture cannot be read',
  gateCta: 'Retake',
  /**
   * Appended for a user the gate has already turned away twice. On a first miss it
   * would read as "give up", which is why the screen holds it back until then.
   * Names `skip` by its printed label, so keep the two in step in every language.
   */
  gateSkipHint: "If it keeps happening, you can look around with 'Skip the capture' below.",
  lightingTip:
    'Sit facing a window or a bright lamp. Remove glasses and masks for a sharper reading.',
  /** What the viewfinder asks for once a face is in frame. */
  livenessPrompt: 'Please blink once.',
  /** On the frame the blink lands. The shutter follows on its own, so this reports. */
  livenessConfirmed: 'Got it. Taking the capture.',
  /** When the blinks are not registering — names the two things that defeat it. */
  livenessTrouble:
    "The blink isn't registering. Take your glasses off and try somewhere a little brighter.",
  waitingForFace: 'Waiting for a face in the outline.',
  skip: 'Skip the capture',
}

const CAPTURE: Tables<typeof CAPTURE_EN> = {
  en: CAPTURE_EN,
  ko: {
    rejectionBody: (reason) => REJECTIONS.ko[reason],
    gateTitle: '이 사진으로는 진단할 수 없어요',
    gateCta: '다시 촬영',
    gateSkipHint: "계속 안 되면 아래 '촬영 건너뛰기'로 둘러볼 수 있어요.",
    lightingTip:
      '창문이나 밝은 조명을 마주 보고 앉아 주세요. 안경과 마스크를 벗으면 더 정확하게 분석돼요.',
    livenessPrompt: '눈을 한 번 깜빡여 주세요.',
    livenessConfirmed: '확인됐어요. 바로 촬영할게요.',
    livenessTrouble: '깜빡임이 인식되지 않아요. 안경을 벗고 조금 더 밝은 곳에서 시도해 주세요.',
    // Short enough to stay one line in the pill on a phone.
    waitingForFace: '가이드라인에 얼굴이 들어오길 기다려요.',
    skip: '촬영 건너뛰기',
  },
  ja: {
    rejectionBody: (reason) => REJECTIONS.ja[reason],
    gateTitle: 'この写真では診断できません',
    gateCta: '撮り直す',
    gateSkipHint: '繰り返しうまくいかないときは、下の「撮影をスキップ」から見てみることもできます。',
    lightingTip:
      '窓や明るいライトのほうを向いて座ってください。眼鏡やマスクを外すと、より正確に読み取れます。',
    livenessPrompt: '一度まばたきをしてください。',
    livenessConfirmed: '確認できました。撮影します。',
    livenessTrouble: 'まばたきを認識できません。眼鏡を外して、もう少し明るい場所でお試しください。',
    waitingForFace: '枠の中に顔が入るのを待っています。',
    skip: '撮影をスキップ',
  },
  zh: {
    rejectionBody: (reason) => REJECTIONS.zh[reason],
    gateTitle: '这张照片无法检测',
    gateCta: '重拍',
    gateSkipHint: '如果一直不行，可以用下方的“跳过拍照”先看看。',
    lightingTip: '请面向窗户或明亮的灯光坐好。摘下眼镜和口罩，读取会更准确。',
    livenessPrompt: '请眨一次眼。',
    livenessConfirmed: '已确认，正在拍摄。',
    livenessTrouble: '未能识别到眨眼。请摘下眼镜，在更明亮的地方再试一次。',
    waitingForFace: '正在等待面部进入框内。',
    skip: '跳过拍照',
  },
}

// --- How a treatment's level sits against the reading (ranking.ts `pitchFor`) ---

const FIT_EN = {
  heading: 'SUITS YOU IF',
  meantFor: 'MEANT FOR',
  /** One area and the levels a treatment is pitched at there, both already labels. */
  line: (category: string, levels: string[]) => `${category}: ${levels.join(', ')}`,
  /**
   * The sentence about the area that put this treatment here. `category` and `level`
   * are labels in this language; English lowercases the category because the label
   * is a title-case chip and here it sits mid-sentence.
   */
  verdict: (category: string, level: string, verdict: Pitch['verdict']): string => {
    const where = `Your reading puts ${category.toLowerCase()} at "${level}"`
    if (verdict === 'fits') return `${where} — the level this is meant for.`
    if (verdict === 'stronger')
      return `${where}, milder than this is meant for. A gentler option may be all you need.`
    return `${where}. This may be too gentle on its own, so ask about the stronger options too.`
  },
}

const FIT_FRAMES: Tables<typeof FIT_EN> = {
  en: FIT_EN,
  ko: {
    heading: '이런 분께 맞아요',
    meantFor: '대상 단계',
    line: (category, levels) => `${category}: ${levels.join(', ')}`,
    verdict: (category, level, verdict) => {
      const where = `이번 결과에서 ${topic(category)} '${level}' 단계`
      if (verdict === 'fits') return `${where}로, 이 시술이 겨냥하는 바로 그 단계예요.`
      if (verdict === 'stronger')
        return `${where}로, 이 시술이 겨냥하는 단계보다 가벼워요. 더 순한 시술로도 충분할 수 있어요.`
      return `${where}예요. 이 시술만으로는 부족할 수 있으니 더 강한 시술도 함께 상담해 보세요.`
    },
  },
  ja: {
    heading: 'こんな方に向いています',
    meantFor: '対象の段階',
    // The full-width colon and the enumeration comma, as Japanese sets a list.
    line: (category, levels) => `${category}：${levels.join('、')}`,
    verdict: (category, level, verdict) => {
      const where = `今回の結果では${category}が「${level}」`
      if (verdict === 'fits') return `${where}で、この施術が想定しているちょうどその段階です。`
      if (verdict === 'stronger')
        return `${where}で、この施術が想定する段階より軽めです。よりマイルドな施術で十分かもしれません。`
      return `${where}です。この施術だけではマイルドすぎるかもしれないので、より強い施術についても相談してみてください。`
    },
  },
  zh: {
    heading: '适合以下情况',
    meantFor: '适用程度',
    line: (category, levels) => `${category}：${levels.join('、')}`,
    verdict: (category, level, verdict) => {
      const where = `您的检测结果中，${category}为“${level}”`
      if (verdict === 'fits') return `${where}，正是这个项目所针对的程度。`
      if (verdict === 'stronger')
        return `${where}，比这个项目所针对的程度更轻。更温和的方案可能就足够了。`
      return `${where}。单靠这个项目可能力度不够，也可以问问更强效的方案。`
    },
  },
}

// --- Chrome that is not derived from a reading ---

const UI_EN = {
  /** Never translated. */
  brand: 'SoLuTion',
  /**
   * Stays Latin in every language: the design sets it as a letter-spaced eyebrow
   * over the numeral, and the Korean handoff prints it in English too, so it reads
   * as a wordmark rather than as copy.
   */
  scoreLabel: 'SKIN SCORE',
  outOf: '/ 100',
  /**
   * The number under one category's bar.
   *
   * Deliberately not "42%". Nothing here is a percentage of anything — the row is
   * a 0..100 attention score built by putting one measurement on a ramp between
   * two hand-set anchors, so "42%" invited the reading "42% of your face has this",
   * which is not what was measured. See `skinScoring.ts`.
   */
  rowScore: (score: number) => `Score ${score}`,
  seeTreatments: 'See matched treatments',
  retake: 'Take another reading',
  treatmentsTitle: 'Matched treatments',
  topMatch: 'TOP MATCH',
  priceRange: 'PRICE RANGE',
  perSession: 'PER SESSION',
  course: 'COURSE',
  downtime: 'DOWNTIME',
  results: 'RESULTS',
  /**
   * The trust line and the sample-data caveat. Every language keeps both: the
   * prices are not real ones.
   */
  priceNote:
    'Chosen by our specialists. Prices are sample data for this prototype; final pricing is confirmed at the clinic.',
  partnerOffer:
    'Take your reading here, then visit a partner clinic and their full MARK-VU skin analysis — normally a paid service — is free.',
  /** "Pigmentation first · 6 matched". `category` is a label already in this language. */
  treatmentsSubtitle: (category: string | null, count: number) =>
    category ? `${category} first · ${count} matched` : `Matched to your reading · ${count}`,
}

const UI: Tables<typeof UI_EN> = {
  en: UI_EN,
  ko: {
    brand: 'SoLuTion',
    scoreLabel: 'SKIN SCORE',
    outOf: '/ 100',
    rowScore: (score) => `점수 ${score}`,
    seeTreatments: '추천 시술 보기',
    retake: '다시 진단하기',
    treatmentsTitle: '추천 시술',
    topMatch: '1순위',
    priceRange: '가격대',
    perSession: '1회 소요',
    course: '권장 횟수',
    downtime: '다운타임',
    results: '효과',
    priceNote:
      '저희 전문가가 고른 목록입니다. 가격은 이 프로토타입용 예시 데이터이며, 최종 가격은 병원에서 확정됩니다.',
    partnerOffer:
      '여기서 진단을 받은 뒤 제휴 병원을 방문하면, 원래 유료인 MARK-VU 정밀 피부 진단을 무료로 받을 수 있어요.',
    treatmentsSubtitle: (category, count) =>
      category ? `${category} 우선 · ${count}가지 추천` : `진단 결과에 맞춘 ${count}가지`,
  },
  ja: {
    brand: 'SoLuTion',
    scoreLabel: 'SKIN SCORE',
    outOf: '/ 100',
    rowScore: (score) => `スコア ${score}`,
    seeTreatments: 'おすすめ施術を見る',
    retake: 'もう一度診断する',
    treatmentsTitle: 'おすすめ施術',
    topMatch: 'ベストマッチ',
    priceRange: '料金目安',
    perSession: '1回あたり',
    course: '推奨回数',
    downtime: 'ダウンタイム',
    results: '効果',
    priceNote:
      '当サービスの専門家が選んだ一覧です。料金はこのプロトタイプ用のサンプルデータで、最終的な料金はクリニックで確定します。',
    partnerOffer:
      'ここで診断を受けてから提携クリニックを訪れると、通常は有料のMARK-VU精密肌診断が無料になります。',
    treatmentsSubtitle: (category, count) =>
      category ? `${category}を優先 · ${count}件` : `診断結果に合わせた${count}件`,
  },
  zh: {
    brand: 'SoLuTion',
    scoreLabel: 'SKIN SCORE',
    outOf: '/ 100',
    rowScore: (score) => `评分 ${score}`,
    seeTreatments: '查看匹配项目',
    retake: '重新检测',
    treatmentsTitle: '推荐项目',
    topMatch: '首选',
    priceRange: '价格区间',
    perSession: '单次时长',
    course: '疗程',
    downtime: '恢复期',
    results: '效果',
    priceNote: '由我们的专家挑选。价格为本原型的示例数据，最终价格以诊所确认为准。',
    partnerOffer:
      '先在这里完成检测，再前往合作诊所，原本收费的 MARK-VU 完整皮肤检测即可免费。',
    treatmentsSubtitle: (category, count) =>
      category ? `${category}优先 · 匹配${count}项` : `根据检测结果 · ${count}项`,
  },
}

// --- One language's worth, as the screens read it ---

/** Everything `useStrings()` hands a screen, already in the page's language. */
export interface Strings {
  categoryLabel: (c: SkinCategory) => string
  levelLabel: (l: SeverityLevel) => string
  ageBandLabel: (b: AgeBand) => string
  genderLabel: (g: Gender) => string
  clinicBadgeLabel: (b: ClinicBadge) => string
  /** The line above the category rows. */
  analysisHeadline: (result: SkinAnalysisResult) => string
  /** The cohort line under the headline, stamped with the reading's date. */
  analysisComparison: (result: SkinAnalysisResult) => string
  /** The sentence under one category row's bar. */
  analysisExplanation: (row: CategoryResult) => string
  /** The note under a row that was not measured from the photo, or null. */
  analysisRowNote: (row: CategoryResult) => string | null
  /** Null when the capture had nothing worth warning about. */
  analysisNotice: (result: SkinAnalysisResult) => string | null
  SKIN_TONE: typeof SKIN_TONE_EN
  CAPTURE: typeof CAPTURE_EN
  FIT: {
    heading: string
    meantFor: string
    /** Without a reading, one line per area: "Pores: Needs care, Focus first". */
    meantForLines: (suits: Suits) => string[]
    /** With a reading, one sentence about the area that put this treatment here. */
    verdict: (pitch: Pitch) => string
  }
  UI: typeof UI_EN
}

/** Wires the model's values into one language's tables. */
function build(lang: Lang): Strings {
  const categoryLabel = (c: SkinCategory) => CATEGORY[lang][c]
  const levelLabel = (l: SeverityLevel) => LEVEL[lang][l]
  const reading = READING[lang]
  const fit = FIT_FRAMES[lang]
  return {
    categoryLabel,
    levelLabel,
    ageBandLabel: (b) => AGE_BAND[lang][b],
    genderLabel: (g) => GENDER[lang][g],
    clinicBadgeLabel: (b) => CLINIC_BADGE[lang][b],
    analysisHeadline: (result) => {
      const focus = focusCategories(result)
      return focus.length === 0 ? reading.healthy : reading.focus(focus.map(categoryLabel))
    },
    analysisComparison: (result) => {
      const body = reading.comparison(reading.cohort(result.ageBand, result.gender), result.cohortDiff)
      // 0 is "never analysed" rather than 1970 — a stamp would be a lie.
      return result.analyzedAtMillis === 0
        ? body
        : `${body} · ${reading.date(new Date(result.analyzedAtMillis))}`
    },
    analysisExplanation: (row) => EXPLANATIONS[lang][row.category][row.level],
    analysisRowNote: (row) => (row.category === 'LAXITY' ? LAXITY_NOTE[lang] : null),
    analysisNotice: (result) => (result.notice ? NOTICES[lang][result.notice] : null),
    SKIN_TONE: SKIN_TONE[lang],
    CAPTURE: CAPTURE[lang],
    FIT: {
      heading: fit.heading,
      meantFor: fit.meantFor,
      meantForLines: (suits) =>
        (Object.entries(suits) as [SkinCategory, SeverityLevel[]][]).map(([category, levels]) =>
          fit.line(categoryLabel(category), levels.map(levelLabel)),
        ),
      verdict: (pitch) =>
        fit.verdict(categoryLabel(pitch.category), levelLabel(pitch.level), pitch.verdict),
    },
    UI: UI[lang],
  }
}

/** Built once per language, so a screen holds the same object until the language changes. */
const STRINGS: Tables<Strings> = {
  en: build('en'),
  ko: build('ko'),
  ja: build('ja'),
  zh: build('zh'),
}

/** The reading's sentences and the shared chrome, in the page's language. */
export function useStrings(): Strings {
  return useCopy(STRINGS)
}
