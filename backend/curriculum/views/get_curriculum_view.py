from django.http import JsonResponse, Http404
from django.views import View
from curriculum.models import Lehrplan

class LehrplanDetailView(View):
    """
    A view class that handles requests for detailed curriculum (Lehrplan) information.
    
    This class provides a RESTful endpoint to retrieve comprehensive details about a specific curriculum,
    including all its nested components like learning areas (Lernbereiche), learning objectives (Lernziele),
    sub-objectives (Teilziele), and learning content (Lerninhalte).
    
    Methods:
        get(request, pk): Handles GET requests to retrieve a specific curriculum by its primary key.
            
    Returns:
        JsonResponse: A hierarchical JSON structure containing:
            - Basic curriculum information (id, grade levels, state, subject)
            - Learning areas with their numbers, names and teaching hours
            - Learning objectives with their descriptions
            - Sub-objectives with their descriptions
            - Learning content with their descriptions
            
    Raises:
        Http404: If the requested curriculum does not exist
    """
    def get(self, request, pk):
        try:
            lehrplan = Lehrplan.objects.get(pk=pk)
        except Lehrplan.DoesNotExist:
            raise Http404("Lehrplan nicht gefunden.")

        response = {
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

            response["Lernbereiche"].append(lb_data)

        return JsonResponse(response, json_dumps_params={"ensure_ascii": False, "indent": 2})
    

class LehrplanListView(View):
    """
    A view class that handles requests for listing all curricula (Lehrpläne).
    
    This class provides a RESTful endpoint to retrieve a list of all curricula with their complete
    hierarchical structure, including learning areas, objectives, sub-objectives and learning content.
    The view optimizes database queries using prefetch_related to avoid the N+1 query problem.
    
    Methods:
        get(request): Handles GET requests to retrieve all curricula.
            
    Returns:
        JsonResponse: A list of curricula, each containing:
            - Basic curriculum information (id, grade levels, state, subject)
            - Learning areas with their numbers, names and teaching hours
            - Learning objectives with their descriptions
            - Sub-objectives with their descriptions
            - Learning content with their descriptions
    """
    def get(self, request):
        lehrplaene = Lehrplan.objects.prefetch_related(
            "lernbereiche__lernziele__beschreibungen",
            "lernbereiche__lernziele__teilziele__beschreibungen",
            "lernbereiche__lernziele__teilziele__lerninhalte__beschreibungen"
        ).all()

        result = []

        for lehrplan in lehrplaene:
            lehrplan_data = {
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

                lehrplan_data["Lernbereiche"].append(lb_data)

            result.append(lehrplan_data)

        return JsonResponse(result, safe=False, json_dumps_params={"ensure_ascii": False, "indent": 2})
