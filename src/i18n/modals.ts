/**
 * The three overlays — the Android app's `LanguageStrings`, `SignUpStrings` and
 * `ComposerStrings`, with their wording, and "Close", "Cancel" and "REQUIRED" from its
 * `CommonStrings`.
 *
 * The sign-up copy promises only what the prototype already does — keep the reading,
 * price it per clinic, count points — and says before anyone types a password that
 * nothing is created or kept. Each translation keeps that line at full strength.
 *
 * The composer's two selects list treatment and clinic names, which are catalogue
 * content (`useCatalog`), not copy.
 */
import type { Tables } from './index'

const en = {
  close: 'Close',
  language: {
    title: 'Choose your language',
    subtitle: 'The community feed is scoped to this language.',
    /** A listed language whose tables are not all written yet. */
    notTranslated: 'Not translated yet',
    /**
     * Each card's second line: its language named in the page's. The first line is
     * the language's own name, so a reader who understands nothing else on the page
     * can still find theirs; this one is what makes the choice legible to everyone
     * else.
     */
    names: { en: 'English', ko: 'Korean', ja: 'Japanese', zh: 'Chinese' },
  },
  signup: {
    /** The pitch panel's heading. One sentence; the sheet's width decides the wrap. */
    title: 'Save your results and unlock treatment matches.',
    subtitle:
      'Your reading stays available for the rest of your trip, and clinics near your district get matched to it.',
    /** The three ticked lines, in the design's order. */
    perks: [
      'Keep this reading for the whole trip and compare a second one later.',
      'See per-clinic prices for the treatments matched to you.',
      'Earn points on visits and reviews, redeemable at partner clinics.',
    ],
    /** The form panel's heading, beside the close button. */
    formTitle: 'Create your account',
    emailLabel: 'EMAIL',
    passwordLabel: 'PASSWORD',
    createAccount: 'Create account',
    prototypeNote: 'Prototype — no account is created and nothing you type is sent or stored.',
    /** Divider above the two federated buttons, whose names are the same in all four. */
    orContinueWith: 'or continue with',
    continueWithout: 'Continue without an account',
  },
  composer: {
    title: 'New post',
    addPhoto: 'Add photo',
    /** Beside the photo tile: says outright that the tile does nothing yet. */
    photoHint: 'Photo upload is not wired up in this prototype — posts publish with text and tags.',
    bodyPlaceholder: 'What was the visit like? What changed, and how long did it take?',
    treatmentTag: 'TREATMENT TAG',
    clinicTag: 'CLINIC TAG',
    required: 'REQUIRED',
    /** Shown only while the clinic tag is the clinic the user booked. */
    verifiedNotice:
      'Because you booked this clinic through SoLuTion, your post gets a Verified Visit badge.',
    /** Shown instead: how the badge is earned, without promising it. */
    verifiedHint: 'Verified Visit is added to posts about a clinic you booked through SoLuTion.',
    cancel: 'Cancel',
    publish: 'Publish post',
  },
}

