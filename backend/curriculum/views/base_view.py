from django.views import View
from django.http import JsonResponse, Http404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

class BaseGetView(View):
    """
    Eine Basisklasse für die Verarbeitung von GET-Anfragen mit standardisierten Antwortformaten, Paginierung und Filterung.
    
    Diese Klasse bietet eine Grundlage für die Erstellung von REST-API-Views mit gemeinsamen Funktionalitäten wie:
    - Paginierung
    - Objekt-Serialisierung
    - Query-Filterung
    - Detaillierte und Listen-Antworten
    
    Attribute:
        model (Model): Die Django-Modellklasse, die für Abfragen verwendet werden soll
        serializer_fields (list): Liste der Modellfelder, die in die Serialisierung einbezogen werden sollen
        prefetch_related_fields (list): Liste der verwandten Felder, die für die Optimierung vorgeladen werden sollen
        page_size (int): Anzahl der Elemente pro Seite für paginierte Antworten
        
    Verwendungsbeispiel:
        class MyModelView(BaseGetView):
            model = MyModel
            serializer_fields = ['id', 'name', 'description']
            prefetch_related_fields = ['related_items']
            page_size = 20
            
            def apply_filters(self, queryset, request):
                category = request.GET.get('category')
                if category:
                    queryset = queryset.filter(category=category)
                return queryset
    """
    
    model = None  
    serializer_fields = []  
    prefetch_related_fields = []  
    page_size = 10  
    
    def get_queryset(self):
        """
        Ruft das Basis-QuerySet für das Modell ab.
        
        Returns:
            QuerySet: Das QuerySet des Modells mit vorgeladenen verwandten Feldern
            
        Raises:
            NotImplementedError: Wenn das model-Attribut nicht definiert ist
        """
        if not self.model:
            raise NotImplementedError("model muss in der erbenden Klasse definiert werden")
        
        queryset = self.model.objects
        if self.prefetch_related_fields:
            queryset = queryset.prefetch_related(*self.prefetch_related_fields)
        return queryset

    def apply_filters(self, queryset, request):
        """
        Wendet Filter auf das QuerySet basierend auf Anfrageparametern an.
        Diese Methode sollte in Unterklassen überschrieben werden, um benutzerdefinierte Filterung zu implementieren.
        
        Args:
            queryset (QuerySet): Das initiale QuerySet, das gefiltert werden soll
            request (HttpRequest): Das HTTP-Anfrageobjekt mit Filterparametern
            
        Returns:
            QuerySet: Das gefilterte QuerySet
        """
        return queryset

    def paginate_queryset(self, queryset, request):
        """
        Paginiert das QuerySet basierend auf dem Seitenparameter in der Anfrage.
        
        Args:
            queryset (QuerySet): Das zu paginierende QuerySet
            request (HttpRequest): Das HTTP-Anfrageobjekt mit dem Seitenparameter
            
        Returns:
            dict: Ein Dictionary mit den paginierten Elementen und Paginierungsinformationen
        """
        page = request.GET.get('page', 1)
        try:
            page = int(page)
        except ValueError:
            page = 1
        
        paginator = Paginator(queryset, self.page_size)
        try:
            page_obj = paginator.page(page)
        except PageNotAnInteger:
            page_obj = paginator.page(1)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)
            
        return {
            'items': page_obj.object_list,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'total_items': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous()
        }

    def serialize_object(self, obj):
        """
        Serialisiert ein Modellobjekt in ein Dictionary für die JSON-Antwort.
        Diese Methode sollte in Unterklassen für benutzerdefinierte Serialisierung überschrieben werden.
        
        Args:
            obj: Das zu serialisierende Modellobjekt
            
        Returns:
            dict: Eine Dictionary-Darstellung des Objekts
            
        Raises:
            NotImplementedError: Wenn serializer_fields nicht definiert ist
        """
        if not self.serializer_fields:
            raise NotImplementedError("serializer_fields muss in der erbenden Klasse definiert werden")
            
        return {field: getattr(obj, field) for field in self.serializer_fields}

    def get_single_object(self, pk):
        """
        Ruft ein einzelnes Objekt anhand seines Primärschlüssels ab.
        
        Args:
            pk: Der Primärschlüssel des abzurufenden Objekts
            
        Returns:
            Model: Das angeforderte Objekt
            
        Raises:
            Http404: Wenn das Objekt nicht existiert
        """
        try:
            return self.get_queryset().get(pk=pk)
        except self.model.DoesNotExist:
            raise Http404(f"{self.model.__name__} nicht gefunden")

    def get_list_response(self, request):
        """
        Generiert eine standardisierte JSON-Antwort für eine Listenansicht.
        
        Args:
            request (HttpRequest): Das HTTP-Anfrageobjekt
            
        Returns:
            JsonResponse: Eine JSON-Antwort mit den serialisierten Objekten und Paginierungsinformationen
        """
        queryset = self.get_queryset()
        queryset = self.apply_filters(queryset, request)
        paginated_data = self.paginate_queryset(queryset, request)
        
        return JsonResponse({
            'results': [self.serialize_object(obj) for obj in paginated_data['items']],
            'pagination': {
                'total_pages': paginated_data['total_pages'],
                'current_page': paginated_data['current_page'],
                'total_items': paginated_data['total_items'],
                'has_next': paginated_data['has_next'],
                'has_previous': paginated_data['has_previous']
            }
        }, safe=False, json_dumps_params={'indent': 2, 'ensure_ascii': False})

    def get_detail_response(self, request, pk):
        """
        Generiert eine standardisierte JSON-Antwort für eine Detailansicht.
        
        Args:
            request (HttpRequest): Das HTTP-Anfrageobjekt
            pk: Der Primärschlüssel des abzurufenden Objekts
            
        Returns:
            JsonResponse: Eine JSON-Antwort mit dem serialisierten Objekt
        """
        obj = self.get_single_object(pk)
        return JsonResponse(self.serialize_object(obj), safe=False, json_dumps_params={'indent': 2, 'ensure_ascii': False}) 