from rest_framework import serializers

from exercises.serializers import media_path

from .models import TrainingLog, TrainingLogItem

MAX_RANGE_DAYS = 366


class TrainingLogItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = TrainingLogItem
        fields = ['id', 'exercise_id', 'exercise_key', 'exercise_name', 'focus_label',
                  'sets', 'reps', 'rest', 'completed_at', 'image']

    def get_image(self, obj):
        return media_path(obj.exercise.standard_image) if obj.exercise else None


class TrainingLogSerializer(serializers.ModelSerializer):
    items = TrainingLogItemSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingLog
        fields = ['id', 'date', 'weekday', 'title', 'note', 'plan_goal', 'plan_frequency',
                  'total_count', 'completed_count', 'items', 'created_at', 'updated_at']


class CompleteInputSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True, max_length=120)
    plan_goal = serializers.CharField(required=False, allow_blank=True, max_length=40)
    plan_frequency = serializers.IntegerField(required=False, min_value=0, max_value=7)
    total_count = serializers.IntegerField(required=False, min_value=0, max_value=100)
    exercise_name = serializers.CharField(required=False, allow_blank=True, max_length=160)
    focus_label = serializers.CharField(required=False, allow_blank=True, max_length=80)
    sets = serializers.IntegerField(required=False, min_value=0, max_value=100)
    reps = serializers.CharField(required=False, allow_blank=True, max_length=40)
    rest = serializers.CharField(required=False, allow_blank=True, max_length=80)


class RangeQuerySerializer(serializers.Serializer):
    # from 是 Python 关键字，用 source 映射
    from_ = serializers.DateField(input_formats=['%Y-%m-%d'])
    to = serializers.DateField(input_formats=['%Y-%m-%d'])

    def get_fields(self):
        fields = super().get_fields()
        fields['from'] = fields.pop('from_')
        return fields

    def validate(self, attrs):
        start, end = attrs['from'], attrs['to']
        if end < start:
            raise serializers.ValidationError({'to': ['to must not be earlier than from.']})
        if (end - start).days >= MAX_RANGE_DAYS:
            raise serializers.ValidationError({'to': [f'Range must be at most {MAX_RANGE_DAYS} days.']})
        return attrs


class StatsQuerySerializer(serializers.Serializer):
    days = serializers.IntegerField(required=False, default=28, min_value=7, max_value=90)
