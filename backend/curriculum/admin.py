from django.contrib import admin
from .models import (
    Bundesland,
    Klassenstufe,
    Fach,
    Lernfeld,
    Lernziele,
    Lernziele_Beschreibung,
    Teilziele,
    Teilziele_Beschreibung,
    Lerninhalt,
    Lerninhalt_Beschreibung
)

# ========== BASISMODELLE ==========

@admin.register(Bundesland)
class BundeslandAdmin(admin.ModelAdmin):
    search_fields = ['bundesland']
    list_display = ['bundesland']


@admin.register(Klassenstufe)
class KlassenstufeAdmin(admin.ModelAdmin):
    search_fields = ['klassenstufe']
    list_display = ['klassenstufe']


# ========== INLINE DEFINIEREN ==========

class LerninhaltBeschreibungInline(admin.TabularInline):
    model = Lerninhalt_Beschreibung
    extra = 1


class LerninhaltInline(admin.TabularInline):
    model = Lerninhalt
    extra = 1


class TeilzielBeschreibungInline(admin.TabularInline):
    model = Teilziele_Beschreibung
    extra = 1


class TeilzielInline(admin.TabularInline):
    model = Teilziele
    extra = 1


class LernzieleBeschreibungInline(admin.TabularInline):
    model = Lernziele_Beschreibung
    extra = 1


class LernzieleInline(admin.TabularInline):
    model = Lernziele
    extra = 1


class LernfeldInline(admin.TabularInline):
    model = Lernfeld
    extra = 1


# ========== MODELADMINS ==========

@admin.register(Fach)
class FachAdmin(admin.ModelAdmin):
    list_display = ['fach_titel', 'bundesland', 'klassenstufe']
    search_fields = ['fach_titel']
    autocomplete_fields = ['bundesland', 'klassenstufe']
    inlines = [LernfeldInline]


@admin.register(Lernfeld)
class LernfeldAdmin(admin.ModelAdmin):
    list_display = ['lernfeld', 'unterrichtseinheiten', 'fach_id']
    search_fields = ['lernfeld', 'fach_id__fach_titel']
    autocomplete_fields = ['fach_id']
    inlines = [LernzieleInline]


@admin.register(Lernziele)
class LernzieleAdmin(admin.ModelAdmin):
    list_display = ['lernziel', 'lernfeld_id']
    search_fields = ['lernziel', 'lernfeld_id__lernfeld']
    autocomplete_fields = ['lernfeld_id']
    inlines = [TeilzielInline, LernzieleBeschreibungInline]


@admin.register(Teilziele)
class TeilzieleAdmin(admin.ModelAdmin):
    list_display = ['teilziel', 'lernziele_id']
    search_fields = ['teilziel', 'lernziele_id__lernziel']
    autocomplete_fields = ['lernziele_id']
    inlines = [LerninhaltInline, TeilzielBeschreibungInline]


@admin.register(Lerninhalt)
class LerninhaltAdmin(admin.ModelAdmin):
    list_display = ['lerninhalt', 'teilziel_id']
    search_fields = ['lerninhalt', 'teilziel_id__teilziel']
    autocomplete_fields = ['teilziel_id']
    inlines = [LerninhaltBeschreibungInline]


@admin.register(Lerninhalt_Beschreibung)
class LerninhaltBeschreibungAdmin(admin.ModelAdmin):
    list_display = ['lerninhalt_beschreibung']
    autocomplete_fields = ['lerninhalt_id']
    search_fields = ['lerninhalt_beschreibung', 'lerninhalt_id__lerninhalt']


@admin.register(Lernziele_Beschreibung)
class LernzieleBeschreibungAdmin(admin.ModelAdmin):
    list_display = ['lernziel_beschreibung']
    autocomplete_fields = ['lernziel_id']
    search_fields = ['lernziel_beschreibung', 'lernziel_id__lernziel']


@admin.register(Teilziele_Beschreibung)
class TeilzieleBeschreibungAdmin(admin.ModelAdmin):
    list_display = ['teilziel_beschreibung']
    autocomplete_fields = ['teilziel_id']
    search_fields = ['teilziel_beschreibung', 'teilziel_id__teilziel']
