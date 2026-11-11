// 动作名三语补充表（P4 新增）。
// 旧 App.vue 的翻译表是按旧数据库里的动作写的；P4 调整导入范围后新进来的动作在这里补齐。
// 键为小写英文原名，值为 [中文, 韩文]。
const EXTRA = {
  // 胸
  'close-grip barbell bench press': ['窄握杠铃卧推', '클로즈 그립 바벨 벤치 프레스'],
  'dips - chest version': ['双杠臂屈伸（胸部版）', '딥스 (가슴 버전)'],
  'dumbbell flyes': ['哑铃飞鸟', '덤벨 플라이'],
  pushups: ['俯卧撑', '푸시업'],

  // 肩前束
  'front dumbbell raise': ['哑铃前平举', '프론트 덤벨 레이즈'],
  'smith machine overhead shoulder press': ['史密斯机肩上推举', '스미스 머신 오버헤드 숄더 프레스'],
  'arnold dumbbell press': ['阿诺德哑铃推举', '아놀드 덤벨 프레스'],
  'kettlebell arnold press': ['壶铃阿诺德推举', '케틀벨 아놀드 프레스'],
  'anti-gravity press': ['俯身杠铃推举', '안티 그래비티 프레스'],
  'bradford/rocky presses': ['布拉德福德推举', '브래드포드 프레스'],
  'barbell shoulder press': ['杠铃肩上推举', '바벨 숄더 프레스'],
  'dumbbell shoulder press': ['哑铃肩上推举', '덤벨 숄더 프레스'],

  // 肩中束
  'bent over low-pulley side lateral': ['俯身低位绳索侧平举', '벤트오버 로우 풀리 사이드 레터럴'],
  'one-arm side laterals': ['单臂哑铃侧平举', '원암 사이드 레터럴 레이즈'],
  'seated side lateral raise': ['坐姿哑铃侧平举', '시티드 사이드 레터럴 레이즈'],
  'side lateral raise': ['站姿哑铃侧平举', '사이드 레터럴 레이즈'],
  'side laterals to front raise': ['侧平举接前平举', '사이드 레터럴 투 프론트 레이즈'],
  'cable seated lateral raise': ['坐姿绳索侧平举', '케이블 시티드 레터럴 레이즈'],
  'lateral raise - with bands': ['弹力带侧平举', '밴드 레터럴 레이즈'],
  'lying one-arm lateral raise': ['侧卧单臂侧平举', '라잉 원암 레터럴 레이즈'],
  'one-arm incline lateral raise': ['上斜单臂侧平举', '원암 인클라인 레터럴 레이즈'],

  // 肩后束
  'dumbbell lying one-arm rear lateral raise': ['俯卧单臂哑铃后束平举', '라잉 원암 덤벨 리어 레터럴 레이즈'],
  'dumbbell lying rear lateral raise': ['俯卧哑铃后束平举', '라잉 덤벨 리어 레터럴 레이즈'],

  // 肱二头肌
  'incline inner biceps curl': ['上斜哑铃内侧弯举', '인클라인 이너 바이셉스 컬'],
  'seated dumbbell inner biceps curl': ['坐姿哑铃内侧弯举', '시티드 덤벨 이너 바이셉스 컬'],
  'standing biceps cable curl': ['站姿绳索弯举', '스탠딩 케이블 바이셉스 컬'],
  'machine bicep curl': ['器械弯举', '머신 바이셉스 컬'],
  'machine preacher curls': ['器械牧师凳弯举', '머신 프리처 컬'],
  'standing inner-biceps curl': ['站姿哑铃内侧弯举', '스탠딩 이너 바이셉스 컬'],
  'dumbbell bicep curl': ['哑铃弯举', '덤벨 바이셉스 컬'],
  'hammer curls': ['锤式弯举', '해머 컬'],

  // 肱三头肌
  'cable incline triceps extension': ['上斜绳索臂屈伸', '케이블 인클라인 트라이셉스 익스텐션'],
  'cable lying triceps extension': ['仰卧绳索臂屈伸', '케이블 라잉 트라이셉스 익스텐션'],
  'decline dumbbell triceps extension': ['下斜哑铃臂屈伸', '디클라인 덤벨 트라이셉스 익스텐션'],
  'decline ez bar triceps extension': ['下斜曲杆臂屈伸', '디클라인 EZ 바 트라이셉스 익스텐션'],
  'cable rope overhead triceps extension': ['绳索过顶臂屈伸', '케이블 로프 오버헤드 트라이셉스 익스텐션'],
  'dips - triceps version': ['双杠臂屈伸（三头版）', '딥스 (삼두 버전)'],
  'ez-bar skullcrusher': ['曲杆仰卧臂屈伸', 'EZ 바 스컬 크러셔'],
  'triceps pushdown': ['绳索下压', '트라이셉스 푸시다운'],

  // 小臂
  'cable wrist curl': ['绳索腕弯举', '케이블 리스트 컬'],
  'palms-down dumbbell wrist curl over a bench': ['凳上哑铃反握腕弯举', '벤치 덤벨 리버스 리스트 컬'],
  'palms-down wrist curl over a bench': ['凳上杠铃反握腕弯举', '벤치 바벨 리버스 리스트 컬'],
  'palms-up barbell wrist curl over a bench': ['凳上杠铃腕弯举', '벤치 바벨 리스트 컬'],
  'palms-up dumbbell wrist curl over a bench': ['凳上哑铃腕弯举', '벤치 덤벨 리스트 컬'],
  'seated dumbbell palms-down wrist curl': ['坐姿哑铃反握腕弯举', '시티드 덤벨 리버스 리스트 컬'],

  // 腹肌
  'decline reverse crunch': ['下斜反向卷腹', '디클라인 리버스 크런치'],
  'kneeling cable crunch with alternating oblique twists': ['跪姿绳索交替转体卷腹', '닐링 케이블 오블리크 트위스트 크런치'],
  'bent-knee hip raise': ['屈膝举臀', '벤트 니 힙 레이즈'],
  'knee/hip raise on parallel bars': ['双杠举膝', '평행봉 니 레이즈'],
  'cross-body crunch': ['交叉卷腹', '크로스 바디 크런치'],
  'decline oblique crunch': ['下斜侧腹卷腹', '디클라인 오블리크 크런치'],
  crunches: ['卷腹', '크런치'],
  'hanging leg raise': ['悬垂举腿', '행잉 레그 레이즈'],
  plank: ['平板支撑', '플랭크'],

  // 斜方肌
  'barbell shrug': ['杠铃耸肩', '바벨 슈러그'],
  'cable shrugs': ['绳索耸肩', '케이블 슈러그'],
  'dumbbell shrug': ['哑铃耸肩', '덤벨 슈러그'],
  'barbell shrug behind the back': ['背后杠铃耸肩', '비하인드 백 바벨 슈러그'],
  'leverage shrug': ['杠杆器械耸肩', '레버리지 슈러그'],
  'calf-machine shoulder shrug': ['提踵机耸肩', '카프 머신 숄더 슈러그'],

  // 竖脊肌
  'stiff leg barbell good morning': ['直腿杠铃早安式', '스티프 레그 바벨 굿모닝'],
  'hyperextensions (back extensions)': ['山羊挺身', '백 익스텐션'],
  'hyperextensions with no hyperextension bench': ['平凳山羊挺身', '벤치 백 익스텐션'],
  'good morning': ['杠铃早安式', '굿모닝'],
  'good morning off pins': ['架上杠铃早安式', '핀 굿모닝'],
  'hanging bar good morning': ['悬挂杠铃早安式', '행잉 바 굿모닝'],

  // 背阔肌
  'close-grip front lat pulldown': ['窄握高位下拉', '클로즈 그립 랫 풀다운'],
  'one arm lat pulldown': ['单臂高位下拉', '원암 랫 풀다운'],
  'wide-grip lat pulldown': ['宽握高位下拉', '와이드 그립 랫 풀다운'],
  'full range-of-motion lat pulldown': ['全程高位下拉', '풀 레인지 랫 풀다운'],
  'kneeling high pulley row': ['跪姿高位绳索划船', '닐링 하이 풀리 로우'],
  'kneeling single-arm high pulley row': ['跪姿单臂高位绳索划船', '닐링 원암 하이 풀리 로우'],
  'bent over barbell row': ['俯身杠铃划船', '벤트오버 바벨 로우'],
  'chin-up': ['反握引体向上', '친업'],
  pullups: ['引体向上', '풀업'],
  'seated cable rows': ['坐姿绳索划船', '시티드 케이블 로우'],

  // 臀
  'single leg glute bridge': ['单腿臀桥', '싱글 레그 글루트 브리지'],
  'physioball hip bridge': ['健身球臀桥', '짐볼 힙 브리지'],
  'glute kickback': ['跪姿后踢腿', '글루트 킥백'],
  'butt lift (bridge)': ['臀桥', '힙 브리지'],

  // 大腿前侧
  'barbell side split squat': ['杠铃侧向分腿蹲', '바벨 사이드 스플릿 스쿼트'],
  'bodyweight squat': ['徒手深蹲', '맨몸 스쿼트'],
  'chair squat': ['史密斯机坐姿深蹲', '체어 스쿼트'],
  'dumbbell squat': ['哑铃深蹲', '덤벨 스쿼트'],
  'hack squat': ['哈克深蹲', '핵 스쿼트'],
  'dumbbell lunges': ['哑铃箭步蹲', '덤벨 런지'],
  'leg extensions': ['腿屈伸', '레그 익스텐션'],
  'leg press': ['腿举', '레그 프레스'],

  // 大腿后侧
  'smith machine stiff-legged deadlift': ['史密斯机直腿硬拉', '스미스 머신 스티프 레그 데드리프트'],
  'stiff-legged dumbbell deadlift': ['哑铃直腿硬拉', '스티프 레그 덤벨 데드리프트'],
  'romanian deadlift': ['罗马尼亚硬拉', '루마니안 데드리프트'],
  'stiff-legged barbell deadlift': ['杠铃直腿硬拉', '스티프 레그 바벨 데드리프트'],
  'cable deadlifts': ['绳索硬拉', '케이블 데드리프트'],
  'leverage deadlift': ['杠杆器械硬拉', '레버리지 데드리프트'],
  'barbell deadlift': ['杠铃硬拉', '바벨 데드리프트'],
  'lying leg curls': ['俯卧腿弯举', '라잉 레그 컬'],

  // 小腿
  'barbell seated calf raise': ['坐姿杠铃提踵', '바벨 시티드 카프 레이즈'],
  'calf press': ['器械提踵', '카프 프레스'],
  'dumbbell seated one-leg calf raise': ['坐姿单腿哑铃提踵', '시티드 원레그 덤벨 카프 레이즈'],
  'rocking standing calf raise': ['站姿摇摆提踵', '로킹 스탠딩 카프 레이즈'],
  'seated calf raise': ['坐姿提踵', '시티드 카프 레이즈'],
  'standing calf raises': ['站姿提踵', '스탠딩 카프 레이즈'],
  'smith machine calf raise': ['史密斯机提踵', '스미스 머신 카프 레이즈'],
}

export const EXTRA_NAME_TRANSLATIONS = {
  zh: Object.fromEntries(Object.entries(EXTRA).map(([name, [zh]]) => [name, zh])),
  ko: Object.fromEntries(Object.entries(EXTRA).map(([name, [, ko]]) => [name, ko])),
}
