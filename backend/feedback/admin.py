from django.contrib import admin

from .models import WrongRecord


@admin.register(WrongRecord)
class WrongRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'exercise', 'error_category', 'mastery_status',
                    'error_count', 'review_count', 'success_streak', 'added_at')
    list_filter = ('mastery_status', 'error_category')
    # 计数字段只能由 feedback/services.py 修改，后台只读
    readonly_fields = ('error_count', 'review_count', 'success_streak', 'added_at', 'last_reviewed_at')
