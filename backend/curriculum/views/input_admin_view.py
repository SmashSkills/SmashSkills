from django.shortcuts import render, redirect
from ..forms import Komplettformular
from ..models import *

def eintrag_formular(request):
    if request.method == 'POST':
        form = Komplettformular(request.POST)
        if form.is_valid():
            # 1. Bundesland, Klassenstufe und Fach
            fach = Fach.objects.create(
                fach_titel=form.cleaned_data['fach_titel'],
                bundesland=form.cleaned_data['bundesland'],
                klassenstufe=form.cleaned_data['klassenstufe']
            )

            # 2. Lernfeld
            lernfeld = Lernfeld.objects.create(
                fach_id=fach,
                lernfeld=form.cleaned_data['lernfeld'],
                unterrichtseinheiten=form.cleaned_data['unterrichtseinheiten']
            )

            # 3. Lernziel
            lernziel = Lernziele.objects.create(
                lernfeld_id=lernfeld,
                lernziel=form.cleaned_data['lernziel']
            )
            Lernziele_Beschreibung.objects.create(
                lernziel_id=lernziel,
                lernziel_beschreibung=form.cleaned_data['lernziel_beschreibung']
            )

            # 4. Teilziel
            teilziel = Teilziele.objects.create(
                lernziele_id=lernziel,
                teilziel=form.cleaned_data['teilziel']
            )
            Teilziele_Beschreibung.objects.create(
                teilziel_id=teilziel,
                teilziel_beschreibung=form.cleaned_data['teilziel_beschreibung']
            )

            # 5. Lerninhalt
            lerninhalt = Lerninhalt.objects.create(
                teilziel_id=teilziel,
                lerninhalt=form.cleaned_data['lerninhalt']
            )
            Lerninhalt_Beschreibung.objects.create(
                lerninhalt_id=lerninhalt,
                lerninhalt_beschreibung=form.cleaned_data['lerninhalt_beschreibung']
            )

            return redirect('formular-erfolg')  # eigene URL für Bestätigungsseite
    else:
        form = Komplettformular()

    return render(request, 'curriculum/admin_form.html', {'form': form})