export const MODALS: Tables<typeof en> = {
  en,
  ko: {
    close: '닫기',
    language: {
      title: '언어를 선택하세요',
      subtitle: '커뮤니티 피드도 이 언어로 표시돼요.',
      notTranslated: '아직 번역되지 않았어요',
      names: { en: '영어', ko: '한국어', ja: '일본어', zh: '중국어' },
    },
    signup: {
      title: '결과를 저장하고 추천 시술을 확인하세요.',
      subtitle: '진단 결과는 여행 내내 저장되고, 머무시는 지역 근처 병원을 결과에 맞춰 찾아드려요.',
      perks: [
        '이번 결과를 여행 내내 보관하고, 나중에 한 번 더 찍어 비교할 수 있어요.',
        '추천받은 시술의 병원별 가격을 볼 수 있어요.',
        '방문과 후기로 포인트가 쌓이고, 제휴 병원에서 쓸 수 있어요.',
      ],
      // 회원가입 is the top bar's word for the same act; the heading takes the
      // invitation form so the two do not read as one label printed twice.
      formTitle: '계정을 만들어 보세요',
      emailLabel: '이메일',
      passwordLabel: '비밀번호',
      createAccount: '계정 만들기',
      prototypeNote:
        '프로토타입이라 계정은 만들어지지 않으며, 입력한 내용은 어디에도 전송되거나 저장되지 않아요.',
      orContinueWith: '또는 다음 방법으로',
      continueWithout: '계정 없이 계속하기',
    },
    composer: {
      title: '새 글 쓰기',
      addPhoto: '사진 추가',
      photoHint:
        '이 프로토타입에는 사진 업로드가 아직 연결되지 않았어요. 글은 내용과 태그로 게시돼요.',
      bodyPlaceholder: '방문은 어땠나요? 무엇이 달라졌고, 얼마나 걸렸나요?',
      treatmentTag: '시술 태그',
      clinicTag: '병원 태그',
      required: '필수',
      verifiedNotice: 'SoLuTion으로 이 병원을 예약하셨으니, 이 글에는 방문 인증 배지가 붙어요.',
      verifiedHint: '방문 인증은 SoLuTion으로 예약한 병원에 대한 글에 붙어요.',
      cancel: '취소',
      publish: '게시하기',
    },
  },
  ja: {
    close: '閉じる',
    language: {
      title: '言語を選んでください',
      subtitle: 'コミュニティのフィードには、この言語の投稿が表示されます。',
      notTranslated: 'まだ翻訳されていません',
      names: { en: '英語', ko: '韓国語', ja: '日本語', zh: '中国語' },
    },
    signup: {
      title: '結果を保存して、合う施術を見つける。',
      subtitle:
        '診断結果は旅行のあいだ保存され、滞在エリア近くのクリニックを結果に合わせてご案内します。',
      perks: [
        '今回の結果を旅行中ずっと保存でき、あとで撮り直して比べられます。',
        'おすすめ施術のクリニック別料金を確認できます。',
        '来院とレビューでポイントが貯まり、提携クリニックで使えます。',
      ],
      formTitle: 'アカウントを作成',
      emailLabel: 'メールアドレス',
      passwordLabel: 'パスワード',
      createAccount: 'アカウント作成',
      prototypeNote:
        'プロトタイプのため、アカウントは作成されず、入力した内容が送信・保存されることもありません。',
      orContinueWith: 'または次の方法で',
      continueWithout: 'アカウントなしで続ける',
    },
    composer: {
      title: '新規投稿',
      addPhoto: '写真を追加',
      photoHint:
        'このプロトタイプでは写真のアップロードに対応していません。投稿は本文とタグで公開されます。',
      bodyPlaceholder: '来院はいかがでしたか？何が変わり、どのくらいかかりましたか？',
      treatmentTag: '施術タグ',
      clinicTag: 'クリニックタグ',
      required: '必須',
      verifiedNotice:
        'SoLuTion経由でこのクリニックを予約したので、この投稿には来院認証バッジが付きます。',
      verifiedHint: '来院認証は、SoLuTion経由で予約したクリニックについての投稿に付きます。',
      cancel: 'キャンセル',
      publish: '投稿する',
    },
  },
  zh: {
    close: '关闭',
    language: {
      title: '选择您的语言',
      subtitle: '社区动态也会以此语言显示。',
      notTranslated: '尚未翻译',
      names: { en: '英语', ko: '韩语', ja: '日语', zh: '中文' },
    },
    signup: {
      title: '保存结果，查看为您匹配的项目。',
      subtitle: '检测结果会在整个行程中保留，并根据结果为您匹配附近的诊所。',
      perks: [
        '整个行程都能保留这次结果，之后再测一次可以对比。',
        '查看匹配项目在各家诊所的价格。',
        '到店和评价可累积积分，在合作诊所使用。',
      ],
      formTitle: '创建您的账号',
      emailLabel: '邮箱',
      passwordLabel: '密码',
      createAccount: '创建账号',
      prototypeNote: '这是原型版本：不会创建账号，您输入的内容也不会被发送或保存。',
      orContinueWith: '或使用以下方式',
      continueWithout: '不创建账号，直接继续',
    },
    composer: {
      title: '发布新帖',
      addPhoto: '添加照片',
      photoHint: '此原型尚未接入照片上传，帖子将以文字和标签发布。',
      bodyPlaceholder: '这次到店体验如何？有什么变化，花了多长时间？',
      treatmentTag: '项目标签',
      clinicTag: '诊所标签',
      required: '必填',
      verifiedNotice: '您通过 SoLuTion 预约了这家诊所，这条帖子会获得到店认证标识。',
      verifiedHint: '关于您通过 SoLuTion 预约过的诊所的帖子，会加上到店认证标识。',
      cancel: '取消',
      publish: '发布帖子',
    },
  },
}
