/**
 * H0 The health checkup's front page — the skin landing's frame (`main.png`) with
 * the checkup's words.
 *
 * Two things it is careful not to claim. The reader takes Korean and English
 * sheets only, so the Japanese and Chinese pages name the Korean checkup rather
 * than their own country's. And nothing about a checkup is kept: the "last
 * reading" link is this visit's, and says so.
 *
 * The sample card's condition and level names, and the sample call, are the
 * health screens' own (`HEALTH_COPY`), so the preview speaks the result's words.
 */
import type { Tables } from './index'

interface Step {
  title: string
  body: string
}

interface Copy {
  pill: string
  headline: string
  bodyLaptop: string
  bodyPhone: string
  start: string
  /** Only rendered when a sheet was read earlier in this visit. The link appends the arrow. */
  lastReading: string
  statItems: { value: string; label: string }
  statAreas: { value: string; label: string }
  statUploads: { value: string; label: string }
  sampleTitle: string
  samplePreview: string
  sampleNote: string
  howEyebrow: string
  howTitle: string
  stepBasics: Step
  stepScan: Step
  stepScanPhone: Step
  stepMap: Step
  stepGo: Step
  bandEyebrow: string
  bandTitle: string
  bandBody: string
  privateCard: { label: string; title: string; body: string }
  guideCard: { label: string; title: string; body: string }
  closingTitle: string
  closingBody: string
  about: string
  partnerHospitals: string
  privacy: string
  contact: string
  footerNote: string
}

const en: Copy = {
  pill: 'Korean national health checkup · 15 items',
  headline: 'Your checkup sheet, read in plain words.',
  bodyLaptop:
    'Hold your result sheet up to your laptop webcam or phone camera. SoLuTion reads the numbers, marks the ones outside the normal range on a body map, and tells you which department to see — and which hospitals are nearby.',
  bodyPhone:
    'Point your phone camera at your result sheet. SoLuTion reads the numbers, marks the ones outside the normal range on a body map, and tells you which department to see — and which hospitals are nearby.',
  start: 'Read my checkup',
  lastReading: 'Open the reading from this visit',
  statItems: { value: '15', label: 'Checkup items read' },
  statAreas: { value: '7', label: 'Body areas mapped' },
  statUploads: { value: '0', label: 'Photos uploaded' },
  sampleTitle: 'Sample reading',
  samplePreview: 'Preview',
  sampleNote:
    'Cholesterol and liver numbers are past the line. The guide names the department to see and lists hospitals near you.',
  howEyebrow: 'HOW IT WORKS',
  howTitle: 'Four steps, a few minutes.',
  stepBasics: { title: 'Tell us the basics', body: 'Age, gender, family history, and which district you are in.' },
  stepScan: { title: 'Show your sheet', body: 'Hold the result sheet up to your webcam. It is read in the browser.' },
  stepScanPhone: {
    title: 'Photograph your sheet',
    body: 'Point your phone camera at the result sheet. It is read in the browser.',
  },
  stepMap: {
    title: 'See your body map',
    body: 'Every number judged against the national screening lines, and shown where it belongs.',
  },
  stepGo: { title: 'Know where to go', body: 'What each result means, which department to see, and hospitals nearby.' },
  bandEyebrow: 'ON THIS DEVICE',
  bandTitle: 'Your sheet stays with you.',
  bandBody:
    'The photo of your sheet is read inside your browser and never uploaded. Nothing about your checkup is kept after you close the tab.',
  privateCard: { label: 'PRIVATE', title: 'Read in the browser', body: 'No upload, no account, nothing stored.' },
  guideCard: {
    label: 'NOT A DIAGNOSIS',
    title: 'A guide to the next step',
    body: 'The lines are the Korean national checkup sheet’s. Your doctor’s judgment comes first.',
  },
  closingTitle: 'Start with the sheet. Then ask a doctor.',
  closingBody: 'No account needed to see the result. Nothing is sent to a hospital.',
  about: 'About',
  partnerHospitals: 'Partner hospitals',
  privacy: 'Privacy',
  contact: 'Contact',
  footerNote: 'Prototype · Sample hospital data',
}

