from rest_framework.views import APIView

from common.responses import ok
from common.user_context import resolve_user
from common.validators import parse_path_date

from . import services
from .serializers import CompleteInputSerializer, RangeQuerySerializer, StatsQuerySerializer, TrainingLogSerializer


def _valid(serializer_class, data):
    s = serializer_class(data=data)
    s.is_valid(raise_exception=True)
    return s.validated_data


def _log_data(log):
    return TrainingLogSerializer(log).data if log else None


class TrainingLogRangeView(APIView):
    def get(self, request):
        q = _valid(RangeQuerySerializer, request.query_params)
        logs = services.list_range(resolve_user(request), q['from'], q['to'])
        return ok(TrainingLogSerializer(logs, many=True).data)


class TrainingLogDayView(APIView):
    def get(self, request, day):
        return ok(_log_data(services.get_day(resolve_user(request), parse_path_date(day))))


class TrainingLogItemView(APIView):
    def put(self, request, day, exercise_id):
        d = parse_path_date(day)
        meta = _valid(CompleteInputSerializer, request.data)
        return ok(_log_data(services.complete(resolve_user(request), d, exercise_id, meta)))

    def delete(self, request, day, exercise_id):
        d = parse_path_date(day)
        return ok(_log_data(services.uncomplete(resolve_user(request), d, exercise_id)))


class TrainingStatsView(APIView):
    def get(self, request):
        q = _valid(StatsQuerySerializer, request.query_params)
        series, summary = services.stats(resolve_user(request), q['days'])
        return ok(series, meta=summary)
