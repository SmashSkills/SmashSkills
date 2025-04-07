"""
WSGI-Konfiguration für das Backend-Projekt.

Es stellt das WSGI-aufrufbare Objekt als Modul-Level-Variable namens ``application`` bereit.

Weitere Informationen zu dieser Datei finden Sie unter:
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()
