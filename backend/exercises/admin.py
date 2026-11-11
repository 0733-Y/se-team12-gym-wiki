from django.contrib import admin

from .models import Exercise


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'difficulty', 'equipment', 'reviewed')
    list_filter = ('category', 'difficulty', 'reviewed')
    search_fields = ('name',)
    list_editable = ('reviewed',)
