from django.urls import path

from .views import ExerciseDetailView, ExerciseListView

urlpatterns = [
    path('exercises/', ExerciseListView.as_view()),
    path('exercises/<int:pk>/', ExerciseDetailView.as_view()),
]
