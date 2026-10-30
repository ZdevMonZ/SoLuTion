/**
 * 01 Landing — the Android app's `SplashStrings`, with its wording.
 *
 * Two departures, both because the web is not the app. The camera step and the
 * hero name the device — laptop webcam on a laptop, phone camera on a phone — so
 * each comes in both forms, whole sentences rather than a spliced-in noun, since
 * Korean picks its particle by the noun. And where the app says the photo is read
 * "on the phone", the web says "in the browser", which is where it really happens.
 *
 * Every section is a named field rather than a list, so a language that forgets a
 * step or a stat fails to compile instead of drawing three cards where the others
 * draw four. The sample card's category and level names are not here: they are the
 * result screen's (`useStrings`), so the preview speaks its words.
 */
import type { Tables } from './index'

const en = {
  /** The pill above the headline: the three districts, as the catalogue spells them. */
  districts: 'Myeongdong · Hongdae · Gangnam',
  headline: 'Your first skin diagnosis, built by a dermatologist.',
  bodyLaptop:
    'SoLuTion reads your skin from your laptop webcam, explains what it finds in plain language, and shows you which Seoul clinics treat it — with prices, before you walk in.',
  bodyPhone:
    'SoLuTion reads your skin from your phone camera, explains what it finds in plain language, and shows you which Seoul clinics treat it — with prices, before you walk in.',
  start: 'Start Diagnosis',
  browse: 'Browse treatments',
  /** Only rendered when a previous reading is stored. The link appends the arrow. */
  savedReport: 'Open your last reading',
  deleteSavedReport: 'Delete it',
  statDistricts: { value: '3', label: 'Seoul districts covered' },
  statClinics: { value: '16', label: 'Partner clinics' },
  statTime: { value: '5 min', label: 'From photo to plan' },
  sampleTitle: 'Sample reading',
  samplePreview: 'Preview',
  /** Under the dial's numeral. */
  sampleScore: 'SCORE',
  sampleNote:
    'Pigmentation is the first thing to look at. Three clinics in Myeongdong treat it from ₩135,000.',
  howEyebrow: 'HOW IT WORKS',
  howTitle: 'Four steps, about five minutes.',
  stepBasics: {
    title: 'Tell us the basics',
    body: 'Age, gender, and which district you are staying in.',
  },
  stepCamera: {
    title: 'Use your webcam',
    body: 'One frame from your laptop camera, processed in the browser.',
  },
  stepCameraPhone: {
    title: 'Use your camera',
    body: 'One frame from your phone camera, processed in the browser.',
  },
  stepResult: {
    title: 'Read your result',
    body: 'Seven readings in plain language, ordered by priority.',
  },
  stepBook: {
    title: 'Compare and book',
    body: 'Clinic prices side by side, then a free consultation.',
  },
  partnerEyebrow: 'PARTNER SKINCARE',
  partnerTitle: 'SOLION by day, LUNION by night.',
  partnerBody:
    'Every treatment page recommends the two products that matter after it — sun protection for the day, recovery for the night. Both lines are sold at the partner clinics you book through SoLuTion.',
  /** The copy on one partner-skincare card; the house name stays Latin in all four. */
  solion: {
    when: 'Daytime',
    body: 'Sun protection that keeps treated pigmentation from returning.',
  },
  lunion: { when: 'Nighttime', body: 'Recovery for the nights right after a session.' },
  closingTitle: 'Start with the reading. Decide later.',
  closingBody: 'No account needed to see your result. Nothing is sent to a clinic until you book.',
  about: 'About',
  partnerClinics: 'Partner clinics',
  privacy: 'Privacy',
  contact: 'Contact',
  /** The footer's sample-data label: the clinics and prices are not real. */
  footerNote: 'Prototype · Sample clinic and price data',
}

