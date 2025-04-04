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
    """Resource for importing/exporting Curriculum data"""
    class Meta:
        model = Lehrplan
        fields = ("id", "klassenstufen", "bundesland", "fach")

class LernbereichResource(resources.ModelResource):
    """Resource for importing/exporting Learning Area data"""
    lehrplan = fields.Field(
        column_name="lehrplan",
        attribute="lehrplan",
        widget=ForeignKeyWidget(Lehrplan, "fach")
    )

    class Meta:
        model = Lernbereich
        fields = ("id", "lehrplan", "nummer", "name", "unterrichtsstunden")

class LernzielResource(resources.ModelResource):
    """Resource for importing/exporting Learning Objective data"""
    lernbereich = fields.Field(
        column_name="lernbereich",
        attribute="lernbereich",
        widget=ForeignKeyWidget(Lernbereich, "name")
    )

    class Meta:
        model = Lernziel
        fields = ("id", "name", "lernbereich")

class LernzielBeschreibungResource(resources.ModelResource):
    """Resource for importing/exporting Learning Objective Description data"""
    lernziel = fields.Field(
        column_name="lernziel",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "name")
    )

    class Meta:
        model = LernzielBeschreibung
        fields = ("id", "lernziel", "text")

class TeilzielResource(resources.ModelResource):
    """Resource for importing/exporting Sub-Objective data"""
    lernziel = fields.Field(
        column_name="lernziel",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "name")
    )

    class Meta:
        model = Teilziel
        fields = ("id", "name", "lernziel")

class TeilzielBeschreibungResource(resources.ModelResource):
    """Resource for importing/exporting Sub-Objective Description data"""
    teilziel = fields.Field(
        column_name="teilziel",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "name")
    )

    class Meta:
        model = TeilzielBeschreibung
        fields = ("id", "teilziel", "text")

class LerninhaltResource(resources.ModelResource):
    """Resource for importing/exporting Learning Content data"""
    teilziel = fields.Field(
        column_name="teilziel",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "name")
    )

    class Meta:
        model = Lerninhalt
        fields = ("id", "name", "teilziel")

class LerninhaltBeschreibungResource(resources.ModelResource):
    """Resource for importing/exporting Learning Content Description data"""
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
    """Inline admin for Learning Content Descriptions"""
    model = LerninhaltBeschreibung
    extra = 1

class LerninhaltInline(nested_admin.NestedStackedInline):
    """Inline admin for Learning Content with nested descriptions"""
    model = Lerninhalt
    extra = 1
    inlines = [LerninhaltBeschreibungInline]

class TeilzielBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline admin for Sub-Objective Descriptions"""
    model = TeilzielBeschreibung
    extra = 1

class TeilzielInline(nested_admin.NestedStackedInline):
    """Inline admin for Sub-Objectives with nested descriptions and content"""
    model = Teilziel
    extra = 1
    inlines = [TeilzielBeschreibungInline, LerninhaltInline]

class LernzielBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline admin for Learning Objective Descriptions"""
    model = LernzielBeschreibung
    extra = 1

class LernzielInline(nested_admin.NestedStackedInline):
    """Inline admin for Learning Objectives with nested descriptions and sub-objectives"""
    model = Lernziel
    extra = 1
    inlines = [LernzielBeschreibungInline, TeilzielInline]

class LernbereichInline(nested_admin.NestedStackedInline):
    """Inline admin for Learning Areas with nested learning objectives"""
    model = Lernbereich
    extra = 1
    inlines = [LernzielInline]

# ========== Admin Classes with Import/Export + Nested Inlines ==========

@admin.register(Lehrplan)
class LehrplanAdmin(nested_admin.NestedModelAdmin, ImportExportModelAdmin):
    """Admin interface for Curriculum with nested learning areas"""
    list_display = ("fach", "klassenstufen", "bundesland")
    resource_class = LehrplanResource
    inlines = [LernbereichInline]

@admin.register(Lernbereich)
class LernbereichAdmin(ImportExportModelAdmin):
    """Admin interface for Learning Areas"""
    list_display = ("name", "nummer", "unterrichtsstunden", "lehrplan")
    resource_class = LernbereichResource

@admin.register(Lernziel)
class LernzielAdmin(ImportExportModelAdmin):
    """Admin interface for Learning Objectives"""
    list_display = ("name", "lernbereich")
    resource_class = LernzielResource

@admin.register(LernzielBeschreibung)
class LernzielBeschreibungAdmin(ImportExportModelAdmin):
    """Admin interface for Learning Objective Descriptions"""
    list_display = ("text", "lernziel")
    resource_class = LernzielBeschreibungResource

@admin.register(Teilziel)
class TeilzielAdmin(ImportExportModelAdmin):
    """Admin interface for Sub-Objectives"""
    list_display = ("name", "lernziel")
    resource_class = TeilzielResource

@admin.register(TeilzielBeschreibung)
class TeilzielBeschreibungAdmin(ImportExportModelAdmin):
    """Admin interface for Sub-Objective Descriptions"""
    list_display = ("text", "teilziel")
    resource_class = TeilzielBeschreibungResource

@admin.register(Lerninhalt)
class LerninhaltAdmin(ImportExportModelAdmin):
    """Admin interface for Learning Content"""
    list_display = ("name", "teilziel")
    resource_class = LerninhaltResource

@admin.register(LerninhaltBeschreibung)
class LerninhaltBeschreibungAdmin(ImportExportModelAdmin):
    """Admin interface for Learning Content Descriptions"""
    list_display = ("text", "lerninhalt")
    resource_class = LerninhaltBeschreibungResource
