"""易错本状态机（ARCHITECTURE.md 4.3）。
error_count / review_count / success_streak 只在本模块修改。"""
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from exercises.models import Exercise

from .models import WrongRecord

Status = WrongRecord.MasteryStatus
MASTERY_STREAK = 3  # 连续做对几次算掌握


def list_records(user):
    return WrongRecord.objects.filter(user=user).select_related('exercise')


def _get_record(user, exercise_id, lock=True):
    qs = WrongRecord.objects.select_related('exercise')
    if lock:
        qs = qs.select_for_update()
    return get_object_or_404(qs, user=user, exercise_id=exercise_id)


@transaction.atomic
def report(user, exercise_id, error_category, user_note=''):
    """自检发现问题。返回 (记录, 是否新建)。"""
    exercise = get_object_or_404(Exercise, pk=exercise_id)
    record, created = WrongRecord.objects.select_for_update().get_or_create(
        user=user, exercise=exercise,
        defaults={'error_category': error_category, 'user_note': user_note},
    )
    if not created:
        record.error_count += 1
        record.error_category = error_category
        record.user_note = user_note
    record.mastery_status = Status.UNFIXED
    record.success_streak = 0
    record.save()
    return record, created


@transaction.atomic
def review(user, exercise_id, outcome):
    """复习结果：outcome 为 'fixed' 或 'recurred'。"""
    record = _get_record(user, exercise_id)
    record.review_count += 1
    if outcome == 'fixed':
        record.success_streak += 1
        record.mastery_status = Status.MASTERED if record.success_streak >= MASTERY_STREAK else Status.PRACTICING
    else:
        record.error_count += 1
        record.success_streak = 0
        record.mastery_status = Status.UNFIXED
    record.last_reviewed_at = timezone.now()
    record.save()
    return record


EDITABLE_FIELDS = ('error_category', 'user_note', 'mastery_status', 'priority_remind')


@transaction.atomic
def edit(user, exercise_id, changes):
    """手动编辑笔记/原因/状态/提醒。计数字段不在可编辑列表里。"""
    record = _get_record(user, exercise_id)
    for field in EDITABLE_FIELDS:
        if field in changes:
            setattr(record, field, changes[field])
    if 'mastery_status' in changes:
        if changes['mastery_status'] == Status.MASTERED:
            record.success_streak = max(record.success_streak, MASTERY_STREAK)
        else:
            record.success_streak = 0
    record.save()
    return record


@transaction.atomic
def remove(user, exercise_id):
    _get_record(user, exercise_id).delete()
