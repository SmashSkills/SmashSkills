"""
URL-Konfiguration für das Backend-Projekt.

Die Liste `urlpatterns` leitet URLs zu Views weiter. Weitere Informationen finden Sie unter:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Beispiele:
Funktionsbasierte Views
    1. Einen Import hinzufügen:  from my_app import views
    2. Einen URL-Pfad hinzufügen:  path('', views.home, name='home')
Klassenbasierte Views
    1. Einen Import hinzufügen:  from other_app.views import Home
    2. Einen URL-Pfad hinzufügen:  path('', Home.as_view(), name='home')
Eine andere URLconf einbinden
    1. Die include()-Funktion importieren: from django.urls import include, path
    2. Einen URL-Pfad hinzufügen:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from curriculum.admin import curriculum_admin

urlpatterns = [
    #path("grappelli/", include("grappelli.urls")), 
    #path("nested_admin/", include("nested_admin.urls")), 
    #path("admin/", admin.site.urls),
    path('admin/', admin.site.urls),
    path('admin-curriculum/', curriculum_admin.urls),
    path('user/', include('user.urls')),
    path('curriculum/', include('curriculum.urls')), 
]