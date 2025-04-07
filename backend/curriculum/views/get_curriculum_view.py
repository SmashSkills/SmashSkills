from django.http import JsonResponse
from curriculum.models import Lehrplan
from .base_view import BaseGetView
from django.views import View
from .serializers import CurriculumSerializer

class LehrplanDetailView(BaseGetView):
    """
    API-Endpunkt für den Abruf detaillierter Informationen zu einem bestimmten Lehrplan.
    
    Diese Ansicht liefert umfassende Daten zu einem Lehrplan, einschließlich seiner Lernbereiche,
    Lernziele, Teilziele und Lerninhalte in einer hierarchischen JSON-Struktur.
    
    Attribute:
        model: Das Lehrplan-Modell
        serializer_fields: Grundlegende Felder, die in die Serialisierung einbezogen werden sollen
        prefetch_related_fields: Verwandte Felder, die für die Abfrageoptimierung vorgeladen werden sollen
        
    Returns:
        JsonResponse: Eine detaillierte JSON-Struktur mit:
            - Grundlegenden Lehrplaninformationen (ID, Klassenstufen, Bundesland, Fach)
            - Lernbereichen mit ihren Nummern, Namen und Unterrichtsstunden
            - Lernzielen mit ihren Beschreibungen
            - Teilzielen mit ihren Beschreibungen
            - Lerninhalten mit ihren Beschreibungen
            
    Verwendung:
        GET /curriculum/curriculum/<id>/
        
        Beispielantwort:
        {
            "Lehrplan_id": 1,
            "Klassenstufen": "5",
            "Bundesland": "Bayern",
            "Fach": "Mathematik",
            "Lernbereiche": [
                {
                    "Lernbereich_id": 1,
                    "Lernbereich_Nummer": 1,
                    "Lernbereich_name": "Algebra",
                    ...
                }
            ]
        }
    """
    
    model = Lehrplan
    serializer_fields = ['id', 'klassenstufen', 'bundesland', 'fach']
    prefetch_related_fields = CurriculumSerializer.get_prefetch_related_fields()

    def serialize_object(self, lehrplan):
        """
        Überschreibt die Serialisierungsmethode, um den CurriculumSerializer zu verwenden.
        
        Args:
            lehrplan: Das zu serialisierende Lehrplanobjekt
            
        Returns:
            dict: Die serialisierte hierarchische Struktur des Lehrplans mit allen zugehörigen Daten
        """
        return CurriculumSerializer.serialize_curriculum(lehrplan)

    def get(self, request, pk):
        """
        Verarbeitet GET-Anfragen für einen spezifischen Lehrplan.
        
        Ruft einen einzelnen Lehrplan anhand seiner ID ab und gibt die detaillierten
        Informationen in einer hierarchischen JSON-Struktur zurück.
        
        Args:
            request: Die HTTP-Anfrage
            pk: Die ID des anzuzeigenden Lehrplans
            
        Returns:
            JsonResponse: Die serialisierte Darstellung des Lehrplans mit allen zugehörigen Daten
        """
        return self.get_detail_response(request, pk)


