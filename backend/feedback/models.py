from django.conf import settings
from django.db import models

from exercises.models import Exercise


class WrongRecord(models.Model):
    """易错本记录（旧 WrongActionBook）。
    error_count / review_count / success_streak 只能由 feedback/services.py 修改。"""

    class ErrorCategory(models.TextChoices):
        FORM = 'form', 'Unstable form'
        MUSCLE = 'muscle', 'Poor muscle activation'
        JOINT = 'joint', 'Joint discomfort'
        WEIGHT = 'weight', 'Weight too heavy'
        PATH = 'path', 'Wrong movement path'
        BREATHING = 'breathing', 'Wrong breathing rhythm'

    class MasteryStatus(models.TextChoices):
        UNFIXED = 'unfixed', 'Unfixed'
        PRACTICING = 'practicing', 'Practicing'
        MASTERED = 'mastered', 'Mastered'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wrong_records')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='wrong_records')
    error_category = models.CharField(max_length=24, choices=ErrorCategory.choices, default=ErrorCategory.FORM)
    user_note = models.TextField(blank=True)
    mastery_status = models.CharField(max_length=24, choices=MasteryStatus.choices, default=MasteryStatus.UNFIXED)
    error_count = models.PositiveIntegerField(default=1)
    review_count = models.PositiveIntegerField(default=0)
    success_streak = models.PositiveIntegerField(default=0)
    priority_remind = models.BooleanField(default=True)
    added_at = models.DateTimeField(auto_now_add=True)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-added_at', '-id']
        constraints = [
            models.UniqueConstraint(fields=['user', 'exercise'], name='uniq_wrong_record_user_exercise'),
        ]

    def __str__(self):
        return f'{self.user} · {self.exercise}'
