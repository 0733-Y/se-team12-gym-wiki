"""训练日志规则（ARCHITECTURE.md 4.4）。"""
from datetime import timedelta

from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone

from exercises.models import Exercise

from .models import TrainingLog, TrainingLogItem

LOG_FIELDS = ('title', 'plan_goal', 'plan_frequency', 'total_count')
ITEM_FIELDS = ('exercise_name', 'focus_label', 'sets', 'reps', 'rest')


def _with_items(qs):
    return qs.prefetch_related('items__exercise')


def get_day(user, day):
    return _with_items(TrainingLog.objects.filter(user=user, date=day)).first()


def list_range(user, start, end):
    return list(_with_items(TrainingLog.objects.filter(user=user, date__range=(start, end))))


def _refresh_count(log):
    log.completed_count = log.items.count()
    log.save(update_fields=['completed_count', 'updated_at'])


@transaction.atomic
def complete(user, day, exercise_id, meta):
    """标记完成。重复提交结果不变（幂等）。"""
    exercise = get_object_or_404(Exercise, pk=exercise_id)
    log_values = {k: meta[k] for k in LOG_FIELDS if k in meta}
    log, created = TrainingLog.objects.select_for_update().get_or_create(user=user, date=day, defaults=log_values)
    if not created and log_values:
        for k, v in log_values.items():
            setattr(log, k, v)
        log.save()

    item_values = {k: meta[k] for k in ITEM_FIELDS if k in meta}
    item_values.setdefault('exercise_name', exercise.name)
    item_values['exercise'] = exercise
    TrainingLogItem.objects.update_or_create(log=log, exercise_key=str(exercise.id), defaults=item_values)
    _refresh_count(log)
    return get_day(user, day)


@transaction.atomic
def uncomplete(user, day, exercise_id):
    """取消完成；当天没有条目了就删除日志。返回更新后的日志或 None。"""
    log = TrainingLog.objects.select_for_update().filter(user=user, date=day).first()
    if log is None:
        return None
    log.items.filter(exercise_key=str(exercise_id)).delete()
    if not log.items.exists():
        log.delete()
        return None
    _refresh_count(log)
    return get_day(user, day)


def _streak(user, today):
    """从今天往前连续有完成记录的天数（今天没练则为 0，沿用旧规则）。"""
    dates = set(TrainingLog.objects.filter(user=user, completed_count__gt=0, date__lte=today)
                .values_list('date', flat=True))
    streak, cursor = 0, today
    while cursor in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def stats(user, days):
    """最近 days 天（含今天）的每日序列与汇总。days 已由序列化器限制在 7–90。"""
    today = timezone.localdate()
    start = today - timedelta(days=days - 1)
    logs = TrainingLog.objects.filter(user=user, date__range=(start, today))
    by_date = {log.date: log for log in logs}
    series = []
    for offset in range(days):
        d = start + timedelta(days=offset)
        log = by_date.get(d)
        series.append({
            'date': d.isoformat(),
            'completed_count': log.completed_count if log else 0,
            'total_count': log.total_count if log else 0,
        })
    summary = {
        'days': days,
        'workout_days': logs.filter(completed_count__gt=0).count(),
        'completed_total': logs.aggregate(total=Sum('completed_count'))['total'] or 0,
        'streak': _streak(user, today),
    }
    return series, summary
