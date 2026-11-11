"""free-exercise-db 导入逻辑（迁移自旧 api/management/commands/import_free_exercise_db.py
与旧前端 App.vue 的 resolveExerciseFineGroups / EXERCISE_GROUP_OVERRIDES）。
纯数据处理，不做网络与数据库操作，便于测试。"""
import re

DATA_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
SOURCE_NAME = 'free-exercise-db (yuhonas)'
SOURCE_REPO_URL = 'https://github.com/yuhonas/free-exercise-db'
# 依据该仓库 LICENSE.md 的实际内容（"released into the public domain"，即 The Unlicense）
SOURCE_LICENSE = 'Unlicense (public domain)'

MUSCLE_TO_CATEGORY = {
    'chest': 'chest',
    'lats': 'back', 'middle back': 'back', 'lower back': 'back', 'traps': 'back',
    'shoulders': 'shoulders',
    'biceps': 'arms', 'triceps': 'arms', 'forearms': 'arms',
    'abdominals': 'abs',
    'quadriceps': 'legs', 'hamstrings': 'legs', 'calves': 'legs', 'glutes': 'legs',
    'adductors': 'legs', 'abductors': 'legs',
}

# 选取用的分组（旧 FINE_GROUPS，"calves" 一组对应前端 calves-front / calves-back 两个 id）
FINE_GROUPS = {
    'chest': {'category': 'chest', 'muscles': ('chest',), 'terms': ('bench', 'push', 'press', 'fly', 'dip')},
    'front-delts': {'category': 'shoulders', 'muscles': ('shoulders',),
                    'terms': ('press', 'front', 'arnold', 'overhead'), 'exclude': ('rear', 'lateral', 'side')},
    'side-delts': {'category': 'shoulders', 'muscles': ('shoulders',), 'terms': ('lateral', 'side', 'upright')},
    'rear-delts': {'category': 'shoulders', 'muscles': ('shoulders',),
                   'terms': ('rear', 'reverse', 'face pull', 'bent over')},
    'biceps': {'category': 'arms', 'muscles': ('biceps',), 'terms': ('curl', 'biceps', 'chin')},
    'triceps': {'category': 'arms', 'muscles': ('triceps',), 'terms': ('triceps', 'extension', 'pushdown', 'dip')},
    'forearms': {'category': 'arms', 'muscles': ('forearms',), 'terms': ('wrist', 'forearm', 'grip')},
    'abs': {'category': 'abs', 'muscles': ('abdominals',),
            'terms': ('crunch', 'raise', 'plank', 'twist', 'sit-up', 'knee')},
    'traps': {'category': 'back', 'muscles': ('traps',), 'terms': ('shrug', 'trap', 'upright')},
    'erectors': {'category': 'back', 'muscles': ('lower back',),
                 'terms': ('hyperextension', 'back extension', 'good morning', 'deadlift')},
    'lats': {'category': 'back', 'muscles': ('lats', 'middle back'),
             'terms': ('pull', 'row', 'lat', 'chin', 'pulldown')},
    'glutes': {'category': 'legs', 'muscles': ('glutes',), 'terms': ('glute', 'hip', 'bridge', 'thrust')},
    'thighs-front': {'category': 'legs', 'muscles': ('quadriceps', 'adductors', 'abductors'),
                     'terms': ('squat', 'lunge', 'leg press', 'extension')},
    'thighs-back': {'category': 'legs', 'muscles': ('hamstrings',),
                    'terms': ('curl', 'romanian', 'stiff', 'deadlift')},
    'calves': {'category': 'legs', 'muscles': ('calves',), 'terms': ('calf', 'calves')},
}

