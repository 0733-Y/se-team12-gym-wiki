from .models import Exercise


def list_exercises(group=None):
    """全部动作；给了 group 时只保留 muscle_groups 含该肌群的。
    SQLite 不支持 JSONField 的 contains 查询，动作数量小，在 Python 里过滤。"""
    qs = Exercise.objects.all()
    if not group:
        return list(qs)
    return [e for e in qs if group in (e.muscle_groups or [])]
