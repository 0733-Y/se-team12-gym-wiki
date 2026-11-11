from django.contrib import admin

from .models import TrainingLog, TrainingLogItem


class TrainingLogItemInline(admin.TabularInline):
    model = TrainingLogItem
    extra = 0


@admin.register(TrainingLog)
class TrainingLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'title', 'completed_count', 'total_count')
    list_filter = ('plan_goal',)
    date_hierarchy = 'date'
    inlines = [TrainingLogItemInline]
