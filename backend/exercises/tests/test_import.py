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
