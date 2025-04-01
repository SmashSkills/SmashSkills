from django import forms
from .models import *

class Komplettformular(forms.Form):
    bundesland = forms.ModelChoiceField(queryset=Bundesland.objects.all())
    klassenstufe = forms.ModelChoiceField(queryset=Klassenstufe.objects.all())
    fach_titel = forms.CharField(max_length=100)

    lernfeld = forms.CharField(max_length=100)
    unterrichtseinheiten = forms.IntegerField(min_value=1)

    lernziel = forms.CharField(max_length=100)
    lernziel_beschreibung = forms.CharField(widget=forms.Textarea)

    teilziel = forms.CharField(max_length=100)
    teilziel_beschreibung = forms.CharField(widget=forms.Textarea)

    lerninhalt = forms.CharField(max_length=100)
    lerninhalt_beschreibung = forms.CharField(widget=forms.Textarea)