export const LANDING: Tables<typeof en> = {
  en,
  ko: {
    districts: '명동 · 홍대 · 강남',
    headline: '전문의가 만든 첫 피부 진단.',
    bodyLaptop:
      'SoLuTion은 노트북 웹캠으로 피부를 살펴보고, 발견한 내용을 쉬운 말로 설명해 드려요. 서울 어느 병원에서 시술받을 수 있는지도 방문 전에 가격과 함께 알려 드려요.',
    bodyPhone:
      'SoLuTion은 휴대폰 카메라로 피부를 살펴보고, 발견한 내용을 쉬운 말로 설명해 드려요. 서울 어느 병원에서 시술받을 수 있는지도 방문 전에 가격과 함께 알려 드려요.',
    start: '진단 시작하기',
    browse: '시술 둘러보기',
    savedReport: '지난 결과 다시 보기',
    deleteSavedReport: '지우기',
    statDistricts: { value: '3', label: '서비스 중인 서울 지역' },
    statClinics: { value: '16', label: '제휴 병원' },
    statTime: { value: '5분', label: '사진부터 관리 플랜까지' },
    sampleTitle: '진단 예시',
    samplePreview: '미리 보기',
    sampleScore: '점수',
    sampleNote:
      '가장 먼저 살펴볼 항목은 색소예요. 명동의 병원 세 곳에서 ₩135,000부터 시술받을 수 있어요.',
    howEyebrow: '이용 방법',
    howTitle: '4단계, 5분 정도 걸려요.',
    stepBasics: { title: '기본 정보 입력', body: '나이와 성별, 머무는 지역을 알려 주세요.' },
    stepCamera: {
      title: '웹캠으로 촬영',
      body: '노트북 카메라로 한 장만 찍으면 분석은 브라우저 안에서 끝나요.',
    },
    stepCameraPhone: {
      title: '카메라로 촬영',
      body: '휴대폰 카메라로 한 장만 찍으면 분석은 브라우저 안에서 끝나요.',
    },
    stepResult: { title: '결과 확인', body: '7가지 지표를 쉬운 말로, 우선순위대로 보여 드려요.' },
    stepBook: {
      title: '비교하고 예약',
      body: '병원별 가격을 나란히 비교한 뒤 무료 상담을 예약하세요.',
    },
    partnerEyebrow: '제휴 스킨케어',
    partnerTitle: '낮에는 SOLION, 밤에는 LUNION.',
    partnerBody:
      '모든 시술 페이지에서 시술 후 중요한 두 제품을 추천해요. 낮에는 자외선 차단, 밤에는 회복 관리. 두 라인 모두 SoLuTion으로 예약하는 제휴 병원에서 판매해요.',
    solion: {
      when: '데이 케어',
      body: '시술로 옅어진 색소가 다시 올라오지 않도록 막아 주는 자외선 차단.',
    },
    lunion: { when: '나이트 케어', body: '시술 직후 며칠 밤을 위한 회복 케어.' },
    closingTitle: '진단부터 받아 보세요. 결정은 그다음에.',
    closingBody:
      '결과를 보는 데 계정은 필요 없어요. 예약하기 전까지 병원에는 아무것도 전달되지 않아요.',
    about: '서비스 소개',
    partnerClinics: '제휴 병원',
    privacy: '개인정보 처리방침',
    contact: '문의하기',
    footerNote: '프로토타입 · 병원과 가격은 예시 데이터입니다',
  },
  ja: {
    districts: '明洞 · 弘大 · 江南',
    headline: '皮膚科医がつくった、はじめての肌診断。',
    bodyLaptop:
      'SoLuTionはノートパソコンのウェブカメラで肌を読み取り、わかったことをやさしい言葉で説明します。その悩みに対応するソウルのクリニックも、来院前に料金つきでご案内します。',
    bodyPhone:
      'SoLuTionはスマートフォンのカメラで肌を読み取り、わかったことをやさしい言葉で説明します。その悩みに対応するソウルのクリニックも、来院前に料金つきでご案内します。',
    start: '診断をはじめる',
    browse: '施術を見る',
    savedReport: '前回の結果を開く',
    deleteSavedReport: '削除する',
    statDistricts: { value: '3', label: '対応するソウルのエリア' },
    statClinics: { value: '16', label: '提携クリニック' },
    statTime: { value: '5分', label: '撮影からプランまで' },
    sampleTitle: '診断サンプル',
    samplePreview: 'プレビュー',
    sampleScore: 'スコア',
    sampleNote:
      'まず見ておきたいのは色素です。明洞の3つのクリニックで₩135,000から施術を受けられます。',
    howEyebrow: 'ご利用の流れ',
    howTitle: '4つのステップ、約5分。',
    stepBasics: { title: '基本情報を入力', body: '年代、性別、滞在中のエリアを教えてください。' },
    stepCamera: {
      title: 'ウェブカメラで撮影',
      body: 'ノートパソコンのカメラで1枚撮るだけ。分析はブラウザの中で行います。',
    },
    stepCameraPhone: {
      title: 'カメラで撮影',
      body: 'スマートフォンのカメラで1枚撮るだけ。分析はブラウザの中で行います。',
    },
    stepResult: { title: '結果を読む', body: '7つの指標を、やさしい言葉で優先度順に。' },
    stepBook: { title: '比較して予約', body: 'クリニックの料金を並べて比べ、無料カウンセリングへ。' },
    partnerEyebrow: '提携スキンケア',
    partnerTitle: '昼はSOLION、夜はLUNION。',
    partnerBody:
      'どの施術ページでも、施術後に大切な2つの製品をおすすめします。昼は紫外線対策、夜は回復ケア。どちらのラインも、SoLuTionで予約する提携クリニックで購入できます。',
    solion: { when: '昼のケア', body: '施術で薄くなった色素が戻らないよう守る紫外線対策。' },
    lunion: { when: '夜のケア', body: '施術直後の夜のための回復ケア。' },
    closingTitle: 'まずは診断から。決めるのはそのあとで。',
    closingBody: '結果を見るのにアカウントは不要です。予約するまで、クリニックには何も送られません。',
    about: 'サービスについて',
    partnerClinics: '提携クリニック',
    privacy: 'プライバシー',
    contact: 'お問い合わせ',
    footerNote: 'プロトタイプ · クリニックと料金はサンプルデータです',
  },
  zh: {
    districts: '明洞 · 弘大 · 江南',
    headline: '皮肤科医生打造的首次皮肤检测。',
    bodyLaptop:
      'SoLuTion 通过笔记本电脑摄像头检测您的皮肤，用通俗易懂的语言解释它的发现，并告诉您首尔哪些诊所可以处理，到店之前就能看到价格。',
    bodyPhone:
      'SoLuTion 通过手机摄像头检测您的皮肤，用通俗易懂的语言解释它的发现，并告诉您首尔哪些诊所可以处理，到店之前就能看到价格。',
    start: '开始检测',
    browse: '浏览项目',
    savedReport: '打开上次的结果',
    deleteSavedReport: '删除',
    statDistricts: { value: '3', label: '覆盖的首尔街区' },
    statClinics: { value: '16', label: '合作诊所' },
    statTime: { value: '5分钟', label: '从拍照到方案' },
    sampleTitle: '检测示例',
    samplePreview: '预览',
    sampleScore: '评分',
    sampleNote: '最需要先关注的是色素。明洞有三家诊所可以处理，₩135,000 起。',
    howEyebrow: '使用流程',
    howTitle: '四个步骤，约五分钟。',
    stepBasics: { title: '填写基本信息', body: '年龄、性别，以及您住在哪个街区。' },
    stepCamera: { title: '用电脑摄像头拍摄', body: '用笔记本电脑摄像头拍一张，分析在浏览器中完成。' },
    stepCameraPhone: { title: '用摄像头拍摄', body: '用手机摄像头拍一张，分析在浏览器中完成。' },
    stepResult: { title: '查看结果', body: '七项指标，用通俗的语言按优先级排列。' },
    stepBook: { title: '比较并预约', body: '并排比较诊所价格，然后预约免费面诊。' },
    partnerEyebrow: '合作护肤品牌',
    partnerTitle: '白天 SOLION，夜晚 LUNION。',
    partnerBody:
      '每个项目页面都会推荐术后最重要的两款产品：白天防晒，夜间修护。两个系列都在您通过 SoLuTion 预约的合作诊所有售。',
    solion: { when: '日间', body: '防晒，让治疗后淡化的色素不再反弹。' },
    lunion: { when: '夜间', body: '术后头几个晚上的修护。' },
    closingTitle: '先做检测，之后再决定。',
    closingBody: '查看结果无需注册账号。在您预约之前，不会向诊所发送任何信息。',
    about: '关于我们',
    partnerClinics: '合作诊所',
    privacy: '隐私政策',
    contact: '联系我们',
    footerNote: '原型 · 诊所与价格为示例数据',
  },
}
