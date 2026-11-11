// 三语搜索同义词。迁移自旧 App.vue SEARCH_SYNONYMS / SEARCH_ACTION_SYNONYMS。
export const SEARCH_SYNONYMS = [
  {
    aliases: ['胸', '胸部', '胸肌', '卧推', '俯卧撑', '夹胸', '飞鸟', '가슴'],
    keywords: ['chest', 'pectorals', 'bench press', 'push up', 'push-up', 'fly', 'flies'],
  },
  {
    aliases: ['背', '背部', '背阔肌', '引体向上', '下拉', '划船', '등', '광배근'],
    keywords: ['back', 'lats', 'lat', 'pull up', 'pull-up', 'pulldown', 'row', 'middle back'],
  },
  {
    aliases: ['斜方肌', '上背', '耸肩', '승모근'],
    keywords: ['traps', 'trapezius', 'shrug'],
  },
  {
    aliases: ['竖脊肌', '下背', '腰背', '척추기립근'],
    keywords: ['erector', 'lower back', 'back extension', 'good morning'],
  },
  {
    aliases: ['肩', '肩部', '三角肌', '어깨'],
    keywords: ['shoulder', 'shoulders', 'delts', 'deltoids', 'overhead press'],
  },
  {
    aliases: ['肩前束', '前束', '前肩', '전면 삼각근'],
    keywords: ['front delts', 'front deltoid', 'anterior deltoid', 'shoulder press', 'front raise'],
  },
  {
    aliases: ['肩中束', '中束', '侧肩', '측면 삼각근'],
    keywords: ['side delts', 'lateral deltoid', 'lateral raise', 'side raise'],
  },
  {
    aliases: ['肩后束', '后束', '后肩', '후면 삼각근'],
    keywords: ['rear delts', 'posterior deltoid', 'reverse fly', 'face pull'],
  },
  {
    aliases: ['二头', '肱二头肌', '弯举', '이두근'],
    keywords: ['biceps', 'curl'],
  },
  {
    aliases: ['三头', '肱三头肌', '臂屈伸', '삼두근'],
    keywords: ['triceps', 'pushdown', 'extension', 'skullcrusher'],
  },
  {
    aliases: ['小臂', '前臂', '握力', '手腕', '전완근'],
    keywords: ['forearms', 'forearm', 'wrist', 'grip'],
  },
  {
    aliases: ['腹', '腹部', '腹肌', '核心', '卷腹', '举腿', '平板支撑', '복근'],
    keywords: ['abs', 'abdominals', 'core', 'crunch', 'leg raise', 'knee raise', 'plank', 'sit-up'],
  },
  {
    aliases: ['腿', '腿部', '하체'],
    keywords: ['legs'],
  },
  {
    aliases: ['大腿', '股四头肌', '深蹲', '箭步蹲', '腿举', '허벅지'],
    keywords: ['thighs', 'quadriceps', 'quads', 'hamstrings', 'squat', 'lunge', 'leg press'],
  },
  {
    aliases: ['臀', '臀部', '臀大肌', '臀桥', '엉덩이'],
    keywords: ['glutes', 'gluteus', 'hip thrust', 'bridge'],
  },
  {
    aliases: ['小腿', '提踵', '종아리'],
    keywords: ['calves', 'calf', 'calf raise'],
  },
  {
    aliases: ['杠铃'],
    keywords: ['barbell'],
  },
  {
    aliases: ['哑铃'],
    keywords: ['dumbbell'],
  },
  {
    aliases: ['绳索', '龙门架'],
    keywords: ['cable'],
  },
  {
    aliases: ['器械', '固定器械'],
    keywords: ['machine'],
  },
  {
    aliases: ['徒手', '自重'],
    keywords: ['bodyweight'],
  },
]


export const SEARCH_ACTION_SYNONYMS = [
  {
    aliases: ['卧推', '推胸', '벤치프레스', '벤치 프레스'],
    keywords: ['bench press', 'benchpress', 'press'],
  },
  {
    aliases: ['深蹲', '스쿼트'],
    keywords: ['squat'],
  },
  {
    aliases: ['硬拉', '데드리프트'],
    keywords: ['deadlift'],
  },
  {
    aliases: ['弯举', '컬'],
    keywords: ['curl'],
  },
  {
    aliases: ['臂屈伸', '下压', '伸展', '익스텐션', '푸시다운'],
    keywords: ['extension', 'pushdown', 'dip'],
  },
  {
    aliases: ['飞鸟', '夹胸', '플라이'],
    keywords: ['fly', 'flies', 'flyes'],
  },
  {
    aliases: ['划船', '로우'],
    keywords: ['row'],
  },
  {
    aliases: ['下拉', '풀다운'],
    keywords: ['pulldown', 'lat pulldown'],
  },
  {
    aliases: ['卷腹', '크런치'],
    keywords: ['crunch'],
  },
  {
    aliases: ['举腿', '举膝', '레그 레이즈', '니 레이즈'],
    keywords: ['leg raise', 'knee raise', 'raise'],
  },
  {
    aliases: ['提踵', '카프 레이즈'],
    keywords: ['calf raise', 'calf'],
  },
  {
    aliases: ['耸肩', '슈러그'],
    keywords: ['shrug'],
  },
  {
    aliases: ['肩后束划船', '后束划船', '리어 델트 로우', '후면 삼각근 로우'],
    keywords: ['rear delt row', 'rear-delt row', 'rear delt rows', 'rear-delt rows'],
  },
  {
    aliases: ['后束飞鸟', '反向飞鸟', '俯身飞鸟', '리버스 플라이', '리어 델트 플라이', '후면 삼각근 플라이'],
    keywords: ['reverse fly', 'reverse flye', 'reverse flyes', 'rear delt fly', 'rear delt raise', 'rear lateral raise'],
  },
  {
    aliases: ['面拉', '绳索面拉', '페이스 풀'],
    keywords: ['face pull'],
  },
  {
    aliases: ['直立划船', '杠铃直立划船', '哑铃直立划船', '업라이트 로우'],
    keywords: ['upright row'],
  },
  {
    aliases: ['三角肌平举', '侧平举', '低位绳索平举', '델토이드 레이즈', '레터럴 레이즈'],
    keywords: ['deltoid raise', 'lateral raise', 'side lateral'],
  },
  {
    aliases: ['肩部绕环', '肩绕环', '肩部热身', '숄더 서클', '어깨 회전'],
    keywords: ['shoulder circles', 'arm circles'],
  },
]
