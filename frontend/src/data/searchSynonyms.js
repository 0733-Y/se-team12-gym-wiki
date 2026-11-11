// 三语搜索同义词。数据来自旧 App.vue 的 SEARCH_SYNONYMS、SEARCH_ACTION_SYNONYMS
// 和 searchTargetGroups 里的规则表，整理成两张表：
//   SEARCH_ACTIONS  动作词 → 规范词（英文动作名里要包含的片段）
//   SEARCH_GROUPS   肌群词 → 细分肌群 id
// 用户输入与 aliases / terms 里任意一项相同（忽略大小写、空格、连字符）即视为同一个规范词，
// 所以韩文、中文、英文的同义写法一定得到同一组动作。

export const SEARCH_ACTIONS = [
  {
    keywords: ['bench press'],
    aliases: ['卧推', '推胸', '벤치프레스', '벤치 프레스', 'bench press', 'benchpress', 'bench'],
  },
  {
    keywords: ['push-up', 'pushup', 'push up'],
    aliases: ['俯卧撑', '푸시업', '푸쉬업', '팔굽혀펴기', 'push up', 'pushup', 'push-up', 'pushups'],
  },
  { keywords: ['squat'], aliases: ['深蹲', '스쿼트', 'squat', 'squats'] },
  { keywords: ['lunge'], aliases: ['箭步蹲', '弓步', '런지', 'lunge', 'lunges'] },
  { keywords: ['leg press'], aliases: ['腿举', '倒蹬', '레그 프레스', 'leg press', 'legpress'] },
  { keywords: ['leg extension'], aliases: ['腿屈伸', '레그 익스텐션', 'leg extension', 'leg extensions'] },
  { keywords: ['leg curl'], aliases: ['腿弯举', '레그 컬', 'leg curl', 'leg curls'] },
  { keywords: ['deadlift'], aliases: ['硬拉', '데드리프트', 'deadlift', 'deadlifts'] },
  { keywords: ['hip thrust', 'bridge'], aliases: ['臀桥', '臀推', '힙 쓰러스트', '힙 브리지', '브리지', 'hip thrust', 'glute bridge', 'bridge'] },
  {
    keywords: ['pull-up', 'pullup', 'pull up', 'chin-up'],
    aliases: ['引体向上', '引体', '풀업', '턱걸이', '친업', 'pull up', 'pullup', 'pull-up', 'pullups', 'chin up', 'chin-up'],
  },
  { keywords: ['pulldown'], aliases: ['下拉', '高位下拉', '풀다운', '랫 풀다운', 'pulldown', 'lat pulldown'] },
  { keywords: ['upright row'], aliases: ['直立划船', '杠铃直立划船', '哑铃直立划船', '업라이트 로우', 'upright row'] },
  {
    keywords: ['rear delt row', 'rear-delt row'],
    aliases: ['肩后束划船', '后束划船', '리어 델트 로우', '후면 삼각근 로우', 'rear delt row'],
  },
  { keywords: [' row', 'rows'], aliases: ['划船', '로우', 'row', 'rows'] },
  { keywords: ['shrug'], aliases: ['耸肩', '슈러그', 'shrug', 'shrugs'] },
  {
    keywords: ['shoulder press', 'overhead press', 'military press', 'arnold'],
    aliases: ['肩推', '推肩', '推举', '숄더 프레스', '오버헤드 프레스', 'shoulder press', 'overhead press', 'military press'],
  },
  {
    keywords: ['lateral raise', 'side lateral', 'deltoid raise'],
    aliases: ['侧平举', '三角肌平举', '低位绳索平举', '레터럴 레이즈', '사이드 레터럴 레이즈', '델토이드 레이즈', 'lateral raise', 'side lateral raise', 'side raise'],
  },
  { keywords: ['front raise', 'front dumbbell raise', 'front cable raise'], aliases: ['前平举', '프론트 레이즈', 'front raise'] },
  {
    keywords: ['reverse fly', 'rear delt fly', 'rear delt raise', 'rear lateral raise'],
    aliases: ['后束飞鸟', '反向飞鸟', '俯身飞鸟', '리버스 플라이', '리어 델트 플라이', '후면 삼각근 플라이', 'reverse fly', 'reverse flyes', 'rear delt fly'],
  },
  { keywords: ['face pull'], aliases: ['面拉', '绳索面拉', '페이스 풀', 'face pull'] },
  { keywords: ['fly', 'flies', 'flyes'], aliases: ['飞鸟', '夹胸', '플라이', 'fly', 'flies', 'flyes', 'flye'] },
  { keywords: ['wrist curl'], aliases: ['腕弯举', '리스트 컬', 'wrist curl'] },
  { keywords: ['curl'], aliases: ['弯举', '컬', 'curl', 'curls'] },
  { keywords: ['pushdown'], aliases: ['下压', '푸시다운', 'pushdown', 'triceps pushdown'] },
  { keywords: ['triceps extension', 'skullcrusher', 'skull crusher'], aliases: ['臂屈伸', '트라이셉스 익스텐션', '스컬 크러셔', 'triceps extension', 'skullcrusher'] },
  { keywords: ['dips'], aliases: ['双杠臂屈伸', '딥스', 'dip', 'dips'] },
  { keywords: ['crunch'], aliases: ['卷腹', '크런치', 'crunch', 'crunches'] },
  { keywords: ['leg raise', 'knee raise', 'hip raise'], aliases: ['举腿', '举膝', '레그 레이즈', '니 레이즈', 'leg raise', 'knee raise'] },
  { keywords: ['plank'], aliases: ['平板支撑', '플랭크', 'plank'] },
  { keywords: ['calf raise', 'calf press'], aliases: ['提踵', '카프 레이즈', 'calf raise', 'calf raises'] },
  { keywords: ['good morning'], aliases: ['早安式', '굿모닝', 'good morning'] },
  { keywords: ['hyperextension', 'back extension'], aliases: ['山羊挺身', '背部伸展', '백 익스텐션', '하이퍼익스텐션', 'back extension', 'hyperextension'] },
]

