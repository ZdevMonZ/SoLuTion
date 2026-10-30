/**
 * 04 Webcam capture — the screen's chrome: its title, the panel that stands in for
 * a camera that cannot open, the viewfinder's chips and the shutter row.
 *
 * The sentences that answer the detector and the gate — the blink prompts, the
 * rejection dialog, the lighting tip, the skip link — are `CAPTURE` in
 * `data/strings.ts`, where they were before the screen had a table of its own;
 * hence `CAPTURE_SCREEN` here, so the screen can hold both.
 *
 * The guide is the outline in every language — 가이드라인 / 枠 / 框 — as the
 * reading's caveats name it. Chinese says 摄像头, the word a browser's own camera
 * prompt uses; 相机 reads as a handheld camera.
 */
import type { Tables } from './index'

const en = {
  title: 'Line your face up inside the outline.',
  /**
   * The panel in place of the viewfinder: access refused (`denied`), or no camera
   * the browser could open (`unavailable`). Each body names the way forward.
   */
  blocked: {
    denied: {
      title: 'Camera access is blocked',
      body: 'Your browser is holding the camera back. Click the camera icon in the address bar, choose Allow, then try again.',
    },
    unavailable: {
      title: 'No camera is available',
      body: 'This browser could not open a camera. You can upload a photo instead, or carry on without a capture and look around with a sample reading.',
    },
  },
  tryAgain: 'Try again',
  upload: 'Upload a photo instead',
  privacy:
    'Nothing is uploaded without your click. The frame is read in the browser and discarded once the reading finishes.',
  /** The chip in the viewfinder's corner, once the stream is up and before. */
  live: 'Webcam live',
  starting: 'Starting the camera…',
  /** The opposite corner, a caps label; the screen eases its tracking off for CJK. */
  localOnly: 'IN BROWSER ONLY',
  /**
   * The tip beside the shutter: a bold lead, then the reason. The lead carries the
   * space after it where its script wants one; a CJK full stop wants none.
   */
  lightLead: 'Face the light. ',
  lightBody: 'Avoid a window directly behind you — backlight flattens the reading.',
  retake: 'Retake',
  shoot: 'Capture',
  /** Under the buttons on a phone, which has no keys to name. */
  blinkHint: 'The shutter opens on a blink.',
  /** Under the buttons on a laptop: once the shutter is armed, and while it waits. */
  keysArmed: 'Shortcut: press Space to capture, R to restart the camera.',
  keysWaiting: 'The shutter opens on a blink. Press R to restart the camera.',
}

export const CAPTURE_SCREEN: Tables<typeof en> = {
  en,
  ko: {
    title: '얼굴을 가이드라인 안에 맞춰 주세요.',
    blocked: {
      denied: {
        title: '카메라 접근이 차단되어 있어요',
        body: "브라우저가 카메라 사용을 막고 있어요. 주소창의 카메라 아이콘을 눌러 '허용'을 선택한 뒤 다시 시도해 주세요.",
      },
      unavailable: {
        title: '사용할 수 있는 카메라가 없어요',
        body: '이 브라우저에서 카메라를 열지 못했어요. 대신 사진을 업로드하거나, 촬영 없이 예시 결과로 둘러볼 수 있어요.',
      },
    },
    tryAgain: '다시 시도',
    upload: '대신 사진 업로드하기',
    privacy:
      '직접 누르지 않는 한 아무것도 업로드되지 않아요. 사진은 브라우저 안에서 처리되고, 분석이 끝나면 삭제돼요.',
    live: '웹캠 연결됨',
    starting: '카메라를 켜는 중…',
    localOnly: '브라우저에서만 처리',
    lightLead: '빛을 마주 보세요. ',
    lightBody: '창문을 바로 등지고 앉지 마세요. 역광이면 피부 결이 잘 드러나지 않아요.',
    retake: '다시 촬영',
    shoot: '촬영',
    blinkHint: '눈을 깜빡이면 촬영돼요.',
    keysArmed: '단축키: Space 키로 촬영하고, R 키로 카메라를 다시 시작해요.',
    keysWaiting: '눈을 깜빡이면 촬영돼요. R 키를 누르면 카메라를 다시 시작해요.',
  },
  ja: {
    title: '枠の中に顔を合わせてください。',
    blocked: {
      denied: {
        title: 'カメラへのアクセスがブロックされています',
        body: 'ブラウザがカメラの使用を止めています。アドレスバーのカメラアイコンをクリックし、「許可する」を選んでから、もう一度お試しください。',
      },
      unavailable: {
        title: '使用できるカメラがありません',
        body: 'このブラウザではカメラを起動できませんでした。代わりに写真をアップロードするか、撮影せずにサンプルの結果で見てみることもできます。',
      },
    },
    tryAgain: 'もう一度試す',
    upload: '代わりに写真をアップロード',
    privacy:
      'クリックしない限り、何もアップロードされません。写真はブラウザの中で読み取られ、分析が終わると破棄されます。',
    live: 'ウェブカメラ起動中',
    starting: 'カメラを起動しています…',
    localOnly: 'ブラウザ内のみ',
    lightLead: '光のほうを向いてください。',
    lightBody: '窓を真後ろにするのは避けてください。逆光だと肌が平坦に写り、読み取りにくくなります。',
    retake: '撮り直す',
    shoot: '撮影',
    blinkHint: 'まばたきをするとシャッターが切れます。',
    keysArmed: 'ショートカット：Spaceキーで撮影、Rキーでカメラを再起動します。',
    keysWaiting: 'まばたきをするとシャッターが切れます。Rキーでカメラを再起動します。',
  },
  zh: {
    title: '请将面部对准框内。',
    blocked: {
      denied: {
        title: '摄像头访问被阻止',
        body: '浏览器阻止了摄像头访问。请点击地址栏中的摄像头图标，选择“允许”，然后重试。',
      },
      unavailable: {
        title: '没有可用的摄像头',
        body: '此浏览器无法打开摄像头。您可以改为上传照片，或者不拍照，先用示例结果看看。',
      },
    },
    tryAgain: '重试',
    upload: '改为上传照片',
    privacy: '除非您点击，否则不会上传任何内容。画面在浏览器中读取，分析结束后即被丢弃。',
    live: '摄像头已开启',
    starting: '正在启动摄像头…',
    localOnly: '仅在浏览器内处理',
    lightLead: '请面向光源。',
    lightBody: '避免背对窗户，逆光会让面部显得扁平，影响读取。',
    retake: '重拍',
    shoot: '拍摄',
    blinkHint: '眨一下眼就会拍摄。',
    keysArmed: '快捷键：按空格键拍摄，按 R 重启摄像头。',
    keysWaiting: '眨一下眼就会拍摄。按 R 可重启摄像头。',
  },
}
