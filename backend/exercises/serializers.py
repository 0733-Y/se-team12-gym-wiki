from rest_framework import serializers

from .constants import MUSCLE_GROUPS
from .models import Exercise


def media_path(field_file):
    """始终返回以 /media/ 开头的相对路径，前端用 mediaUrl() 拼基础地址。"""
    return field_file.url if field_file else None


class ExerciseSerializer(serializers.ModelSerializer):
    standard_image = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()

    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'description', 'key_points', 'category', 'muscle_groups',
            'difficulty', 'equipment', 'standard_image', 'video',
            'source_name', 'source_url', 'source_license', 'reviewed',
        ]

    def get_standard_image(self, obj):
        return media_path(obj.standard_image)

    def get_video(self, obj):
        return media_path(obj.video)


class ExerciseSummarySerializer(serializers.ModelSerializer):
    """嵌入易错本记录里的动作摘要。"""
    standard_image = serializers.SerializerMethodField()

    class Meta:
        model = Exercise
        fields = ['id', 'name', 'category', 'muscle_groups', 'difficulty', 'equipment', 'standard_image']

    def get_standard_image(self, obj):
        return media_path(obj.standard_image)


class ExerciseListQuerySerializer(serializers.Serializer):
    group = serializers.ChoiceField(choices=MUSCLE_GROUPS, required=False)