class LehrplanListView(BaseGetView):
    """
    API-Endpunkt für den Abruf einer paginierten Liste von Lehrplänen mit Filteroptionen.
    
    Diese Ansicht bietet eine paginierte Liste von Lehrplänen mit grundlegenden Informationen und
    unterstützt die Filterung nach Bundesland und Fach.
    
    Attribute:
        model: Das Lehrplan-Modell
        serializer_fields: Felder, die in die Antwort einbezogen werden sollen
        page_size: Anzahl der Elemente pro Seite
        
    Returns:
        JsonResponse: Eine paginierte Liste mit:
            - results: Liste der Lehrpläne mit grundlegenden Informationen
            - pagination: Informationen über aktuelle Seite, Gesamtseitenzahl und Gesamtanzahl der Elemente
            
    Verwendung:
        GET /curriculum/curricula/
        
        Optionale Abfrageparameter:
        - page: Seitennummer (Standard: 1)
        - bundesland: Filter nach Bundesland
        - fach: Filter nach Fach
        
        Beispiel:
        GET /curriculum/curricula/?page=1&bundesland=Bayern&fach=Mathematik
        
        Antwort:
        {
            "results": [
                {
                    "Lehrplan_id": 1,
                    "Klassenstufen": "5",
                    "Bundesland": "Bayern",
                    "Fach": "Mathematik"
                },
                ...
            ],
            "pagination": {
                "total_pages": 5,
                "current_page": 1,
                "total_items": 100
            }
        }
    """
    
    model = Lehrplan
    serializer_fields = ['id', 'klassenstufen', 'bundesland', 'fach']
    page_size = 20

    def apply_filters(self, queryset, request):
        """
        Wendet Filter auf das QuerySet basierend auf Anfrageparametern an.
        
        Args:
            queryset: Das initiale QuerySet, das gefiltert werden soll
            request: Das HTTP-Anfrageobjekt mit Filterparametern
            
        Returns:
            QuerySet: Das gefilterte QuerySet
        """
        bundesland = request.GET.get('bundesland')
        fach = request.GET.get('fach')
        
        if bundesland:
            queryset = queryset.filter(bundesland=bundesland)
        if fach:
            queryset = queryset.filter(fach=fach)
            
        return queryset

    def get(self, request):
        """
        Verarbeitet GET-Anfragen für die paginierte Liste von Lehrplänen.
        
        Ruft eine gefilterte und paginierte Liste von Lehrplänen ab und 
        gibt sie in einem standardisierten JSON-Format zurück. Die Ergebnisse
        können nach Bundesland und Fach gefiltert werden.
        
        Args:
            request: Die HTTP-Anfrage mit optionalen Abfrageparametern für Filterung und Paginierung
            
        Returns:
            JsonResponse: Die paginierte Liste von Lehrplänen mit Paginierungsinformationen
        """
        return self.get_list_response(request)


class LehrplanAllView(View):
    """
    API-Endpunkt für den Abruf aller Lehrpläne ohne Paginierung.
    
    Diese Ansicht gibt alle Lehrpläne mit ihrer vollständigen hierarchischen Struktur zurück,
    einschließlich Lernbereichen, Lernzielen, Teilzielen und Lerninhalten.
    Hinweis: Bei großen Datensätzen mit Vorsicht verwenden, da alle Datensätze auf einmal zurückgegeben werden.
    
    Returns:
        JsonResponse: Eine Liste aller Lehrpläne mit ihrer vollständigen Struktur
        
    Verwendung:
        GET /curriculum/curricula/all/
        
        Antwort:
        [
            {
                "Lehrplan_id": 1,
                "Klassenstufen": "5",
                "Bundesland": "Bayern",
                "Fach": "Mathematik",
                "Lernbereiche": [
                    {
                        "Lernbereich_id": 1,
                        "Lernbereich_Nummer": 1,
                        "Lernbereich_name": "Algebra",
                        ...
                    }
                ]
            },
            ...
        ]
        
    Warnung:
        Dieser Endpunkt gibt alle Datensätze ohne Paginierung zurück.
        Für große Datensätze sollte stattdessen der paginierte Endpunkt
        (/curriculum/curricula/) verwendet werden.
    """
    
    def get(self, request):
        """
        Verarbeitet GET-Anfragen für alle Lehrpläne ohne Paginierung.
        
        Ruft alle verfügbaren Lehrpläne ab und gibt sie mit ihrer vollständigen
        hierarchischen Struktur zurück. Da die Methode alle Datensätze auf einmal
        lädt und serialisiert, kann dies bei großen Datenmengen zu Performance-Problemen
        führen. Die Daten werden optimiert durch Prefetch-Related-Abfragen geladen,
        um die Anzahl der Datenbankabfragen zu minimieren.
        
        Args:
            request: Die HTTP-Anfrage
            
        Returns:
            JsonResponse: Eine Liste aller Lehrpläne mit ihrer vollständigen Struktur
        """
        lehrplaene = Lehrplan.objects.prefetch_related(
            *CurriculumSerializer.get_prefetch_related_fields()
        ).all()

        result = []
        for lehrplan in lehrplaene:
            result.append(CurriculumSerializer.serialize_curriculum(lehrplan))

        return JsonResponse(result, safe=False, json_dumps_params={'indent': 2, 'ensure_ascii': False})
