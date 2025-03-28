from django.views import View
from django.http import HttpResponse

class ExampleView(View):
    def get(self, request, *args, **kwargs):
        return HttpResponse("Hallo, dies ist eine Example Class Based View!")