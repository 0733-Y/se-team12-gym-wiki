from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

from common.exceptions import handler404 as api_not_found

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('exercises.urls')),
    path('api/', include('feedback.urls')),
    path('api/', include('training.urls')),
    # /api/ 下未匹配的路径也返回统一错误外壳（DEBUG 下 Django 默认会给 HTML 页）
    re_path(r'^api/', api_not_found),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler404 = 'common.exceptions.handler404'
handler500 = 'common.exceptions.handler500'
