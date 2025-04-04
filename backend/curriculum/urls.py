from django.urls import path
from . import views

urlpatterns = [

    path('curriculum/<int:pk>/', views.LehrplanDetailView.as_view(), name='curriculum'),
    path('curricula/all/', views.LehrplanAllView.as_view(), name='curricula_all'),
    path('curricula/list/', views.LehrplanListView.as_view(), name='curricula'), # USEAGE: http://127.0.0.1:8000/curriculum/curricula/list/?page=1
]