export const HEALTH_LANDING: Tables<Copy> = {
  en,
  ko: {
    pill: '국가건강검진 · 15개 항목',
    headline: '건강검진 결과지, 쉬운 말로 읽어 드려요.',
    bodyLaptop:
      '결과지를 노트북 웹캠 또는 핸드폰 카메라에 비춰 주세요. SoLuTion이 수치를 읽고, 정상 범위를 벗어난 항목을 몸 그림에 표시해요. 어느 진료과에 가면 되는지, 가까운 병원은 어디인지도 알려 드려요.',
    bodyPhone:
      '결과지를 휴대폰 카메라로 찍어 주세요. SoLuTion이 수치를 읽고, 정상 범위를 벗어난 항목을 몸 그림에 표시해요. 어느 진료과에 가면 되는지, 가까운 병원은 어디인지도 알려 드려요.',
    start: '검진 결과 읽기',
    lastReading: '이번에 읽은 결과 다시 보기',
    statItems: { value: '15', label: '읽는 검진 항목' },
    statAreas: { value: '7', label: '몸 그림에 표시하는 부위' },
    statUploads: { value: '0', label: '서버로 보내는 사진' },
    sampleTitle: '판독 예시',
    samplePreview: '미리 보기',
    sampleNote: '콜레스테롤과 간 수치가 기준을 넘었어요. 어느 진료과에 가면 되는지, 가까운 병원은 어디인지 안내해 드려요.',
    howEyebrow: '이용 방법',
    howTitle: '4단계, 몇 분이면 충분해요.',
    stepBasics: { title: '기본 정보 입력', body: '나이, 성별, 가족력, 머무는 지역을 알려 주세요.' },
    stepScan: { title: '결과지 비추기', body: '결과지를 웹캠에 비추면 브라우저 안에서 읽어요.' },
    stepScanPhone: { title: '결과지 촬영', body: '휴대폰 카메라로 결과지를 찍으면 브라우저 안에서 읽어요.' },
    stepMap: { title: '몸 그림 확인', body: '국가검진 기준으로 수치마다 판정해 해당 부위에 표시해요.' },
    stepGo: { title: '갈 곳 확인', body: '결과의 의미, 가야 할 진료과, 가까운 병원까지 알려 드려요.' },
    bandEyebrow: '내 기기 안에서',
    bandTitle: '결과지는 내 손을 떠나지 않아요.',
    bandBody: '결과지 사진은 브라우저 안에서만 읽고 어디에도 올리지 않아요. 탭을 닫으면 검진 정보도 남지 않아요.',
    privateCard: { label: '개인정보 보호', title: '브라우저 안에서 판독', body: '업로드도, 계정도, 저장도 없어요.' },
    guideCard: {
      label: '진단이 아니에요',
      title: '다음 단계를 위한 안내',
      body: '판정 기준은 국가건강검진 결과지의 기준이에요. 의사의 판단이 우선이에요.',
    },
    closingTitle: '결과지부터 읽어 보세요. 그다음은 의사와 상담.',
    closingBody: '결과를 보는 데 계정은 필요 없어요. 병원에는 아무것도 전달되지 않아요.',
    about: '서비스 소개',
    partnerHospitals: '제휴 병원',
    privacy: '개인정보 처리방침',
    contact: '문의하기',
    footerNote: '프로토타입 · 병원은 예시 데이터입니다',
  },
  ja: {
    pill: '韓国の国民健康診断 · 15項目',
    headline: '健診の結果票を、わかりやすい言葉で。',
    bodyLaptop:
      '結果票をノートPCのWebカメラまたはスマートフォンのカメラにかざしてください。SoLuTionが数値を読み取り、基準値を外れた項目を人体マップに表示します。何科を受診すればよいか、近くの病院もご案内します。',
    bodyPhone:
      '結果票をスマートフォンのカメラで撮影してください。SoLuTionが数値を読み取り、基準値を外れた項目を人体マップに表示します。何科を受診すればよいか、近くの病院もご案内します。',
    start: '健診結果を読み取る',
    lastReading: '今回読み取った結果をもう一度見る',
    statItems: { value: '15', label: '読み取る健診項目' },
    statAreas: { value: '7', label: '人体マップの部位' },
    statUploads: { value: '0', label: 'アップロードされる写真' },
    sampleTitle: '読み取りサンプル',
    samplePreview: 'プレビュー',
    sampleNote: 'コレステロールと肝機能の数値が基準を超えています。受診する診療科と近くの病院をご案内します。',
    howEyebrow: 'ご利用の流れ',
    howTitle: '4ステップ、数分で完了。',
    stepBasics: { title: '基本情報を入力', body: '年齢、性別、家族歴、滞在エリアを教えてください。' },
    stepScan: { title: '結果票をかざす', body: 'Webカメラに結果票をかざすと、ブラウザ内で読み取ります。' },
    stepScanPhone: { title: '結果票を撮影', body: 'スマートフォンのカメラで結果票を撮ると、ブラウザ内で読み取ります。' },
    stepMap: { title: '人体マップを見る', body: '健診の基準で数値ごとに判定し、該当する部位に表示します。' },
    stepGo: { title: '行き先を知る', body: '結果の意味、受診する診療科、近くの病院までご案内します。' },
    bandEyebrow: 'この端末の中で',
    bandTitle: '結果票は手元から出ません。',
    bandBody: '結果票の写真はブラウザ内でのみ読み取り、どこにもアップロードしません。タブを閉じると健診情報も残りません。',
    privateCard: { label: 'プライバシー', title: 'ブラウザ内で読み取り', body: 'アップロードも、アカウントも、保存もありません。' },
    guideCard: {
      label: '診断ではありません',
      title: '次の一歩のための案内',
      body: '判定基準は韓国の国民健康診断の結果票の基準です。医師の判断が優先されます。',
    },
    closingTitle: 'まずは結果票から。次は医師に相談を。',
    closingBody: '結果を見るのにアカウントは不要です。病院には何も送信されません。',
    about: 'サービスについて',
    partnerHospitals: '提携病院',
    privacy: 'プライバシー',
    contact: 'お問い合わせ',
    footerNote: 'プロトタイプ · 病院はサンプルデータです',
  },
  zh: {
    pill: '韩国国民健康体检 · 15项',
    headline: '体检报告，用简单的话读给你听。',
    bodyLaptop:
      '把体检报告对准笔记本摄像头或手机摄像头。SoLuTion 会读取数值，在人体图上标出超出正常范围的项目，并告诉你该看哪个科、附近有哪些医院。',
    bodyPhone:
      '用手机摄像头拍下体检报告。SoLuTion 会读取数值，在人体图上标出超出正常范围的项目，并告诉你该看哪个科、附近有哪些医院。',
    start: '读取体检报告',
    lastReading: '再次查看本次读取的结果',
    statItems: { value: '15', label: '读取的体检项目' },
    statAreas: { value: '7', label: '人体图上的部位' },
    statUploads: { value: '0', label: '上传的照片' },
    sampleTitle: '读取示例',
    samplePreview: '预览',
    sampleNote: '胆固醇和肝功能数值超出了标准。我们会告诉你该看哪个科，以及附近的医院。',
    howEyebrow: '使用流程',
    howTitle: '四个步骤，几分钟即可。',
    stepBasics: { title: '填写基本信息', body: '年龄、性别、家族病史，以及你所在的区域。' },
    stepScan: { title: '对准报告', body: '把体检报告对准摄像头，在浏览器内完成读取。' },
    stepScanPhone: { title: '拍摄报告', body: '用手机摄像头拍下体检报告，在浏览器内完成读取。' },
    stepMap: { title: '查看人体图', body: '按体检标准逐项判定，并标在对应的部位上。' },
    stepGo: { title: '知道去哪里', body: '结果的含义、该看的科室，以及附近的医院。' },
    bandEyebrow: '只在本设备上',
    bandTitle: '你的报告不会离开你的手。',
    bandBody: '报告照片只在浏览器内读取，不会上传到任何地方。关闭标签页后，体检信息也不会保留。',
    privateCard: { label: '隐私', title: '在浏览器内读取', body: '不上传、无需账号、不保存。' },
    guideCard: {
      label: '不是诊断',
      title: '下一步的参考',
      body: '判定标准来自韩国国民健康体检报告。以医生的判断为准。',
    },
    closingTitle: '先读报告，再问医生。',
    closingBody: '查看结果无需账号。不会向医院发送任何信息。',
    about: '关于我们',
    partnerHospitals: '合作医院',
    privacy: '隐私政策',
    contact: '联系我们',
    footerNote: '原型 · 医院为示例数据',
  },
}
