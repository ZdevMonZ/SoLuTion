/**
 * 03 Info form — the Android app's `BasicInfoStrings`, with its wording.
 *
 * The option labels are not here: age bands and genders are read on later screens
 * too, and the sun-reaction question and its six answers are the skin-tone card's
 * (`useStrings`); the district names and blurbs are the catalogue's. This carries
 * only the copy around them.
 *
 * The privacy line is the web's own, not the app's: the app says the photo stays on
 * the phone, the web says the frame stays in the browser, and each is true only of
 * itself. The camera is not called a webcam in the translations — on a phone it
 * is not one — which costs the line nothing it promises.
 */
import type { Tables } from './index'

const en = {
  title: 'A few details, then one photo.',
  subtitle:
    'Skin reads differently by age and history, so we ask first. Nothing is shared with a clinic until you book.',
  ageHeading: 'AGE RANGE',
  genderHeading: 'GENDER',
  districtHeading: 'WHERE ARE YOU STAYING?',
  /** Beside the district heading: why the district is asked. */
  districtNote: 'We match clinics within walking distance.',
  privacyNote: 'Your webcam frame stays in the browser and is discarded after the reading.',
  cta: 'Continue to camera',
}

export const FORM: Tables<typeof en> = {
  en,
  ko: {
    title: '간단한 정보를 알려 주시고, 사진 한 장만 찍으면 돼요.',
    subtitle:
      '같은 피부도 나이와 이력에 따라 다르게 읽히기 때문에 먼저 여쭤봐요. 예약하기 전까지 병원에는 아무것도 공유되지 않아요.',
    ageHeading: '나이대',
    genderHeading: '성별',
    districtHeading: '어디에 머무시나요?',
    districtNote: '걸어서 갈 수 있는 병원을 찾아 드려요.',
    privacyNote: '카메라로 찍은 사진은 브라우저 밖으로 나가지 않고, 진단이 끝나면 삭제돼요.',
    cta: '카메라로 넘어가기',
  },
  ja: {
    title: 'いくつか質問のあと、写真を1枚。',
    subtitle:
      '同じ肌の状態でも年齢や履歴で見方が変わるため、最初にお聞きしています。予約するまでクリニックに情報は渡りません。',
    ageHeading: '年代',
    genderHeading: '性別',
    districtHeading: '滞在エリア',
    districtNote: '歩いて行けるクリニックをご案内します。',
    privacyNote: 'カメラの映像はブラウザの外に出ず、診断が終わると破棄されます。',
    cta: 'カメラへ進む',
  },
  zh: {
    title: '先回答几个问题，再拍一张照片。',
    subtitle:
      '同样的皮肤状态，年龄和护肤经历不同，解读也会不同，所以我们会先问几个问题。在您预约之前，任何信息都不会提供给诊所。',
    ageHeading: '年龄段',
    genderHeading: '性别',
    districtHeading: '您住在哪个街区？',
    districtNote: '我们会为您匹配步行可达的诊所。',
    privacyNote: '摄像头拍下的画面只保留在浏览器中，检测结束后会被删除。',
    cta: '继续拍照',
  },
}
