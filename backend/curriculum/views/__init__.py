"""
Views-Modul für die Curriculum-App.

Dieses Modul exportiert die benötigten Views für die Curriculum-API-Endpunkte.

Exportierte Klassen:
    - LehrplanDetailView: API-Endpunkt für detaillierte Informationen zu einem einzelnen Lehrplan
    - LehrplanListView: API-Endpunkt für eine paginierte Liste von Lehrplänen mit Filteroptionen
    - LehrplanAllView: API-Endpunkt für alle Lehrpläne ohne Paginierung (mit Vorsicht zu verwenden)
"""

from .get_curriculum_view import (
    LehrplanDetailView,
    LehrplanListView,
    LehrplanAllView
)

__all__ = [
    'LehrplanDetailView',
    'LehrplanListView',
    'LehrplanAllView',
]



