/**
 * The care guide for each checkup condition: what a flagged number means, which
 * tests and care to ask a doctor about, everyday steps, and when not to wait.
 *
 * Written to inform a conversation with a doctor, never to replace it — no doses,
 * no drug names, no promises. The numbers quoted are the lines in `health/items.ts`
 * and must move with them.
 */
import type { ConditionId } from '../health/items'
import type { Tables } from './index'

export interface CareGuide {
  meaning: string
  tests: { name: string; why: string }[]
  everyday: string[]
  soon: string
}

const en: Record<ConditionId, CareGuide> = {
  bp: {
    meaning:
      'Blood pressure from 120/80 up is elevated, and from 140/90 the sheet marks hypertension as suspected. One reading runs high with nerves, coffee or a rushed arrival, so a diagnosis rests on repeated measurements, not on one day.',
    tests: [
      { name: 'Home or 24-hour blood pressure monitoring', why: 'Readings across ordinary days show whether the number is real or just the clinic’s.' },
      { name: 'ECG', why: 'Checks whether raised pressure has started to strain the heart.' },
      { name: 'Blood and urine tests', why: 'Kidney function, salts and urine protein — pressure affects them, and they affect pressure.' },
    ],
    everyday: [
      'Cut salt to under 5 g a day, about a teaspoon. Soups, stews and kimchi add up quickly.',
      'About 150 minutes a week of brisk walking or similar.',
      'Drink less alcohol, and stop smoking.',
    ],
    soon: 'A reading of 180/120 or more with a severe headache, chest pain, breathlessness, blurred vision or weakness on one side needs emergency care — call 119.',
  },
  glucose: {
    meaning:
      'A fasting glucose of 100–125 mg/dL is impaired fasting glucose, often called prediabetes; from 126 the sheet marks diabetes as suspected. A second test, usually HbA1c, confirms it before anything is called diabetes.',
    tests: [
      { name: 'HbA1c', why: 'Your average blood sugar over the last two to three months, unaffected by one meal.' },
      { name: 'Repeat fasting glucose or a glucose tolerance test', why: 'Confirms the first number and shows how your body handles sugar.' },
      { name: 'If confirmed: eye, kidney and foot checks', why: 'Where high sugar does its damage quietly, caught early.' },
    ],
    everyday: [
      'If you carry extra weight, losing 5–7% of it measurably lowers the risk.',
      'Swap sugary drinks, white rice and white bread for water and whole grains.',
      'Move after meals — even a 15-minute walk blunts the rise.',
    ],
    soon: 'Strong thirst, passing urine often, weight loss you cannot explain or blurred vision are reasons to be seen within days.',
  },
  lipids: {
    meaning:
      'LDL from 160, total cholesterol from 240, triglycerides from 200 or HDL under 40 mg/dL is the range the sheet marks as dyslipidemia suspected. It causes no symptoms; what it changes is how fast plaque builds in the arteries over years.',
    tests: [
      { name: 'Repeat fasting lipid panel', why: 'Triglycerides in particular swing with the last meal and drink.' },
      { name: 'Cardiovascular risk assessment', why: 'Age, blood pressure, sugar and smoking decide how low LDL should be, and whether medicine helps.' },
      { name: 'Carotid ultrasound', why: 'A painless look at the neck arteries for plaque, when your doctor suggests it.' },
    ],
    everyday: [
      'Less fatty meat, butter, fried food and pastry; more fish, beans, vegetables and oats.',
      'For high triglycerides, alcohol and sugar come first.',
      'Regular aerobic exercise raises HDL.',
    ],
    soon: 'Chest pain or pressure, or sudden weakness, numbness or slurred speech, is an emergency — call 119.',
  },
  liver: {
    meaning:
      'AST and ALT rise when liver cells are under strain — most often from fatty liver, alcohol, some medicines or supplements, or viral hepatitis. γ-GTP rises with alcohol and with bile-duct problems. Mild rises are common and often reversible, but the cause should be found.',
    tests: [
      { name: 'Abdominal ultrasound', why: 'Shows fatty liver, and the gallbladder and bile ducts.' },
      { name: 'Hepatitis B and C tests', why: 'Common, treatable causes that are simple to rule out.' },
      { name: 'Repeat liver tests after a break from alcohol', why: 'Whether the numbers settle helps tell the causes apart.' },
    ],
    everyday: [
      'No alcohol until you are rechecked.',
      'For fatty liver, gradual weight loss is the treatment.',
      'Bring every medicine and supplement you take to the appointment.',
    ],
    soon: 'Yellowing skin or eyes, dark urine, pale stools or pain under the right ribs should be seen promptly.',
  },
  kidney: {
    meaning:
      'A creatinine above 1.5 mg/dL or an eGFR under 60 suggests the kidneys are filtering less than they should. Dehydration, a hard workout or a lot of muscle can shift these numbers, so a repeat test comes before any conclusion.',
    tests: [
      { name: 'Repeat creatinine and eGFR', why: 'Kidney function is judged on a pattern over about three months.' },
      { name: 'Urine albumin and urinalysis', why: 'Protein in the urine is often the earliest sign.' },
      { name: 'Kidney ultrasound', why: 'The size and structure of the kidneys.' },
    ],
    everyday: [
      'Keep blood pressure and blood sugar in range — they are the two commonest causes.',
      'Avoid regular painkillers such as ibuprofen without a doctor’s advice.',
      'Go easy on salt, and drink water through the day.',
    ],
    soon: 'Swelling of the legs or face, passing much less urine, or breathlessness needs prompt care.',
  },
  blood: {
    meaning:
      'Low hemoglobin is anemia. Common causes are iron deficiency, heavy periods and slow bleeding from the stomach or bowel — which is why a cause is always looked for. A high value more often follows dehydration or smoking, and occasionally a bone-marrow condition.',
    tests: [
      { name: 'Complete blood count', why: 'The size and number of red cells point toward a cause.' },
      { name: 'Iron, ferritin, B12 and folate', why: 'Whether the body is short of what it needs to make blood.' },
      { name: 'Gastroscopy or colonoscopy', why: 'Suggested when bleeding is suspected, especially in men and after 40.' },
    ],
    everyday: [
      'Iron-rich food — red meat, beans, leafy greens — with vitamin C helps it absorb.',
      'Do not start iron tablets before the cause is known; they can hide it.',
    ],
    soon: 'Black or bloody stools, fainting, chest pain or breathlessness at rest needs urgent care.',
  },
  weight: {
    meaning:
      'Korean guidelines count a BMI of 23–24.9 as overweight and 25 or more as obesity, and a waist of 90 cm (men) or 85 cm (women) as abdominal obesity — the kind that pushes blood pressure, sugar and lipids up together. A BMI under 18.5 is underweight, and worth a look too.',
    tests: [
      { name: 'Body composition analysis', why: 'Muscle and fat separately, which BMI cannot tell apart.' },
      { name: 'Metabolic check', why: 'Blood pressure, glucose, lipids and liver together — they move as a group.' },
      { name: 'Obesity clinic consultation', why: 'A plan, and whether medicine fits, decided with a doctor.' },
    ],
    everyday: [
      'Aim for about 0.5 kg a week; fast losses tend to come back.',
      'Protein and vegetables first at each meal.',
      'Strength training twice a week alongside walking, and enough sleep.',
    ],
    soon: 'Loud snoring with pauses in breathing, or heavy daytime sleepiness — ask about sleep apnea.',
  },
}

