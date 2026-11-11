// 动作名审校表（AI 审校，未经人工校对）。
// 按中国大陆健身房和韩国헬스장的常用叫法逐条检查了全部动作的中文名和韩文名。
// 这张表优先于 exerciseNames.js（旧翻译表）和 exerciseNamesExtra.js（P4 补充表）。
// 键为小写英文原名，值为 [中文, 韩文, 说明]。说明为空表示检查后未改。
// docs/translation-review.csv 由 scripts/export-translation-review.mjs 从这张表生成。
export const REVIEWED = {
  // ── 胸 ──
  'barbell bench press - medium grip': ['杠铃卧推', '바벨 벤치 프레스', '中握距是标准握法，日常不说"中握距"'],
  'barbell incline bench press - medium grip': ['上斜杠铃卧推', '인클라인 바벨 벤치 프레스', '同上，去掉"中握距"'],
  'close-grip barbell bench press': ['窄距杠铃卧推', '클로즈 그립 벤치 프레스', '大陆说"窄距"不说"窄握"；韩文省去"바벨"'],
  'decline barbell bench press': ['下斜杠铃卧推', '디클라인 바벨 벤치 프레스', ''],
  'decline dumbbell bench press': ['下斜哑铃卧推', '디클라인 덤벨 벤치 프레스', ''],
  'dumbbell bench press': ['哑铃卧推', '덤벨 벤치 프레스', ''],
  'dumbbell flyes': ['哑铃飞鸟', '덤벨 플라이', ''],
  'dips - chest version': ['双杠臂屈伸（胸部）', '딥스 (가슴)', '括号里的"版/버전"是直译，去掉'],
  pushups: ['俯卧撑', '푸시업', ''],

  // ── 肩前束 ──
  'barbell shoulder press': ['杠铃肩推', '바벨 오버헤드 프레스', '"肩上推举"是直译，常说"肩推"；韩国常说오버헤드 프레스(OHP)'],
  'dumbbell shoulder press': ['哑铃肩推', '덤벨 숄더 프레스', '中文改为"肩推"'],
  'smith machine overhead shoulder press': ['史密斯机肩推', '스미스 머신 숄더 프레스', '中文改为"肩推"；韩文去掉重复的오버헤드'],
  'alternating cable shoulder press': ['交替绳索肩推', '얼터네이트 케이블 숄더 프레스', '韩国헬스장用外来语얼터네이트，不说"교대"'],
  'arnold dumbbell press': ['阿诺德推举', '아놀드 프레스', '默认就是哑铃，不必写出'],
  'kettlebell arnold press': ['壶铃阿诺德推举', '케틀벨 아놀드 프레스', ''],
  'anti-gravity press': ['俯卧上斜杠铃推举', '인클라인 프론 바벨 프레스', '动作是俯卧在上斜凳上向前推杠铃；原译"俯身"不准确，韩文原为音译'],
  'bradford/rocky presses': ['布拉德福德推举', '브래드포드 프레스', ''],
  'front dumbbell raise': ['哑铃前平举', '덤벨 프론트 레이즈', '韩文词序调整为常用说法'],
  'single dumbbell raise': ['单哑铃前平举', '싱글 덤벨 프론트 레이즈', '韩文补上프론트，否则看不出是前平举'],

  // ── 肩中束 ──
  'side lateral raise': ['哑铃侧平举', '사이드 레터럴 레이즈', '最基础的侧平举，不需要"站姿"'],
  'seated side lateral raise': ['坐姿哑铃侧平举', '시티드 사이드 레터럴 레이즈', ''],
  'one-arm side laterals': ['单臂哑铃侧平举', '원암 사이드 레터럴 레이즈', ''],
  'one-arm incline lateral raise': ['上斜单臂侧平举', '원암 인클라인 레터럴 레이즈', ''],
  'lying one-arm lateral raise': ['侧卧单臂侧平举', '라잉 원암 레터럴 레이즈', ''],
  'side laterals to front raise': ['侧平举接前平举', '사이드 레터럴 투 프론트 레이즈', ''],
  'lateral raise - with bands': ['弹力带侧平举', '밴드 레터럴 레이즈', ''],
  'cable seated lateral raise': ['坐姿绳索侧平举', '시티드 케이블 레터럴 레이즈', '韩文词序调整'],
  'standing low-pulley deltoid raise': ['站姿绳索侧平举', '스탠딩 케이블 레터럴 레이즈', '就是绳索侧平举；原译"低位绳索三角肌平举"是直译'],
  'bent over low-pulley side lateral': ['俯身绳索侧平举', '벤트오버 케이블 레터럴 레이즈', '去掉"低位"；韩文로우 풀리改为常用的케이블'],
  'alternating deltoid raise': ['哑铃前平举侧平举交替', '얼터네이트 프론트·사이드 레이즈', '动作是一次前平举、一次侧平举交替；原译"三角肌平举"看不出做法'],
  'dumbbell raise': ['哑铃屈臂侧上提', '덤벨 업라이트 레이즈', '原译"哑铃侧平举"与 Side Lateral Raise 重名；这个动作是屈臂把哑铃沿体侧上提'],
  'upright barbell row': ['杠铃直立划船', '바벨 업라이트 로우', ''],
  'dumbbell one-arm upright row': ['单臂哑铃直立划船', '원암 덤벨 업라이트 로우', ''],
  'smith machine one-arm upright row': ['史密斯机单臂直立划船', '스미스 머신 원암 업라이트 로우', '中文统一写"史密斯机"'],
  'arm circles': ['手臂绕环', '암 서클', ''],
  'shoulder circles': ['肩部绕环', '숄더 서클', ''],
  'shoulder raise': ['耸肩上提', '숄더 레이즈', ''],

  // ── 肩后束 ──
  'face pull': ['绳索面拉', '페이스 풀', ''],
  'reverse flyes': ['俯卧哑铃反向飞鸟', '인클라인 덤벨 리버스 플라이', '动作是俯卧在上斜凳上做；补上姿势和器械，和绳索、器械版本区分开'],
  'reverse flyes with external rotation': ['俯卧哑铃外旋反向飞鸟', '인클라인 덤벨 외회전 리버스 플라이', '与上一条保持一致'],
  'reverse machine flyes': ['蝴蝶机反向飞鸟', '리버스 펙덱 플라이', '大陆叫"蝴蝶机反向飞鸟"，韩国叫리버스 펙덱 플라이'],
  'cable rear delt fly': ['绳索反向飞鸟', '케이블 리버스 플라이', '常用叫法是"反向飞鸟 / 리버스 플라이"'],
  'sled reverse flye': ['雪橇反向飞鸟', '슬레드 리버스 플라이', ''],
  'band pull apart': ['弹力带拉开', '밴드 풀 어파트', ''],
  'barbell rear delt row': ['杠铃后束划船', '바벨 리어 델트 로우', ''],
  'cable rope rear-delt rows': ['绳索后束划船', '케이블 리어 델트 로우', '韩文去掉로프'],
  'lying rear delt raise': ['俯卧哑铃后束平举', '라잉 리어 델트 레이즈', '中文补上"哑铃"'],
  'dumbbell lying rear lateral raise': ['俯卧哑铃后束侧平举', '라잉 덤벨 리어 레터럴 레이즈', '与上一条区分：这条是 lateral raise'],
  'dumbbell lying one-arm rear lateral raise': ['俯卧单臂哑铃后束侧平举', '라잉 원암 덤벨 리어 레터럴 레이즈', '与上一条保持一致'],
  'seated bent-over rear delt raise': ['坐姿俯身哑铃后束平举', '시티드 벤트오버 리어 델트 레이즈', '中文补上"哑铃"'],
  'bent over dumbbell rear delt raise with head on bench': ['头靠凳俯身哑铃后束平举', '헤드 서포티드 벤트오버 리어 델트 레이즈', '韩文原译"벤치 지지"没说清是头靠凳'],

  // ── 肱二头肌 ──
  'barbell curl': ['杠铃弯举', '바벨 컬', ''],
  'dumbbell bicep curl': ['哑铃弯举', '덤벨 컬', '韩国直接说덤벨 컬'],
  'hammer curls': ['锤式弯举', '해머 컬', ''],
  'standing biceps cable curl': ['站姿绳索弯举', '스탠딩 케이블 컬', '韩文去掉多余的바이셉스'],
  'machine bicep curl': ['器械弯举', '머신 암 컬', '韩国헬스장叫암 컬 머신 / 머신 암 컬'],
  'machine preacher curls': ['器械牧师凳弯举', '머신 프리처 컬', ''],
  'incline inner biceps curl': ['上斜哑铃外展弯举', '인클라인 덤벨 와이드 컬', '动作是肘部贴身、前臂向外打开；"内侧弯举 / 이너"是直译，说不清动作'],
  'seated dumbbell inner biceps curl': ['坐姿哑铃外展弯举', '시티드 덤벨 와이드 컬', '同上'],
  'standing inner-biceps curl': ['站姿哑铃外展弯举', '스탠딩 덤벨 와이드 컬', '同上'],

  // ── 肱三头肌 ──
  'triceps pushdown': ['绳索下压', '케이블 푸시다운', '韩国常说케이블 푸시다운'],
  'dips - triceps version': ['双杠臂屈伸（三头）', '딥스 (삼두)', '括号里的"版/버전"是直译，去掉'],
  'ez-bar skullcrusher': ['曲杆仰卧臂屈伸', 'EZ 바 스컬 크러셔', ''],
  'cable rope overhead triceps extension': ['绳索过顶臂屈伸', '케이블 오버헤드 익스텐션', '韩文缩短为常用说法'],
  'cable incline triceps extension': ['上斜绳索臂屈伸', '인클라인 케이블 트라이셉스 익스텐션', '韩文词序调整'],
  'cable lying triceps extension': ['仰卧绳索臂屈伸', '라잉 케이블 트라이셉스 익스텐션', '韩文词序调整'],
  'decline dumbbell triceps extension': ['下斜哑铃臂屈伸', '디클라인 덤벨 트라이셉스 익스텐션', ''],
  'decline ez bar triceps extension': ['下斜曲杆臂屈伸', '디클라인 EZ 바 트라이셉스 익스텐션', ''],

  // ── 小臂 ──
  'cable wrist curl': ['绳索腕弯举', '케이블 리스트 컬', ''],
  'palms-up barbell wrist curl over a bench': ['凳上杠铃腕弯举', '벤치 바벨 리스트 컬', ''],
  'palms-up dumbbell wrist curl over a bench': ['凳上哑铃腕弯举', '벤치 덤벨 리스트 컬', ''],
  'palms-down wrist curl over a bench': ['凳上杠铃反握腕弯举', '벤치 바벨 리버스 리스트 컬', ''],
  'palms-down dumbbell wrist curl over a bench': ['凳上哑铃反握腕弯举', '벤치 덤벨 리버스 리스트 컬', ''],
  'seated dumbbell palms-down wrist curl': ['坐姿哑铃反握腕弯举', '시티드 덤벨 리버스 리스트 컬', ''],

  // ── 腹 ──
  crunches: ['卷腹', '크런치', ''],
  plank: ['平板支撑', '플랭크', ''],
  'hanging leg raise': ['悬垂举腿', '행잉 레그 레이즈', ''],
  'cross-body crunch': ['交叉卷腹', '크로스 크런치', '韩国说크로스 크런치'],
  'decline reverse crunch': ['下斜反向卷腹', '디클라인 리버스 크런치', ''],
  'decline oblique crunch': ['下斜侧腹卷腹', '디클라인 오블리크 크런치', ''],
  'cable crunch': ['绳索卷腹', '케이블 크런치', ''],
  'cable reverse crunch': ['绳索反向卷腹', '케이블 리버스 크런치', ''],
  'cable seated crunch': ['坐姿绳索卷腹', '시티드 케이블 크런치', ''],
  'kneeling cable crunch with alternating oblique twists': ['跪姿绳索转体卷腹', '닐링 케이블 트위스트 크런치', '缩短：去掉"交替 / 오블리크"'],
  'bent-knee hip raise': ['仰卧屈膝举腿', '라잉 니 레이즈', '动作是仰卧屈膝把膝盖拉向胸口；原译"屈膝举臀"是直译'],
  'knee/hip raise on parallel bars': ['双杠支撑举腿', '딥바 니 레이즈', '补上"支撑"；韩国把平行杠叫딥바'],
  'rear leg raises': ['俯卧后抬腿', '리어 레그 레이즈', ''],

  // ── 斜方肌 ──
  'barbell shrug': ['杠铃耸肩', '바벨 슈러그', ''],
  'dumbbell shrug': ['哑铃耸肩', '덤벨 슈러그', ''],
  'cable shrugs': ['绳索耸肩', '케이블 슈러그', ''],
  'barbell shrug behind the back': ['背后杠铃耸肩', '비하인드 백 바벨 슈러그', ''],
  'smith machine behind the back shrug': ['史密斯机背后耸肩', '스미스 머신 비하인드 백 슈러그', ''],
  'leverage shrug': ['器械耸肩', '머신 슈러그', '"杠杆器械 / 레버리지"是直译，日常就叫器械'],
  'calf-machine shoulder shrug': ['提踵机耸肩', '카프 머신 슈러그', '韩文去掉多余的숄더'],
  'middle back shrug': ['俯卧哑铃耸肩', '인클라인 덤벨 슈러그', ''],

  // ── 竖脊肌 ──
  'hyperextensions (back extensions)': ['山羊挺身', '백 익스텐션', ''],
  'hyperextensions with no hyperextension bench': ['平凳背伸展', '플랫 벤치 백 익스텐션', '没有罗马椅时在平凳上做，叫"山羊挺身"不贴切'],
  'good morning': ['杠铃早安式', '굿모닝', ''],
  'stiff leg barbell good morning': ['直腿杠铃早安式', '스티프 레그 굿모닝', '韩文省去바벨'],
  'good morning off pins': ['架上杠铃早安式', '핀 굿모닝', ''],
  'hanging bar good morning': ['悬挂杠铃早安式', '행잉 바 굿모닝', ''],
  'seated good mornings': ['坐姿早安式', '시티드 굿모닝', ''],

  // ── 背阔肌 ──
  pullups: ['引体向上', '풀업', ''],
  'chin-up': ['反握引体向上', '친업', ''],
  'wide-grip lat pulldown': ['宽距高位下拉', '와이드 그립 랫 풀다운', '大陆说"宽距"不说"宽握"'],
  'close-grip front lat pulldown': ['窄距高位下拉', '클로즈 그립 랫 풀다운', '大陆说"窄距"不说"窄握"'],
  'one arm lat pulldown': ['单臂高位下拉', '원암 랫 풀다운', ''],
  'full range-of-motion lat pulldown': ['全程高位下拉', '풀 레인지 랫 풀다운', ''],
  'seated cable rows': ['坐姿绳索划船', '시티드 케이블 로우', ''],
  'bent over barbell row': ['俯身杠铃划船', '벤트오버 바벨 로우', ''],
  'kneeling high pulley row': ['跪姿高位绳索划船', '닐링 하이 풀리 로우', ''],
  'kneeling single-arm high pulley row': ['跪姿单臂高位绳索划船', '닐링 원암 하이 풀리 로우', ''],
  'rope straight-arm pulldown': ['绳索直臂下压', '로프 스트레이트 암 풀다운', ''],
  'straight-arm pulldown': ['直臂下压', '스트레이트 암 풀다운', ''],
  'inverted row': ['反向划船', '인버티드 로우', ''],
  'leverage high row': ['器械高位划船', '머신 하이 로우', ''],
  'scapular pull-up': ['肩胛引体', '스캐풀라 풀업', ''],

  // ── 臀 ──
  'barbell hip thrust': ['杠铃臀推', '바벨 힙 쓰러스트', ''],
  'barbell glute bridge': ['杠铃臀桥', '바벨 글루트 브리지', ''],
  'single leg glute bridge': ['单腿臀桥', '싱글 레그 브리지', '韩文省去글루트'],
  'physioball hip bridge': ['健身球臀桥', '짐볼 힙 브리지', ''],
  'butt lift (bridge)': ['臀桥', '힙 브리지', ''],
  'glute kickback': ['跪姿后踢腿', '덩키 킥', '韩国헬스장把这个动作叫덩키 킥'],
  'hip lift with band': ['弹力带臀桥', '밴드 힙 브리지', ''],

  // ── 大腿前侧 ──
  'barbell squat': ['杠铃深蹲', '바벨 스쿼트', ''],
  'bodyweight squat': ['徒手深蹲', '맨몸 스쿼트', ''],
  'dumbbell squat': ['哑铃深蹲', '덤벨 스쿼트', ''],
  'hack squat': ['哈克深蹲', '핵 스쿼트', ''],
  'chair squat': ['史密斯机箱式深蹲', '스미스 머신 체어 스쿼트', '动作是在史密斯机上向后坐的深蹲；"坐姿深蹲"容易误解成坐着做'],
  'barbell side split squat': ['杠铃侧弓步', '바벨 사이드 런지', '动作是向侧面跨步下蹲，常叫"侧弓步 / 사이드 런지"'],
  'dumbbell lunges': ['哑铃箭步蹲', '덤벨 런지', ''],
  'leg press': ['腿举', '레그 프레스', ''],
  'leg extensions': ['腿屈伸', '레그 익스텐션', ''],

  // ── 大腿后侧 ──
  'barbell deadlift': ['杠铃硬拉', '바벨 데드리프트', ''],
  'romanian deadlift': ['罗马尼亚硬拉', '루마니안 데드리프트', ''],
  'stiff-legged barbell deadlift': ['杠铃直腿硬拉', '스티프 레그 데드리프트', '韩文省去바벨（默认就是杠铃）'],
  'stiff-legged dumbbell deadlift': ['哑铃直腿硬拉', '덤벨 스티프 레그 데드리프트', '韩文词序调整'],
  'smith machine stiff-legged deadlift': ['史密斯机直腿硬拉', '스미스 머신 스티프 레그 데드리프트', ''],
  'cable deadlifts': ['绳索硬拉', '케이블 데드리프트', ''],
  'leverage deadlift': ['器械硬拉', '머신 데드리프트', '"杠杆器械 / 레버리지"是直译'],
  'trap bar deadlift': ['六角杠硬拉', '트랩바 데드리프트', ''],
  'lying leg curls': ['俯卧腿弯举', '라잉 레그 컬', ''],

  // ── 小腿 ──
  'standing calf raises': ['站姿提踵', '스탠딩 카프 레이즈', ''],
  'seated calf raise': ['坐姿提踵', '시티드 카프 레이즈', ''],
  'barbell seated calf raise': ['坐姿杠铃提踵', '시티드 바벨 카프 레이즈', '韩文词序调整'],
  'dumbbell seated one-leg calf raise': ['坐姿单腿哑铃提踵', '시티드 원레그 덤벨 카프 레이즈', ''],
  'rocking standing calf raise': ['站姿摇摆提踵', '로킹 스탠딩 카프 레이즈', ''],
  'smith machine calf raise': ['史密斯机提踵', '스미스 머신 카프 레이즈', ''],
  'calf press': ['坐姿蹬腿提踵', '카프 프레스', '动作是在蹬腿器械上用脚掌推；"器械提踵"太笼统'],
}

export const REVIEWED_NAME_TRANSLATIONS = {
  zh: Object.fromEntries(Object.entries(REVIEWED).map(([name, [zh]]) => [name, zh])),
  ko: Object.fromEntries(Object.entries(REVIEWED).map(([name, [, ko]]) => [name, ko])),
}
