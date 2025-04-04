from django.http import JsonResponse
from curriculum.models import Lehrplan
from .base_view import BaseGetView
from django.views import View

class LehrplanDetailView(BaseGetView):
    """
    API endpoint for retrieving detailed information about a specific curriculum.
    
    This view provides comprehensive data about a curriculum including its learning areas,
    objectives, sub-objectives, and learning content in a hierarchical JSON structure.
    
    Attributes:
        model: The Lehrplan (Curriculum) model
        serializer_fields: Basic fields to be included in serialization
        prefetch_related_fields: Related fields to be prefetched for query optimization
        
    Returns:
        JsonResponse: A detailed JSON structure containing:
            - Curriculum basic information (id, grade levels, state, subject)
            - Learning areas with their numbers, names, and teaching hours
            - Learning objectives with their descriptions
            - Sub-objectives with their descriptions
            - Learning content with their descriptions
            
    Usage:
        GET /curriculum/curriculum/<id>/
        
        Example Response:
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
    prefetch_related_fields = [
        'lernbereiche',
        'lernbereiche__lernziele',
        'lernbereiche__lernziele__beschreibungen',
        'lernbereiche__lernziele__teilziele',
        'lernbereiche__lernziele__teilziele__beschreibungen',
        'lernbereiche__lernziele__teilziele__lerninhalte',
        'lernbereiche__lernziele__teilziele__lerninhalte__beschreibungen'
    ]

    def serialize_object(self, lehrplan):
        """
        Serializes a curriculum object with all its related data into a hierarchical structure.
        
        Args:
            lehrplan: The curriculum object to serialize
            
        Returns:
            dict: A dictionary containing the complete curriculum structure
        """
        data = {
            "Lehrplan_id": lehrplan.id,
            "Klassenstufen": lehrplan.klassenstufen,
            "Bundesland": lehrplan.bundesland,
            "Fach": lehrplan.fach,
            "Lernbereiche": []
        }

        for lb in lehrplan.lernbereiche.all():
            lb_data = {
                "Lernbereich_id": lb.id,
                "Lernbereich_Nummer": lb.nummer,
                "Lernbereich_name": lb.name,
                "Unterrichtsstunden": lb.unterrichtsstunden,
                "Lernziele": []
            }

            for lz in lb.lernziele.all():
                lz_data = {
                    "Lernziel_id": lz.id,
                    "Lernziel_name": lz.name,
                    "Lernziel_Beschreibungen": [b.text for b in lz.beschreibungen.all()],
                    "Teilziele": []
                }

                for tz in lz.teilziele.all():
                    tz_data = {
                        "Teilziel_id": tz.id,
                        "Teilziel_name": tz.name,
                        "Teilziel_beschreibungen": [b.text for b in tz.beschreibungen.all()],
                        "Lerninhalte": []
                    }

                    for li in tz.lerninhalte.all():
                        li_data = {
                            "Lerninhalt_id": li.id,
                            "Lerninhalt_name": li.name,
                            "Lerninhalt_beschreibungen": [b.text for b in li.beschreibungen.all()]
                        }
                        tz_data["Lerninhalte"].append(li_data)

                    lz_data["Teilziele"].append(tz_data)

                lb_data["Lernziele"].append(lz_data)

            data["Lernbereiche"].append(lb_data)

        return data

    def get(self, request, pk):
        return self.get_detail_response(request, pk)


class LehrplanListView(BaseGetView):
    """
    API endpoint for retrieving a paginated list of curricula with filtering options.
    
    This view provides a paginated list of curricula with basic information and
    supports filtering by state (Bundesland) and subject (Fach).
    
    Attributes:
        model: The Lehrplan (Curriculum) model
        serializer_fields: Fields to include in the response
        page_size: Number of items per page
        
    Returns:
        JsonResponse: A paginated list containing:
            - results: List of curricula with basic information
            - pagination: Information about current page, total pages, and total items
            
    Usage:
        GET /curriculum/curricula/
        
        Optional Query Parameters:
        - page: Page number (default: 1)
        - bundesland: Filter by state
        - fach: Filter by subject
        
        Example:
        GET /curriculum/curricula/?page=1&bundesland=Bayern&fach=Mathematik
        
        Response:
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
        Applies filters to the queryset based on request parameters.
        
        Args:
            queryset: The initial queryset to filter
            request: The HTTP request object containing filter parameters
            
        Returns:
            QuerySet: The filtered queryset
        """
        bundesland = request.GET.get('bundesland')
        fach = request.GET.get('fach')
        
        if bundesland:
            queryset = queryset.filter(bundesland=bundesland)
        if fach:
            queryset = queryset.filter(fach=fach)
            
        return queryset

    def get(self, request):
        return self.get_list_response(request)


class LehrplanAllView(View):
    """
    API endpoint for retrieving all curricula without pagination.
    
    This view returns all curricula with their complete hierarchical structure
    including learning areas, objectives, sub-objectives, and learning content.
    Note: Use with caution on large datasets as it returns all records at once.
    
    Returns:
        JsonResponse: A list of all curricula with their complete structure
        
    Usage:
        GET /curriculum/curricula/all/
        
        Response:
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
        
    Warning:
        This endpoint returns all records without pagination.
        For large datasets, consider using the paginated endpoint
        (/curriculum/curricula/) instead.
    """
    
    def get(self, request):
        """
        Retrieves and serializes all curriculum data.
        
        Returns:
            JsonResponse: A list of all curricula with their complete structure
        """
        lehrplaene = Lehrplan.objects.prefetch_related(
            'lernbereiche',
            'lernbereiche__lernziele',
            'lernbereiche__lernziele__beschreibungen',
            'lernbereiche__lernziele__teilziele',
            'lernbereiche__lernziele__teilziele__beschreibungen',
            'lernbereiche__lernziele__teilziele__lerninhalte',
            'lernbereiche__lernziele__teilziele__lerninhalte__beschreibungen'
        ).all()

        result = []
        for lehrplan in lehrplaene:
            data = {
                "Lehrplan_id": lehrplan.id,
                "Klassenstufen": lehrplan.klassenstufen,
                "Bundesland": lehrplan.bundesland,
                "Fach": lehrplan.fach,
                "Lernbereiche": []
            }

            for lb in lehrplan.lernbereiche.all():
                lb_data = {
                    "Lernbereich_id": lb.id,
                    "Lernbereich_Nummer": lb.nummer,
                    "Lernbereich_name": lb.name,
                    "Unterrichtsstunden": lb.unterrichtsstunden,
                    "Lernziele": []
                }

                for lz in lb.lernziele.all():
                    lz_data = {
                        "Lernziel_id": lz.id,
                        "Lernziel_name": lz.name,
                        "Lernziel_Beschreibungen": [b.text for b in lz.beschreibungen.all()],
                        "Teilziele": []
                    }

                    for tz in lz.teilziele.all():
                        tz_data = {
                            "Teilziel_id": tz.id,
                            "Teilziel_name": tz.name,
                            "Teilziel_beschreibungen": [b.text for b in tz.beschreibungen.all()],
                            "Lerninhalte": []
                        }

                        for li in tz.lerninhalte.all():
                            li_data = {
                                "Lerninhalt_id": li.id,
                                "Lerninhalt_name": li.name,
                                "Lerninhalt_beschreibungen": [b.text for b in li.beschreibungen.all()]
                            }
                            tz_data["Lerninhalte"].append(li_data)

                        lz_data["Teilziele"].append(tz_data)

                    lb_data["Lernziele"].append(lz_data)

                data["Lernbereiche"].append(lb_data)

            result.append(data)

        return JsonResponse(result, safe=False, json_dumps_params={'indent': 2, 'ensure_ascii': False})