export const CARE: Tables<Record<ConditionId, CareGuide>> = {
  en,
  ko: {
    bp: {
      meaning:
        '혈압이 120/80 이상이면 높은 편이고, 140/90 이상이면 결과지에 고혈압 의심으로 표시돼요. 긴장하거나 커피를 마셨거나 급히 도착하면 한 번의 측정값은 높게 나올 수 있어서, 진단은 하루의 숫자가 아니라 여러 번 잰 값으로 내려요.',
      tests: [
        { name: '가정 혈압 또는 24시간 활동 혈압 측정', why: '평소 생활 속에서 잰 값으로 진짜 높은지, 병원에서만 높은지 가려요.' },
        { name: '심전도', why: '높은 혈압이 심장에 부담을 주기 시작했는지 확인해요.' },
        { name: '혈액·소변 검사', why: '신장 기능, 전해질, 소변 단백을 봐요. 혈압과 서로 영향을 주고받는 항목이에요.' },
      ],
      everyday: [
        '소금은 하루 5 g(약 한 티스푼) 미만으로 줄여요. 국, 찌개, 김치에서 금방 채워져요.',
        '빠르게 걷기 같은 운동을 일주일에 150분 정도 해요.',
        '술은 줄이고, 담배는 끊어요.',
      ],
      soon: '혈압이 180/120 이상이면서 심한 두통, 가슴 통증, 숨참, 시야 흐림, 한쪽 팔다리 힘 빠짐이 있으면 예약이 아니라 응급 진료가 필요해요. 119에 연락하세요.',
    },
    glucose: {
      meaning:
        '공복혈당 100–125 mg/dL는 공복혈당장애(당뇨 전단계)이고, 126 이상이면 결과지에 당뇨병 의심으로 표시돼요. 당뇨병이라고 부르기 전에 보통 당화혈색소 같은 두 번째 검사로 확인해요.',
      tests: [
        { name: '당화혈색소(HbA1c)', why: '한 끼 식사와 상관없이 지난 2–3개월의 평균 혈당을 보여 줘요.' },
        { name: '공복혈당 재검사 또는 경구당부하검사', why: '첫 수치를 확인하고, 몸이 당을 어떻게 처리하는지 봐요.' },
        { name: '당뇨로 확인되면: 눈, 신장, 발 검사', why: '높은 혈당이 조용히 손상을 주는 곳을 일찍 찾아요.' },
      ],
      everyday: [
        '체중이 많이 나간다면 5–7%만 줄여도 위험이 눈에 띄게 낮아져요.',
        '단 음료, 흰쌀밥, 흰 빵 대신 물과 통곡물을 골라요.',
        '식후에 움직여요. 15분만 걸어도 혈당이 덜 올라요.',
      ],
      soon: '심한 갈증, 잦은 소변, 이유 없는 체중 감소, 시야 흐림이 있으면 며칠 안에 진료를 받으세요.',
    },
    lipids: {
      meaning:
        'LDL 160 이상, 총콜레스테롤 240 이상, 중성지방 200 이상, 또는 HDL 40 mg/dL 미만이면 결과지에 이상지질혈증 의심으로 표시돼요. 증상은 없지만, 몇 년에 걸쳐 혈관에 찌꺼기(플라크)가 쌓이는 속도를 바꿔요.',
      tests: [
        { name: '공복 지질 검사 재검', why: '특히 중성지방은 직전 식사와 음주에 따라 크게 달라져요.' },
        { name: '심뇌혈관 위험도 평가', why: '나이, 혈압, 혈당, 흡연에 따라 LDL 목표치와 약이 도움이 되는지가 정해져요.' },
        { name: '경동맥 초음파', why: '의사가 권하면, 목 혈관의 플라크를 통증 없이 확인해요.' },
      ],
      everyday: [
        '기름진 고기, 버터, 튀김, 빵·과자는 줄이고 생선, 콩, 채소, 귀리를 늘려요.',
        '중성지방이 높다면 술과 당부터 줄여요.',
        '꾸준한 유산소 운동은 HDL을 올려 줘요.',
      ],
      soon: '가슴 통증이나 압박감, 갑작스러운 마비·저림·말 어눌함은 응급 상황이에요. 119에 연락하세요.',
    },
    liver: {
      meaning:
        'AST와 ALT는 간세포가 부담을 받을 때 올라가요. 지방간, 음주, 일부 약이나 건강보조식품, 바이러스 간염이 흔한 원인이에요. 감마지티피는 음주나 담도 문제로 올라가요. 조금 높은 수치는 흔하고 되돌릴 수 있는 경우가 많지만, 원인은 꼭 찾아야 해요.',
      tests: [
        { name: '복부 초음파', why: '지방간과 함께 담낭, 담도도 볼 수 있어요.' },
        { name: 'B형·C형 간염 검사', why: '흔하고 치료할 수 있는 원인이라 쉽게 가려낼 수 있어요.' },
        { name: '금주 후 간 기능 재검사', why: '수치가 내려가는지 보면 원인을 구분하는 데 도움이 돼요.' },
      ],
      everyday: [
        '재검사 전까지는 술을 마시지 않아요.',
        '지방간이라면 천천히 체중을 줄이는 것이 치료예요.',
        '먹고 있는 약과 영양제를 모두 챙겨서 진료받으러 가요.',
      ],
      soon: '피부나 눈이 노래지거나, 소변이 진하거나, 변 색이 옅거나, 오른쪽 갈비뼈 아래가 아프면 바로 진료를 받으세요.',
    },
    kidney: {
      meaning:
        '크레아티닌이 1.5 mg/dL를 넘거나 신사구체여과율(eGFR)이 60 미만이면 신장이 걸러야 할 만큼 거르지 못하고 있을 수 있어요. 탈수, 격한 운동, 많은 근육량도 수치를 바꿀 수 있어서 결론 전에 재검사를 해요.',
      tests: [
        { name: '크레아티닌·eGFR 재검사', why: '신장 기능은 약 3개월에 걸친 변화로 판단해요.' },
        { name: '소변 알부민·소변 검사', why: '소변 속 단백이 가장 먼저 나타나는 신호인 경우가 많아요.' },
        { name: '신장 초음파', why: '신장의 크기와 구조를 확인해요.' },
      ],
      everyday: [
        '혈압과 혈당을 정상 범위로 유지해요. 가장 흔한 두 가지 원인이에요.',
        '이부프로펜 같은 진통제를 의사와 상의 없이 자주 먹지 않아요.',
        '짜게 먹지 않고, 물은 하루 동안 나눠 마셔요.',
      ],
      soon: '다리나 얼굴이 붓거나, 소변량이 크게 줄거나, 숨이 차면 바로 진료를 받으세요.',
    },
    blood: {
      meaning:
        '혈색소가 낮으면 빈혈이에요. 철분 부족, 많은 생리량, 위나 장에서 조금씩 나는 출혈이 흔한 원인이라서 항상 원인을 찾아요. 수치가 높은 경우는 탈수나 흡연 때문인 경우가 더 많고, 드물게 골수 질환일 수 있어요.',
      tests: [
        { name: '일반 혈액 검사(CBC)', why: '적혈구의 크기와 수로 원인의 방향을 잡아요.' },
        { name: '철분, 페리틴, 비타민 B12, 엽산', why: '피를 만드는 데 필요한 재료가 부족한지 봐요.' },
        { name: '위·대장 내시경', why: '출혈이 의심될 때 권해요. 특히 남성이나 40세 이후라면요.' },
      ],
      everyday: [
        '붉은 고기, 콩, 짙은 녹색 채소처럼 철분이 많은 음식을 비타민 C와 함께 먹으면 흡수가 잘돼요.',
        '원인을 알기 전에 철분제를 먼저 먹지 마세요. 원인을 가릴 수 있어요.',
      ],
      soon: '검거나 피가 섞인 변, 실신, 가슴 통증, 쉬고 있어도 숨이 차면 바로 진료가 필요해요.',
    },
    weight: {
      meaning:
        '국내 기준으로 체질량지수 23–24.9는 과체중, 25 이상은 비만이고, 허리둘레 남성 90 cm·여성 85 cm 이상은 복부비만이에요. 허리에 쌓이는 지방은 혈압, 혈당, 지질을 함께 끌어올려요. 체질량지수 18.5 미만인 저체중도 살펴볼 만해요.',
      tests: [
        { name: '체성분 검사', why: '체질량지수로는 구분하지 못하는 근육과 지방을 따로 봐요.' },
        { name: '대사 검사', why: '혈압, 혈당, 지질, 간 수치를 함께 봐요. 함께 움직이는 항목이에요.' },
        { name: '비만 클리닉 상담', why: '계획과 약이 맞는지를 의사와 함께 정해요.' },
      ],
      everyday: [
        '일주일에 0.5 kg 정도를 목표로 해요. 빨리 뺀 체중은 돌아오기 쉬워요.',
        '끼니마다 단백질과 채소를 먼저 먹어요.',
        '걷기와 함께 주 2회 근력 운동을 하고, 잠을 충분히 자요.',
      ],
      soon: '코골이가 심하고 숨이 멈추는 듯하거나 낮에 많이 졸리다면 수면무호흡 검사를 문의해 보세요.',
    },
  },
  ja: {
    bp: {
      meaning:
        '血圧は120/80以上でやや高め、140/90以上で結果票に高血圧の疑いと記されます。緊張やコーヒー、急いで来院したことで1回の値は高く出るため、診断は1日の数値ではなく繰り返しの測定で行います。',
      tests: [
        { name: '家庭血圧または24時間血圧測定', why: '普段の生活での値から、本当に高いのか診察室だけで高いのかを見分けます。' },
        { name: '心電図', why: '高い血圧が心臓に負担をかけ始めていないかを確認します。' },
        { name: '血液・尿検査', why: '腎機能、電解質、尿たんぱく。血圧と互いに影響し合う項目です。' },
      ],
      everyday: [
        '塩分は1日5 g（小さじ約1杯）未満に。スープや鍋、キムチですぐに届きます。',
        '早歩きなどの運動を週に150分ほど。',
        'お酒を減らし、禁煙を。',
      ],
      soon: '180/120以上で激しい頭痛、胸の痛み、息切れ、視界のかすみ、片側の手足の脱力がある場合は救急受診が必要です。119番へ。',
    },
    glucose: {
      meaning:
        '空腹時血糖100–125 mg/dLは空腹時血糖異常（糖尿病予備群）、126以上で結果票に糖尿病の疑いと記されます。糖尿病と判断する前に、通常はHbA1cなど2回目の検査で確かめます。',
      tests: [
        { name: 'HbA1c', why: '1回の食事に左右されない、過去2〜3か月の平均血糖です。' },
        { name: '空腹時血糖の再検査またはブドウ糖負荷試験', why: '最初の値を確かめ、体が糖をどう処理しているかを見ます。' },
        { name: '確定した場合：眼・腎臓・足の検査', why: '高血糖が静かに傷つける部位を早めに見つけます。' },
      ],
      everyday: [
        '体重が多めなら、5〜7%減らすだけでリスクがはっきり下がります。',
        '甘い飲み物や白米・白いパンを、水や全粒穀物に。',
        '食後に体を動かす。15分歩くだけでも上昇が緩やかになります。',
      ],
      soon: '強いのどの渇き、頻尿、説明のつかない体重減少、視界のかすみがあれば数日以内に受診を。',
    },
    lipids: {
      meaning:
        'LDL 160以上、総コレステロール240以上、中性脂肪200以上、またはHDL 40 mg/dL未満は、結果票で脂質異常症の疑いとされる範囲です。症状はありませんが、何年もかけて血管にプラークがたまる速さを変えます。',
      tests: [
        { name: '空腹時の脂質検査の再検査', why: '特に中性脂肪は直前の食事や飲酒で大きく変わります。' },
        { name: '心血管リスク評価', why: '年齢、血圧、血糖、喫煙で、LDLの目標値や薬が役立つかが決まります。' },
        { name: '頸動脈エコー', why: '医師が勧めた場合、首の血管のプラークを痛みなく確認します。' },
      ],
      everyday: [
        '脂身の多い肉、バター、揚げ物、菓子パンを減らし、魚、豆、野菜、オーツ麦を増やす。',
        '中性脂肪が高いなら、まずお酒と糖分から。',
        '定期的な有酸素運動はHDLを上げます。',
      ],
      soon: '胸の痛みや圧迫感、急な脱力・しびれ・ろれつが回らない症状は救急です。119番へ。',
    },
    liver: {
      meaning:
        'ASTとALTは肝細胞に負担がかかると上がります。脂肪肝、飲酒、一部の薬やサプリメント、ウイルス性肝炎がよくある原因です。γ-GTPは飲酒や胆道の問題で上がります。軽い上昇はよくあり元に戻ることも多いですが、原因は確かめるべきです。',
      tests: [
        { name: '腹部エコー', why: '脂肪肝に加え、胆のうや胆管も見られます。' },
        { name: 'B型・C型肝炎の検査', why: 'よくある治療可能な原因で、簡単に除外できます。' },
        { name: '禁酒後の肝機能の再検査', why: '数値が下がるかどうかで原因を見分けやすくなります。' },
      ],
      everyday: [
        '再検査まではお酒を控える。',
        '脂肪肝なら、ゆっくり体重を減らすことが治療です。',
        '飲んでいる薬とサプリメントをすべて受診時に持参する。',
      ],
      soon: '皮膚や白目が黄色い、尿が濃い、便の色が薄い、右の肋骨の下が痛い場合は早めに受診を。',
    },
    kidney: {
      meaning:
        'クレアチニンが1.5 mg/dLを超える、またはeGFRが60未満の場合、腎臓のろ過が十分でない可能性があります。脱水や激しい運動、筋肉量の多さでも数値が動くため、結論の前に再検査をします。',
      tests: [
        { name: 'クレアチニン・eGFRの再検査', why: '腎機能は約3か月の推移で判断します。' },
        { name: '尿アルブミン・尿検査', why: '尿たんぱくが最初のサインであることが多いです。' },
        { name: '腎臓エコー', why: '腎臓の大きさと形を確認します。' },
      ],
      everyday: [
        '血圧と血糖を正常範囲に。最も多い2つの原因です。',
        'イブプロフェンなどの鎮痛薬を医師に相談せず常用しない。',
        '塩分を控え、水は1日を通してこまめに。',
      ],
      soon: '脚や顔のむくみ、尿量の大幅な減少、息切れがあれば早めに受診を。',
    },
    blood: {
      meaning:
        'ヘモグロビンが低いと貧血です。鉄不足、月経量の多さ、胃や腸からの少しずつの出血がよくある原因なので、必ず原因を調べます。高い場合は脱水や喫煙によることが多く、まれに骨髄の病気のこともあります。',
      tests: [
        { name: '血算（CBC）', why: '赤血球の大きさと数から原因の方向を絞ります。' },
        { name: '鉄、フェリチン、ビタミンB12、葉酸', why: '血をつくる材料が足りているかを見ます。' },
        { name: '胃・大腸内視鏡', why: '出血が疑われるとき、特に男性や40歳以降で勧められます。' },
      ],
      everyday: [
        '赤身肉、豆、濃い緑の野菜など鉄分の多い食品をビタミンCと一緒に摂ると吸収が良くなります。',
        '原因がわかる前に鉄剤を始めないこと。原因を隠してしまうことがあります。',
      ],
      soon: '黒い便や血の混じった便、失神、胸の痛み、安静時の息切れは至急受診を。',
    },
    weight: {
      meaning:
        '韓国の基準ではBMI 23–24.9が過体重、25以上が肥満、腹囲が男性90 cm・女性85 cm以上で腹部肥満です。お腹まわりの脂肪は血圧・血糖・脂質をまとめて押し上げます。BMI 18.5未満の低体重も確認する価値があります。',
      tests: [
        { name: '体組成検査', why: 'BMIでは区別できない筋肉と脂肪を別々に見ます。' },
        { name: '代謝の検査', why: '血圧、血糖、脂質、肝機能をまとめて。連動して動く項目です。' },
        { name: '肥満外来での相談', why: '計画と、薬が合うかどうかを医師と決めます。' },
      ],
      everyday: [
        '週0.5 kgほどを目安に。急な減量は戻りやすいです。',
        '毎食、たんぱく質と野菜を先に。',
        'ウォーキングに加えて週2回の筋トレ、そして十分な睡眠。',
      ],
      soon: '大きないびきで呼吸が止まる、日中ひどく眠い場合は睡眠時無呼吸の検査について相談を。',
    },
  },
  zh: {
    bp: {
      meaning:
        '血压达到120/80以上属于偏高，达到140/90以上时，体检报告会标注为疑似高血压。紧张、喝咖啡或匆忙赶到都会让单次读数偏高，因此诊断依据的是多次测量，而不是某一天的数字。',
      tests: [
        { name: '家庭血压或24小时动态血压监测', why: '用日常生活中的读数判断血压是真的高，还是只在诊室里高。' },
        { name: '心电图', why: '检查升高的血压是否已开始加重心脏负担。' },
        { name: '血液和尿液检查', why: '肾功能、电解质和尿蛋白——它们与血压相互影响。' },
      ],
      everyday: [
        '每天盐摄入少于5克（约一茶匙）。汤、炖菜和泡菜很快就会超量。',
        '每周约150分钟快走或类似运动。',
        '少喝酒，戒烟。',
      ],
      soon: '血压达到180/120以上，并伴有剧烈头痛、胸痛、气短、视物模糊或一侧肢体无力时，需要急诊——请拨打119。',
    },
    glucose: {
      meaning:
        '空腹血糖100–125 mg/dL属于空腹血糖受损（常称糖尿病前期）；126以上时报告会标注为疑似糖尿病。确诊前通常会用糖化血红蛋白等第二项检查来确认。',
      tests: [
        { name: '糖化血红蛋白（HbA1c）', why: '反映过去两三个月的平均血糖，不受某一餐影响。' },
        { name: '复查空腹血糖或做糖耐量试验', why: '确认第一次的数值，并了解身体处理糖的能力。' },
        { name: '确诊后：眼底、肾脏和足部检查', why: '及早发现高血糖悄悄造成损伤的部位。' },
      ],
      everyday: [
        '如果体重偏高，减掉5–7%就能明显降低风险。',
        '用水和全谷物代替含糖饮料、白米饭和白面包。',
        '饭后活动一下——哪怕走15分钟也能减缓血糖上升。',
      ],
      soon: '出现明显口渴、尿频、不明原因的体重下降或视物模糊时，请在几天内就诊。',
    },
    lipids: {
      meaning:
        'LDL达到160、总胆固醇达到240、甘油三酯达到200，或HDL低于40 mg/dL，报告会标注为疑似血脂异常。它没有症状，但会影响多年间动脉斑块积累的速度。',
      tests: [
        { name: '复查空腹血脂', why: '尤其是甘油三酯，会随上一餐和饮酒大幅波动。' },
        { name: '心血管风险评估', why: '年龄、血压、血糖和吸烟情况决定LDL该降到多少，以及药物是否有帮助。' },
        { name: '颈动脉超声', why: '在医生建议时，无痛地查看颈部动脉有无斑块。' },
      ],
      everyday: [
        '少吃肥肉、黄油、油炸食品和糕点；多吃鱼、豆类、蔬菜和燕麦。',
        '甘油三酯高时，先从酒和糖减起。',
        '规律的有氧运动可以提高HDL。',
      ],
      soon: '胸痛或胸闷，或突然无力、麻木、说话含糊，属于急症——请拨打119。',
    },
    liver: {
      meaning:
        '肝细胞受到压力时，AST和ALT会升高——最常见的原因是脂肪肝、饮酒、某些药物或保健品，以及病毒性肝炎。γ-GT会因饮酒和胆道问题升高。轻度升高很常见，且往往可以恢复，但应查明原因。',
      tests: [
        { name: '腹部超声', why: '可以看到脂肪肝，以及胆囊和胆管。' },
        { name: '乙肝和丙肝检查', why: '常见且可治疗的病因，很容易排除。' },
        { name: '戒酒一段时间后复查肝功能', why: '数值是否回落有助于区分病因。' },
      ],
      everyday: [
        '复查之前不要饮酒。',
        '如果是脂肪肝，逐步减重就是治疗。',
        '就诊时带上正在服用的所有药物和保健品。',
      ],
      soon: '皮肤或眼白发黄、尿色深、大便颜色浅，或右侧肋下疼痛时，请尽快就诊。',
    },
    kidney: {
      meaning:
        '肌酐高于1.5 mg/dL或eGFR低于60，提示肾脏的过滤能力可能不足。脱水、剧烈运动或肌肉量大也会影响这些数值，因此在下结论前会先复查。',
      tests: [
        { name: '复查肌酐和eGFR', why: '肾功能要根据约三个月的变化来判断。' },
        { name: '尿白蛋白和尿常规', why: '尿中出现蛋白往往是最早的信号。' },
        { name: '肾脏超声', why: '查看肾脏的大小和结构。' },
      ],
      everyday: [
        '把血压和血糖控制在正常范围——它们是最常见的两个原因。',
        '未经医生建议，不要经常服用布洛芬等止痛药。',
        '少盐，全天分次喝水。',
      ],
      soon: '腿部或面部浮肿、尿量明显减少或气短时，请尽快就诊。',
    },
    blood: {
      meaning:
        '血红蛋白低就是贫血。常见原因包括缺铁、月经量多，以及胃肠道的慢性少量出血——所以一定要查明原因。数值偏高更常见于脱水或吸烟，偶尔与骨髓疾病有关。',
      tests: [
        { name: '血常规', why: '红细胞的大小和数量可以指向病因。' },
        { name: '铁、铁蛋白、维生素B12和叶酸', why: '查看身体是否缺少造血所需的原料。' },
        { name: '胃镜或肠镜', why: '怀疑出血时建议进行，尤其是男性和40岁以后。' },
      ],
      everyday: [
        '红肉、豆类、深绿色蔬菜等富含铁的食物，搭配维生素C更易吸收。',
        '在查明原因之前不要先吃铁剂，它可能掩盖病因。',
      ],
      soon: '黑便或便血、晕厥、胸痛或静息时气短，需要紧急就医。',
    },
    weight: {
      meaning:
        '按照韩国标准，BMI 23–24.9为超重，25及以上为肥胖；男性腰围90厘米、女性85厘米及以上为腹型肥胖——这种脂肪会同时推高血压、血糖和血脂。BMI低于18.5属于偏瘦，也值得关注。',
      tests: [
        { name: '人体成分分析', why: '分别查看肌肉和脂肪，这是BMI无法区分的。' },
        { name: '代谢检查', why: '同时查看血压、血糖、血脂和肝功能——它们往往一起变化。' },
        { name: '肥胖门诊咨询', why: '与医生一起制定计划，并判断是否适合用药。' },
      ],
      everyday: [
        '以每周减0.5公斤左右为目标；减得太快容易反弹。',
        '每餐先吃蛋白质和蔬菜。',
        '在步行之外每周做两次力量训练，并保证充足睡眠。',
      ],
      soon: '打鼾声大且有呼吸暂停，或白天非常困倦——请咨询睡眠呼吸暂停检查。',
    },
  },
}
