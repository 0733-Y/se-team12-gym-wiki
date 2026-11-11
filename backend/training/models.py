from django.conf import settings
from django.db import models

from exercises.models import Exercise


class TrainingLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='training_logs')
    date = models.DateField()
    title = models.CharField(max_length=120, blank=True)
    note = models.TextField(blank=True)
    plan_goal = models.CharField(max_length=40, blank=True)
    plan_frequency = models.PositiveIntegerField(default=0)
    total_count = models.PositiveIntegerField(default=0)
    completed_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']
        constraints = [
            models.UniqueConstraint(fields=['user', 'date'], name='uniq_training_log_user_date'),
        ]

    @property
    def weekday(self):
        """不存储，由 date 推算：周一 = 0。"""
        return self.date.weekday()

    def __str__(self):
        return f'{self.user} {self.date}'


class TrainingLogItem(models.Model):
    log = models.ForeignKey(TrainingLog, on_delete=models.CASCADE, related_name='items')
    exercise = models.ForeignKey(Exercise, on_delete=models.SET_NULL, null=True, blank=True)
    exercise_key = models.CharField(max_length=40)  # = 动作 id 字符串
    exercise_name = models.CharField(max_length=160, blank=True)  # 名称快照
    focus_label = models.CharField(max_length=80, blank=True)
    sets = models.PositiveIntegerField(default=0)
    reps = models.CharField(max_length=40, blank=True)
    rest = models.CharField(max_length=80, blank=True)
    completed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['completed_at', 'id']
        constraints = [
            models.UniqueConstraint(fields=['log', 'exercise_key'], name='uniq_log_item_exercise'),
        ]

    def __str__(self):
        return self.exercise_name