# 人工修正（旧前端 EXERCISE_GROUP_OVERRIDES），键为小写动作名
EXERCISE_GROUP_OVERRIDES = {
    'barbell bench press': ['chest'],
    'barbell bench press - medium grip': ['chest'],
    'dumbbell seated overhead press': ['front-delts'],
    'barbell squat': ['thighs-front', 'glutes'],
    'hanging knee raises': ['abs'],
    'pull ups': ['lats'],
    'alternating deltoid raise': ['side-delts'],
    'arm circles': ['side-delts'],
    'bent over low-pulley side lateral': ['side-delts'],
    'cable seated lateral raise': ['side-delts'],
    'dumbbell one-arm upright row': ['side-delts'],
    'dumbbell raise': ['side-delts'],
    'lateral raise - with bands': ['side-delts'],
    'lying one-arm lateral raise': ['side-delts'],
    'one-arm incline lateral raise': ['side-delts'],
    'one-arm side laterals': ['side-delts'],
    'seated side lateral raise': ['side-delts'],
    'shoulder circles': ['side-delts'],
    'shoulder raise': ['side-delts'],
    'side lateral raise': ['side-delts'],
    'side laterals to front raise': ['side-delts'],
    'single dumbbell raise': ['side-delts'],
    'smith machine one-arm upright row': ['side-delts'],
    'standing low-pulley deltoid raise': ['side-delts'],
    'upright barbell row': ['side-delts'],
    'band pull apart': ['rear-delts'],
    'barbell rear delt row': ['rear-delts'],
    'bent over dumbbell rear delt raise with head on bench': ['rear-delts'],
    'cable rear delt fly': ['rear-delts'],
    'cable rope rear-delt rows': ['rear-delts'],
    'dumbbell lying one-arm rear lateral raise': ['rear-delts'],
    'dumbbell lying rear lateral raise': ['rear-delts'],
    'face pull': ['rear-delts'],
    'lying rear delt raise': ['rear-delts'],
    'reverse flyes': ['rear-delts'],
    'reverse flyes with external rotation': ['rear-delts'],
    'reverse machine flyes': ['rear-delts'],
    'seated bent-over rear delt raise': ['rear-delts'],
    'sled reverse flye': ['rear-delts'],
    # 新增：名字里有 calf 但练的是斜方肌
    'calf-machine shoulder shrug': ['traps'],
}

REAR_DELT_RE = r'rear lateral|rear delt|reverse fly|face pull|band pull apart|pull apart'
SIDE_DELT_RE = r'side lateral|side laterals|lateral raise|deltoid raise|arm circles|upright'

# 按动作名的优先规则（旧 mapNamePriorityGroups），顺序即优先级
NAME_PRIORITY_RULES = [
    (r'bench press|push-?up|fly|flye|pec deck|chest press', ['chest']),
    (r'squat|lunge|leg press|hack squat|step-?up', ['thighs-front', 'glutes']),
    (r'leg curl|hamstring|romanian|stiff-legged', ['thighs-back', 'glutes']),
    (r'deadlift', ['thighs-back', 'glutes', 'erectors']),
    (r'calf|calves', ['calves-front', 'calves-back']),
    (r'knee raise|leg raise|hip raise|crunch|plank|sit-?up|oblique', ['abs']),
    # 修正：lat / row 加词边界，旧写法会把 "Plate"、"Lateral"、"Narrow" 也算成背阔肌
    (r'pull ?ups?|pull-up|chin-up|pulldown|lats?|rows?', ['lats']),
    (r'shrug', ['traps']),
    (r'back extension|hyperextension|good morning', ['erectors']),
    (REAR_DELT_RE, ['rear-delts']),
    (r'side lateral|side laterals|lateral raise|deltoid raise|arm circles|upright row', ['side-delts']),
    (r'shoulder press|overhead press|front raise|front delt|military press|arnold', ['front-delts']),
    (r'triceps|pushdown|skullcrusher', ['triceps']),
    # 修正旧顺序：wrist curl 等先归小臂，再用 curl 归二头
    # grip 前面是连字符时（Close-Grip、Wide-Grip）说的是握距，不是握力训练
    (r'wrist|forearm|(?<!-)grip|pinch|pronation|supination', ['forearms']),
    (r'biceps|curl', ['biceps']),
]

CATEGORY_FALLBACK = {
    'chest': 'chest', 'back': 'lats', 'shoulders': 'front-delts',
    'abs': 'abs', 'legs': 'thighs-front', 'arms': 'biceps',
}


