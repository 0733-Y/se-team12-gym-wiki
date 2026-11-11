from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from common.responses import ok

from . import services
from .models import Exercise
from .serializers import ExerciseListQuerySerializer, ExerciseSerializer


class ExerciseListView(APIView):
    def get(self, request):
        query = ExerciseListQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        items = services.list_exercises(query.validated_data.get('group'))
        return ok(ExerciseSerializer(items, many=True).data)


class ExerciseDetailView(APIView):
    def get(self, request, pk):
        return ok(ExerciseSerializer(get_object_or_404(Exercise, pk=pk)).data)
