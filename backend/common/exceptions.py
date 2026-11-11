"""统一错误外壳：{"error": {"code", "message", "fields"?}}（ARCHITECTURE.md 第5节）。"""
import logging

from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import Http404, JsonResponse
from rest_framework import exceptions, status
from rest_framework.response import Response

logger = logging.getLogger(__name__)

VALIDATION_ERROR = 'validation_error'
NOT_FOUND = 'not_found'
CONFLICT = 'conflict'
SERVER_ERROR = 'server_error'


def error_body(code, message, fields=None):
    err = {'code': code, 'message': message}
    if fields:
        err['fields'] = fields
    return {'error': err}


def _flatten_message(detail):
    """取 DRF 错误详情里的第一条文字作为 message。"""
    if isinstance(detail, dict):
        for value in detail.values():
            return _flatten_message(value)
    if isinstance(detail, list) and detail:
        return _flatten_message(detail[0])
    return str(detail)


def api_exception_handler(exc, context):
    if isinstance(exc, (Http404, ObjectDoesNotExist)):
        return Response(error_body(NOT_FOUND, 'Not found.'), status=status.HTTP_404_NOT_FOUND)

    if isinstance(exc, IntegrityError):
        return Response(error_body(CONFLICT, 'Conflict.'), status=status.HTTP_409_CONFLICT)

    if isinstance(exc, exceptions.ValidationError):
        detail = exc.detail
        fields = detail if isinstance(detail, dict) else None
        return Response(error_body(VALIDATION_ERROR, _flatten_message(detail), fields),
                        status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, exceptions.NotFound):
        return Response(error_body(NOT_FOUND, str(exc.detail)), status=status.HTTP_404_NOT_FOUND)

    if isinstance(exc, exceptions.APIException):
        # ParseError、MethodNotAllowed 等其余 4xx：保留原状态码，归为 validation_error
        code = VALIDATION_ERROR if exc.status_code < 500 else SERVER_ERROR
        return Response(error_body(code, str(exc.detail)), status=exc.status_code)

    logger.exception('Unhandled API error', exc_info=exc)
    return Response(error_body(SERVER_ERROR, 'Server error.'), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# DRF 视图之外（未匹配的 URL、中间件错误）的兜底处理
def handler404(request, exception=None):
    return JsonResponse(error_body(NOT_FOUND, 'Not found.'), status=404)


def handler500(request):
    return JsonResponse(error_body(SERVER_ERROR, 'Server error.'), status=500)