def _lower_list(values):
    return [str(v).lower() for v in (values or [])]


def shoulder_group_from_name(name):
    if re.search(REAR_DELT_RE, name):
        return 'rear-delts'
    if re.search(SIDE_DELT_RE, name):
        return 'side-delts'
    return 'front-delts'


def _groups_from_primary(primary, name):
    groups = []

    def add(*ids):
        for i in ids:
            if i not in groups:
                groups.append(i)

    def has(*muscles):
        return any(m in primary for m in muscles)

    if has('chest'):
        add('chest')
    if has('shoulders'):
        add(shoulder_group_from_name(name))
    if has('biceps'):
        add('biceps')
    if has('triceps'):
        add('triceps')
    if has('forearms'):
        add('forearms')
    if has('traps'):
        add('traps')
    if has('lower back'):
        add('erectors')
    if has('lats', 'middle back'):
        add('lats')
    if has('abdominals'):
        add('abs')
    if has('glutes'):
        add('glutes')
    if has('hamstrings'):
        add('thighs-back')
    if has('quadriceps', 'adductors', 'abductors'):
        add('thighs-front')
        if re.search(r'squat|lunge|leg press', name):
            add('glutes')
    if has('calves'):
        add('calves-front', 'calves-back')
    return groups


def resolve_muscle_groups(exercise, category):
    """细分肌群判定：人工修正 → 动作名优先规则 → 主肌群 → 分类兜底。第一个为主肌群。"""
    name = str(exercise.get('name', '')).lower()
    if name in EXERCISE_GROUP_OVERRIDES:
        return list(EXERCISE_GROUP_OVERRIDES[name])
    for pattern, groups in NAME_PRIORITY_RULES:
        if re.search(pattern, name):
            return list(groups)
    groups = _groups_from_primary(_lower_list(exercise.get('primaryMuscles')), name)
    if groups:
        return groups
    if category == 'shoulders':
        return [shoulder_group_from_name(name)]
    return [CATEGORY_FALLBACK.get(category, 'chest')]


def map_category(exercise):
    for muscle in _lower_list(exercise.get('primaryMuscles')) + _lower_list(exercise.get('secondaryMuscles')):
        if muscle in MUSCLE_TO_CATEGORY:
            return MUSCLE_TO_CATEGORY[muscle]
    return None


# 只导入力量训练类；源数据里的拉伸、放松、增强式、有氧等不属于动作库范围
ALLOWED_SOURCE_CATEGORIES = ('strength', 'powerlifting')
COMMON_EQUIPMENT = ('barbell', 'dumbbell', 'cable', 'machine', 'body only')

# 常见基础动作：源数据里有就一定导入，保证每个肌群都有大家认识的动作
ESSENTIAL_NAMES = (
    'Barbell Bench Press - Medium Grip', 'Dumbbell Bench Press', 'Pushups', 'Dumbbell Flyes', 'Dips - Chest Version',
    'Pullups', 'Chin-Up', 'Wide-Grip Lat Pulldown', 'Seated Cable Rows', 'Bent Over Barbell Row',
    'Barbell Deadlift', 'Romanian Deadlift', 'Hyperextensions (Back Extensions)', 'Barbell Shrug',
    'Barbell Shoulder Press', 'Dumbbell Shoulder Press', 'Arnold Dumbbell Press', 'Front Dumbbell Raise',
    'Side Lateral Raise', 'Face Pull', 'Reverse Flyes',
    'Barbell Curl', 'Dumbbell Bicep Curl', 'Hammer Curls', 'Triceps Pushdown', 'Dips - Triceps Version',
    'EZ-Bar Skullcrusher', 'Palms-Up Barbell Wrist Curl Over A Bench',
    'Crunches', 'Plank', 'Hanging Leg Raise',
    'Barbell Squat', 'Leg Press', 'Dumbbell Lunges', 'Leg Extensions', 'Lying Leg Curls',
    'Barbell Hip Thrust', 'Barbell Glute Bridge', 'Standing Calf Raises', 'Seated Calf Raise',
)


