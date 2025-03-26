from django.urls import path
from . import views

urlpatterns = [
    path('example-view/', views.ExampleView.as_view(), name="example_view"),
]