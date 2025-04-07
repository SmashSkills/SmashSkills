"""
ASGI-Konfiguration für das Backend-Projekt.

Es stellt das ASGI-aufrufbare Objekt als Modul-Level-Variable namens ``application`` bereit.

Weitere Informationen zu dieser Datei finden Sie unter:
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_asgi_application()
