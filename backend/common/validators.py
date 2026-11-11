"""路径参数校验。"""
from datetime import date

from rest_framework.exceptions import ValidationError


def parse_path_date(value, field='date'):
    """把 URL 里的 YYYY-MM-DD 转成 date，格式或日期无效时抛 400。"""
    try:
        if len(value) != 10:
            raise ValueError
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        raise ValidationError({field: ['Date must be YYYY-MM-DD.']})
