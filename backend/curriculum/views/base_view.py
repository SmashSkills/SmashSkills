from django.views import View
from django.http import JsonResponse, Http404
from django.core.paginator import Paginator

class BaseGetView(View):
    """
    A base class for handling GET requests with standardized response formats, pagination, and filtering.
    
    This class provides a foundation for creating REST API views with common functionality such as:
    - Pagination
    - Object serialization
    - Query filtering
    - Detailed and list responses
    
    Attributes:
        model (Model): The Django model class to be used for queries
        serializer_fields (list): List of model fields to include in serialization
        prefetch_related_fields (list): List of related fields to prefetch for optimization
        page_size (int): Number of items per page for paginated responses
        
    Usage Example:
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
        """Basis-Methode zum Abrufen des QuerySets"""
        if not self.model:
            raise NotImplementedError("model muss in der erbenden Klasse definiert werden")
        
        queryset = self.model.objects
        if self.prefetch_related_fields:
            queryset = queryset.prefetch_related(*self.prefetch_related_fields)
        return queryset

    def apply_filters(self, queryset, request):
        """
        Basis-Methode zum Anwenden von Filtern
        Kann in erbenden Klassen überschrieben werden
        """
        return queryset

    def paginate_queryset(self, queryset, request):
        """Basis-Methode für Pagination"""
        page = request.GET.get('page', 1)
        try:
            page = int(page)
        except ValueError:
            page = 1
        
        paginator = Paginator(queryset, self.page_size)
        try:
            page_obj = paginator.page(page)
        except:
            page_obj = paginator.page(1)
            
        return {
            'items': page_obj.object_list,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'total_items': paginator.count
        }

    def serialize_object(self, obj):
        """
        Basis-Methode zum Serialisieren eines einzelnen Objekts
        Kann in erbenden Klassen überschrieben werden
        """
        if not self.serializer_fields:
            raise NotImplementedError("serializer_fields muss in der erbenden Klasse definiert werden")
            
        return {field: getattr(obj, field) for field in self.serializer_fields}

    def get_single_object(self, pk):
        """Basis-Methode zum Abrufen eines einzelnen Objekts"""
        try:
            return self.get_queryset().get(pk=pk)
        except self.model.DoesNotExist:
            raise Http404(f"{self.model.__name__} nicht gefunden")

    def get_list_response(self, request):
        """Basis-Methode für List-View Response"""
        queryset = self.get_queryset()
        queryset = self.apply_filters(queryset, request)
        paginated_data = self.paginate_queryset(queryset, request)
        
        return JsonResponse({
            'results': [self.serialize_object(obj) for obj in paginated_data['items']],
            'pagination': {
                'total_pages': paginated_data['total_pages'],
                'current_page': paginated_data['current_page'],
                'total_items': paginated_data['total_items']
            }
        }, safe=False, json_dumps_params={'indent': 2, 'ensure_ascii': False})

    def get_detail_response(self, request, pk):
        """Basis-Methode für Detail-View Response"""
        obj = self.get_single_object(pk)
        return JsonResponse(self.serialize_object(obj), safe=False, json_dumps_params={'indent': 2, 'ensure_ascii': False}) 