export const SEARCH_GROUPS = [
  { groups: ['chest'], terms: ['胸', '胸部', '胸肌', '가슴', 'chest', 'pectorals', 'pecs'] },
  { groups: ['lats', 'traps', 'erectors', 'rear-delts'], terms: ['背', '背部', '등', 'back'] },
  { groups: ['lats'], terms: ['背阔肌', '광배근', 'lats', 'lat'] },
  { groups: ['traps'], terms: ['斜方肌', '上背', '승모근', 'traps', 'trapezius'] },
  { groups: ['erectors'], terms: ['竖脊肌', '下背', '腰背', '척추기립근', '허리', 'erector', 'erectors', 'lower back'] },
  {
    groups: ['front-delts', 'side-delts', 'rear-delts'],
    terms: ['肩', '肩部', '三角肌', '어깨', '삼각근', 'shoulder', 'shoulders', 'delts', 'deltoids'],
  },
  { groups: ['front-delts'], terms: ['肩前束', '前束', '前肩', '전면 삼각근', 'front delts', 'front deltoid', 'anterior deltoid'] },
  { groups: ['side-delts'], terms: ['肩中束', '中束', '侧肩', '측면 삼각근', 'side delts', 'lateral deltoid'] },
  { groups: ['rear-delts'], terms: ['肩后束', '后束', '后肩', '후면 삼각근', '리어 델트', 'rear delts', 'posterior deltoid'] },
  { groups: ['biceps', 'triceps', 'forearms'], terms: ['手臂', '胳膊', '팔', 'arm', 'arms'] },
  { groups: ['biceps'], terms: ['二头', '二头肌', '肱二头肌', '이두근', '이두', 'biceps', 'bicep'] },
  { groups: ['triceps'], terms: ['三头', '三头肌', '肱三头肌', '삼두근', '삼두', 'triceps', 'tricep'] },
  { groups: ['forearms'], terms: ['小臂', '前臂', '握力', '手腕', '전완근', '전완', '손목', '그립', 'forearm', 'forearms', 'wrist', 'grip'] },
  { groups: ['abs'], terms: ['腹', '腹部', '腹肌', '核心', '복근', '코어', 'abs', 'abdominals', 'core'] },
  {
    groups: ['thighs-front', 'thighs-back', 'glutes', 'calves-front', 'calves-back'],
    terms: ['腿', '腿部', '하체', '다리', 'leg', 'legs'],
  },
  {
    groups: ['thighs-front', 'thighs-back'],
    terms: ['大腿', '허벅지', 'thigh', 'thighs'],
  },
  { groups: ['thighs-front'], terms: ['股四头肌', '대퇴사두근', 'quadriceps', 'quads'] },
  { groups: ['thighs-back'], terms: ['腘绳肌', '햄스트링', 'hamstrings', 'hamstring'] },
  { groups: ['glutes'], terms: ['臀', '臀部', '臀大肌', '둔근', '엉덩이', 'glutes', 'glute', 'gluteus'] },
  { groups: ['calves-front', 'calves-back'], terms: ['小腿', '종아리', 'calf', 'calves'] },
]
