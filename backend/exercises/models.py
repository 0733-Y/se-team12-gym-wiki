from django.core.exceptions import ValidationError
from django.db import models

from .constants import MUSCLE_GROUPS


def validate_muscle_groups(value):
    if not isinstance(value, list) or any(v not in MUSCLE_GROUPS for v in value):
        raise ValidationError('muscle_groups must be a list of known muscle group ids.')


class Exercise(models.Model):
    class Category(models.TextChoices):
        CHEST = 'chest', 'Chest'
        BACK = 'back', 'Back'
        SHOULDERS = 'shoulders', 'Shoulders'
        ARMS = 'arms', 'Arms'
        ABS = 'abs', 'Abs'
        LEGS = 'legs', 'Legs'

    class Difficulty(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        EXPERT = 'expert', 'Expert'

    # 英文原名，同时是前端翻译表的键
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)  # 动作步骤，按行分隔
    key_points = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    # 细分肌群 id，第一个为主肌群
    muscle_groups = models.JSONField(default=list, blank=True, validators=[validate_muscle_groups])
    difficulty = models.CharField(max_length=16, choices=Difficulty.choices, default=Difficulty.BEGINNER)
    equipment = models.CharField(max_length=40, blank=True)
    standard_image = models.ImageField(upload_to='exercises/', null=True, blank=True)
    video = models.FileField(upload_to='exercise_videos/', null=True, blank=True)
    # N03：数据来源与许可
    source_name = models.CharField(max_length=100, blank=True)
    source_url = models.URLField(blank=True)
    source_license = models.CharField(max_length=100, blank=True)
    # 分类与翻译是否经过人工抽检
    reviewed = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.name
