"""全系统唯一获取"当前用户"的地方。以后加登录只改这里。"""
from django.contrib.auth import get_user_model

DEMO_USERNAME = 'demo'


def resolve_user(request):
    """已登录用已登录用户，否则取/建 demo 用户。"""
    user = getattr(request, 'user', None)
    if user is not None and user.is_authenticated:
        return user
    demo, _ = get_user_model().objects.get_or_create(username=DEMO_USERNAME)
    return demo
