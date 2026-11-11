from django.urls import path

from .views import WrongBookListView, WrongRecordReportView, WrongRecordReviewView, WrongRecordView

urlpatterns = [
    path('wrong-book/', WrongBookListView.as_view()),
    path('wrong-book/<int:exercise_id>/', WrongRecordView.as_view()),
    path('wrong-book/<int:exercise_id>/report/', WrongRecordReportView.as_view()),
    path('wrong-book/<int:exercise_id>/review/', WrongRecordReviewView.as_view()),
]
