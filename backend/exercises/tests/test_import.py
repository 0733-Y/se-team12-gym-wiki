"""T7：导入后的每个动作 source_name、muscle_groups 非空（ARCHITECTURE.md 4.6）。
用从 free-exercise-db 截取的 8 条真实数据，离线运行（--data-file + --skip-images）。"""
from io import StringIO
from pathlib import Path

from django.core.management import call_command
from django.test import TestCase

from exercises import importing
from exercises.constants import MUSCLE_GROUPS
from exercises.models import Exercise

FIXTURE = Path(__file__).parent / 'fixtures' / 'sample_exercises.json'


def run_import(**opts):
    out = StringIO()
    call_command('import_exercises', data_file=str(FIXTURE), skip_images=True, stdout=out, stderr=StringIO(), **opts)
    return out.getvalue()


class ImportCommandTests(TestCase):
    def test_every_exercise_has_source_and_groups(self):
        run_import()
        exercises = list(Exercise.objects.all())
        self.assertEqual(len(exercises), 8)
        for ex in exercises:
            with self.subTest(ex.name):
                self.assertTrue(ex.source_name)
                self.assertTrue(ex.source_url.startswith('https://github.com/yuhonas/free-exercise-db'))
                self.assertEqual(ex.source_license, importing.SOURCE_LICENSE)
                self.assertTrue(ex.muscle_groups)
                self.assertTrue(set(ex.muscle_groups) <= set(MUSCLE_GROUPS))
                self.assertIn(ex.difficulty, {'beginner', 'intermediate', 'expert'})
                self.assertIn(ex.category, dict(Exercise.Category.choices))
                self.assertTrue(ex.description)

    def test_rerun_is_idempotent(self):
        run_import()
        Exercise.objects.filter(name='Barbell Squat').update(reviewed=True)
        out = run_import()
        self.assertEqual(Exercise.objects.count(), 8)
        self.assertIn('0 created', out)
        # 人工抽检标记不被重新导入覆盖
        self.assertTrue(Exercise.objects.get(name='Barbell Squat').reviewed)

    def test_field_mapping(self):
        run_import()
        squat = Exercise.objects.get(name='Barbell Squat')
        self.assertEqual(squat.muscle_groups, ['thighs-front', 'glutes'])  # 来自 EXERCISE_GROUP_OVERRIDES
        self.assertEqual(squat.equipment, 'barbell')
        self.assertEqual(squat.category, 'legs')
        self.assertEqual(Exercise.objects.get(name='Side Lateral Raise').muscle_groups, ['side-delts'])
        self.assertEqual(Exercise.objects.get(name='Face Pull').muscle_groups, ['rear-delts'])
        self.assertEqual(Exercise.objects.get(name='Standing Calf Raises').muscle_groups,
                         ['calves-front', 'calves-back'])
        self.assertIn('forearms', Exercise.objects.get(name='Palms-Up Barbell Wrist Curl Over A Bench').muscle_groups)


class ResolveGroupsTests(TestCase):
    """细分肌群判定（迁移自旧前端 resolveExerciseFineGroups）。"""

    def resolve(self, name, primary=(), category='chest'):
        return importing.resolve_muscle_groups({'name': name, 'primaryMuscles': list(primary)}, category)

    def test_override_wins(self):
        self.assertEqual(self.resolve('Barbell Bench Press', ['chest']), ['chest'])

    def test_name_priority(self):
        self.assertEqual(self.resolve('Romanian Deadlift', ['hamstrings']), ['thighs-back', 'glutes'])
        self.assertEqual(self.resolve('Dumbbell Shrug', ['traps']), ['traps'])

    def test_primary_muscles(self):
        self.assertEqual(self.resolve('Mystery Move', ['chest', 'triceps']), ['chest', 'triceps'])
        self.assertEqual(self.resolve('Mystery Move', ['forearms']), ['forearms'])

    def test_category_fallback(self):
        self.assertEqual(self.resolve('Mystery Move', [], 'back'), ['lats'])


def _source(name, primary, category='strength', **extra):
    return {'name': name, 'primaryMuscles': primary, 'secondaryMuscles': [], 'category': category,
            'instructions': ['do it'], 'images': ['x/0.jpg'], 'level': 'beginner', **extra}


class SelectionTests(TestCase):
    """导入时的选取规则。"""

    def test_word_boundaries_in_name_rules(self):
        # 旧规则里的 lat / row 会误伤 Plate、Lateral、Narrow
        resolve = importing.resolve_muscle_groups
        self.assertEqual(resolve(_source('Front Plate Raise', ['shoulders']), 'shoulders'), ['front-delts'])
        self.assertEqual(resolve(_source('Plate Pinch', ['forearms']), 'arms'), ['forearms'])
        self.assertEqual(resolve(_source('Narrow Stance Hack Squats', ['quadriceps']), 'legs'),
                         ['thighs-front', 'glutes'])
        self.assertEqual(resolve(_source('Wide-Grip Lat Pulldown', ['lats']), 'back'), ['lats'])
        self.assertEqual(resolve(_source('Seated Cable Rows', ['middle back']), 'back'), ['lats'])
        self.assertEqual(resolve(_source('Pullups', ['lats']), 'back'), ['lats'])
        self.assertEqual(resolve(_source('Close-Grip Dumbbell Press', ['triceps']), 'arms'), ['triceps'])
        self.assertEqual(resolve(_source('Calf-Machine Shoulder Shrug', ['traps']), 'back'), ['traps'])

    def test_only_strength_categories_are_selected(self):
        source = [
            _source('Barbell Curl', ['biceps']),
            _source('Biceps Stretch', ['biceps'], category='stretching'),
            _source('Box Jump', ['quadriceps'], category='plyometrics'),
            _source('Barbell Hip Thrust', ['glutes'], category='powerlifting'),
        ]
        names = [e['name'] for e, _ in importing.select_exercises(source, 6)]
        self.assertEqual(sorted(names), ['Barbell Curl', 'Barbell Hip Thrust'])

    def test_limit_per_group_and_essentials(self):
        curls = [_source(f'Curl Variation {i}', ['biceps']) for i in range(5)]
        source = curls + [_source('Hammer Curls', ['biceps'], equipment='other', level='expert')]
        names = [e['name'] for e, _ in importing.select_exercises(source, 2)]
        self.assertEqual(len([n for n in names if n.startswith('Curl Variation')]), 2)
        self.assertIn('Hammer Curls', names)  # 基础动作表里的，超出名额也导入
        self.assertEqual(len(names), len(set(names)))

    def test_prune_removes_only_stale_imported_rows(self):
        run_import()
        Exercise.objects.create(name='Old Import', category='chest', source_name=importing.SOURCE_NAME)
        Exercise.objects.create(name='Hand Made', category='chest', source_name='manual')
        run_import(prune=True)
        self.assertFalse(Exercise.objects.filter(name='Old Import').exists())
        self.assertTrue(Exercise.objects.filter(name='Hand Made').exists())
        self.assertEqual(Exercise.objects.count(), 9)
