from django.urls import path
from . import views

urlpatterns = [
    path('curricula/', views.LehrplanListView.as_view(), name='curricula'),
    path('curriculum/<int:pk>/', views.LehrplanDetailView.as_view(), name='curriculum'),
]