def _usable(exercise):
    name = str(exercise.get('name', '')).strip()
    return bool(name) and len(name) <= 100 and exercise.get('instructions') and exercise.get('images')


def _in_scope(exercise):
    return _usable(exercise) and exercise.get('category') in ALLOWED_SOURCE_CATEGORIES and map_category(exercise)


def _selection_group(groups):
    """用判定出的主肌群分组；小腿前后两个 id 的动作相同，合成一组选。"""
    primary = groups[0]
    return 'calves' if primary.startswith('calves') else primary


def _selection_score(exercise, group_id):
    name = str(exercise.get('name', '')).lower()
    score = 0
    for index, term in enumerate(FINE_GROUPS[group_id]['terms']):
        if term in name:
            score += 18 - index
    if (exercise.get('equipment') or '').lower() in COMMON_EQUIPMENT:
        score += 4
    if exercise.get('mechanic') == 'compound':
        score += 3
    if exercise.get('level') == 'beginner':
        score += 2
    return score


def select_exercises(exercises, limit_per_group):
    """每个细分肌群按得分选前 N 个，再补上基础动作表和人工修正表里的动作。
    返回 [(源数据, category)]，按名称去重。
    与旧逻辑的区别：按判定出的主肌群分组（旧逻辑按"第一个命中的分组"，名字含 bench 的都进了胸部），
    并且只取力量训练类。"""
    candidates = [e for e in exercises if _in_scope(e)]
    grouped = {group_id: [] for group_id in FINE_GROUPS}
    for exercise in candidates:
        groups = resolve_muscle_groups(exercise, map_category(exercise))
        grouped[_selection_group(groups)].append(exercise)

    selected, seen = [], set()

    def take(exercise):
        if exercise['name'] not in seen:
            selected.append((exercise, map_category(exercise)))
            seen.add(exercise['name'])

    for group_id, items in grouped.items():
        # 同分时按名称排，保证每次导入结果一致
        items.sort(key=lambda item: (-_selection_score(item, group_id), item['name']))
        for exercise in items[:limit_per_group]:
            take(exercise)

    must_have = {name.lower() for name in ESSENTIAL_NAMES} | set(EXERCISE_GROUP_OVERRIDES)
    for exercise in candidates:
        if str(exercise['name']).lower() in must_have:
            take(exercise)
    return selected


def select_all(exercises):
    """不做筛选：所有可用且能归类的动作（用于 --all 与测试数据）。"""
    return [(e, map_category(e)) for e in exercises if _usable(e) and map_category(e)]


def format_description(exercise):
    steps = [s.strip() for s in (exercise.get('instructions') or []) if s and s.strip()]
    return '\n'.join(f'{i}. {s}' for i, s in enumerate(steps, start=1))


def format_key_points(exercise):
    primary = ', '.join(exercise.get('primaryMuscles') or []) or 'none'
    secondary = ', '.join(exercise.get('secondaryMuscles') or []) or 'none'
    return '\n'.join([
        f'Primary muscles: {primary}',
        f'Secondary muscles: {secondary}',
        f'Mechanic: {exercise.get("mechanic") or "unknown"}',
        'Keep the movement controlled and stop if pain appears.',
    ])


def slugify(value):
    return re.sub(r'[^a-zA-Z0-9]+', '-', value).strip('-').lower() or 'exercise'


def build_fields(exercise, category):
    """源数据 → Exercise 字段（不含图片）。"""
    level = exercise.get('level')
    source_id = exercise.get('id') or slugify(exercise['name'])
    return {
        'description': format_description(exercise),
        'key_points': format_key_points(exercise),
        'category': category,
        'muscle_groups': resolve_muscle_groups(exercise, category),
        'difficulty': level if level in ('beginner', 'intermediate', 'expert') else 'beginner',
        'equipment': (exercise.get('equipment') or '')[:40],
        'source_name': SOURCE_NAME,
        'source_url': f'{SOURCE_REPO_URL}/tree/main/exercises/{source_id}',
        'source_license': SOURCE_LICENSE,
    }
