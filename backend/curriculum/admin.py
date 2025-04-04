import nested_admin
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from .models import (
    Lehrplan, Lernbereich, Lernziel, LernzielBeschreibung,
    Teilziel, TeilzielBeschreibung, Lerninhalt, LerninhaltBeschreibung
)

# ========== Import-Export Resources ==========

class LehrplanResource(resources.ModelResource):
    class Meta:
        model = Lehrplan
        fields = ("id", "klassenstufen", "bundesland", "fach")

class LernbereichResource(resources.ModelResource):
    lehrplan = fields.Field(
        column_name="lehrplan",
        attribute="lehrplan",
        widget=ForeignKeyWidget(Lehrplan, "fach")
    )

    class Meta:
        model = Lernbereich
        fields = ("id", "lehrplan", "nummer", "name", "unterrichtsstunden")

class LernzielResource(resources.ModelResource):
    lernbereich = fields.Field(
        column_name="lernbereich",
        attribute="lernbereich",
        widget=ForeignKeyWidget(Lernbereich, "name")
    )

    class Meta:
        model = Lernziel
        fields = ("id", "name", "lernbereich")

class LernzielBeschreibungResource(resources.ModelResource):
    lernziel = fields.Field(
        column_name="lernziel",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "name")
    )

    class Meta:
        model = LernzielBeschreibung
        fields = ("id", "lernziel", "text")

class TeilzielResource(resources.ModelResource):
    lernziel = fields.Field(
        column_name="lernziel",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "name")
    )

    class Meta:
        model = Teilziel
        fields = ("id", "name", "lernziel")

class TeilzielBeschreibungResource(resources.ModelResource):
    teilziel = fields.Field(
        column_name="teilziel",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "name")
    )

    class Meta:
        model = TeilzielBeschreibung
        fields = ("id", "teilziel", "text")

class LerninhaltResource(resources.ModelResource):
    teilziel = fields.Field(
        column_name="teilziel",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "name")
    )

    class Meta:
        model = Lerninhalt
        fields = ("id", "name", "teilziel")

class LerninhaltBeschreibungResource(resources.ModelResource):
    lerninhalt = fields.Field(
        column_name="lerninhalt",
        attribute="lerninhalt",
        widget=ForeignKeyWidget(Lerninhalt, "name")
    )

    class Meta:
        model = LerninhaltBeschreibung
        fields = ("id", "lerninhalt", "text")

# ========== Nested Inlines ==========

class LerninhaltBeschreibungInline(nested_admin.NestedTabularInline):
    model = LerninhaltBeschreibung
    extra = 1

class LerninhaltInline(nested_admin.NestedStackedInline):
    model = Lerninhalt
    extra = 1
    inlines = [LerninhaltBeschreibungInline]

class TeilzielBeschreibungInline(nested_admin.NestedTabularInline):
    model = TeilzielBeschreibung
    extra = 1

class TeilzielInline(nested_admin.NestedStackedInline):
    model = Teilziel
    extra = 1
    inlines = [TeilzielBeschreibungInline, LerninhaltInline]

class LernzielBeschreibungInline(nested_admin.NestedTabularInline):
    model = LernzielBeschreibung
    extra = 1

class LernzielInline(nested_admin.NestedStackedInline):
    model = Lernziel
    extra = 1
    inlines = [LernzielBeschreibungInline, TeilzielInline]

class LernbereichInline(nested_admin.NestedStackedInline):
    model = Lernbereich
    extra = 1
    inlines = [LernzielInline]

# ========== Admin-Klassen mit Import/Export + Nested Inlines ==========

@admin.register(Lehrplan)
class LehrplanAdmin(nested_admin.NestedModelAdmin, ImportExportModelAdmin):
    list_display = ("fach", "klassenstufen", "bundesland")
    resource_class = LehrplanResource
    inlines = [LernbereichInline]

@admin.register(Lernbereich)
class LernbereichAdmin(ImportExportModelAdmin):
    list_display = ("name", "nummer", "unterrichtsstunden", "lehrplan")
    resource_class = LernbereichResource

@admin.register(Lernziel)
class LernzielAdmin(ImportExportModelAdmin):
    list_display = ("name", "lernbereich")
    resource_class = LernzielResource

@admin.register(LernzielBeschreibung)
class LernzielBeschreibungAdmin(ImportExportModelAdmin):
    list_display = ("text", "lernziel")
    resource_class = LernzielBeschreibungResource

@admin.register(Teilziel)
class TeilzielAdmin(ImportExportModelAdmin):
    list_display = ("name", "lernziel")
    resource_class = TeilzielResource

@admin.register(TeilzielBeschreibung)
class TeilzielBeschreibungAdmin(ImportExportModelAdmin):
    list_display = ("text", "teilziel")
    resource_class = TeilzielBeschreibungResource

@admin.register(Lerninhalt)
class LerninhaltAdmin(ImportExportModelAdmin):
    list_display = ("name", "teilziel")
    resource_class = LerninhaltResource

@admin.register(LerninhaltBeschreibung)
class LerninhaltBeschreibungAdmin(ImportExportModelAdmin):
    list_display = ("text", "lerninhalt")
    resource_class = LerninhaltBeschreibungResource
