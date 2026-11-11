"""成功响应外壳：{"data": ..., "meta": ...}。"""
from rest_framework import status as http_status
from rest_framework.response import Response


def ok(data=None, meta=None, status=http_status.HTTP_200_OK):
    body = {'data': data}
    if meta is not None:
        body['meta'] = meta
    return Response(body, status=status)


def no_content():
    return Response(status=http_status.HTTP_204_NO_CONTENT)
