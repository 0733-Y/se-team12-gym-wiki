from exercises.models import Exercise


def make_exercise(name='Barbell Bench Press', category='chest', groups=None, **extra):
    """测试用：建一个动作。"""
    return Exercise.objects.create(
        name=name,
        description='step 1\nstep 2',
        key_points='keep shoulders back',
        category=category,
        muscle_groups=groups if groups is not None else ['chest', 'triceps'],
        difficulty='beginner',
        equipment='barbell',
        source_name='free-exercise-db',
        **extra,
    )
