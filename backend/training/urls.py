from django.urls import path

from .views import TrainingLogDayView, TrainingLogItemView, TrainingLogRangeView, TrainingStatsView

# stats/ 必须放在 <str:day>/ 之前
urlpatterns = [
    path('training-logs/', TrainingLogRangeView.as_view()),
    path('training-logs/stats/', TrainingStatsView.as_view()),
    path('training-logs/<str:day>/', TrainingLogDayView.as_view()),
    path('training-logs/<str:day>/items/<int:exercise_id>/', TrainingLogItemView.as_view()),
]
