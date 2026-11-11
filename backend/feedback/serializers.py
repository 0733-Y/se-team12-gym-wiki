from rest_framework import serializers

from exercises.serializers import ExerciseSummarySerializer

from .models import WrongRecord


class WrongRecordSerializer(serializers.ModelSerializer):
    exercise = ExerciseSummarySerializer(read_only=True)

    class Meta:
        model = WrongRecord
        fields = [
            'id', 'exercise', 'error_category', 'user_note', 'mastery_status',
            'error_count', 'review_count', 'success_streak', 'priority_remind',
            'added_at', 'last_reviewed_at',
        ]
        read_only_fields = fields


class ReportInputSerializer(serializers.Serializer):
    error_category = serializers.ChoiceField(choices=WrongRecord.ErrorCategory.choices)
    user_note = serializers.CharField(required=False, allow_blank=True, default='', max_length=2000)


class EditInputSerializer(serializers.Serializer):
    # 只接受这四个字段；计数字段即使传了也被忽略
    error_category = serializers.ChoiceField(choices=WrongRecord.ErrorCategory.choices, required=False)
    user_note = serializers.CharField(required=False, allow_blank=True, max_length=2000)
    mastery_status = serializers.ChoiceField(choices=WrongRecord.MasteryStatus.choices, required=False)
    priority_remind = serializers.BooleanField(required=False)


class ReviewInputSerializer(serializers.Serializer):
    outcome = serializers.ChoiceField(choices=['fixed', 'recurred'])
