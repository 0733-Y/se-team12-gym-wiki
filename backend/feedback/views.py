from rest_framework import status
from rest_framework.views import APIView

from common.responses import no_content, ok
from common.user_context import resolve_user

from . import services
from .serializers import EditInputSerializer, ReportInputSerializer, ReviewInputSerializer, WrongRecordSerializer


def _valid(serializer_class, data):
    s = serializer_class(data=data)
    s.is_valid(raise_exception=True)
    return s.validated_data


class WrongBookListView(APIView):
    def get(self, request):
        records = services.list_records(resolve_user(request))
        return ok(WrongRecordSerializer(records, many=True).data)


class WrongRecordView(APIView):
    def patch(self, request, exercise_id):
        changes = _valid(EditInputSerializer, request.data)
        record = services.edit(resolve_user(request), exercise_id, changes)
        return ok(WrongRecordSerializer(record).data)

    def delete(self, request, exercise_id):
        services.remove(resolve_user(request), exercise_id)
        return no_content()


class WrongRecordReportView(APIView):
    def post(self, request, exercise_id):
        body = _valid(ReportInputSerializer, request.data)
        record, created = services.report(resolve_user(request), exercise_id, **body)
        return ok(WrongRecordSerializer(record).data,
                  status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class WrongRecordReviewView(APIView):
    def post(self, request, exercise_id):
        body = _valid(ReviewInputSerializer, request.data)
        record = services.review(resolve_user(request), exercise_id, body['outcome'])
        return ok(WrongRecordSerializer(record).data)
