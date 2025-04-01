from django.urls import path
from . import views
from django.shortcuts import render

urlpatterns = [
    path('example-view/', views.ExampleView.as_view(), name="example_view"),
    path('formular/', views.eintrag_formular, name='lerninhalt-formular'),
    path('erfolg/', lambda request: render(request, 'curriculum/erfolg.html'), name='formular-erfolg'),
]