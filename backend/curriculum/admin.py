import nested_admin
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from import_export import resources, fields, formats
from import_export.widgets import ForeignKeyWidget
from django.http import HttpResponse
import csv
import zipfile
import io
from django.contrib.admin import AdminSite
from django.urls import path
from django.shortcuts import render
from django.template.response import TemplateResponse
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
        export_order = fields

class LernbereichResource(resources.ModelResource):
    """Resource for importing/exporting Learning Area data"""
    lehrplan = fields.Field(
        column_name="lehrplan",
        attribute="lehrplan",
        widget=ForeignKeyWidget(Lehrplan, "fach")
    )
    lehrplan_bundesland = fields.Field(
        column_name="lehrplan_bundesland",
        attribute="lehrplan",
        widget=ForeignKeyWidget(Lehrplan, "bundesland")
    )

    class Meta:
        model = Lernbereich
        fields = ("id", "lehrplan", "lehrplan_bundesland", "nummer", "name", "unterrichtsstunden")
        export_order = fields

class LernzielResource(resources.ModelResource):
    """Resource for importing/exporting Learning Objective data"""
    lernbereich = fields.Field(
        column_name="lernbereich",
        attribute="lernbereich",
        widget=ForeignKeyWidget(Lernbereich, "name")
    )
    lehrplan = fields.Field(
        column_name="lehrplan",
        attribute="lernbereich__lehrplan",
        widget=ForeignKeyWidget(Lehrplan, "fach")
    )

    class Meta:
        model = Lernziel
        fields = ("id", "name", "lernbereich", "lehrplan")
        export_order = fields

class LernzielBeschreibungResource(resources.ModelResource):
    """Resource for importing/exporting Learning Objective Description data"""
    lernziel = fields.Field(
        column_name="lernziel",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "name")
    )
    lernbereich = fields.Field(
        column_name="lernbereich",
        attribute="lernziel__lernbereich",
        widget=ForeignKeyWidget(Lernbereich, "name")
    )

    class Meta:
        model = LernzielBeschreibung
        fields = ("id", "lernziel", "lernbereich", "text")
        export_order = fields

class TeilzielResource(resources.ModelResource):
    """Resource for importing/exporting Sub-Objective data"""
    lernziel = fields.Field(
        column_name="lernziel",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "name")
    )
    lernbereich = fields.Field(
        column_name="lernbereich",
        attribute="lernziel__lernbereich",
        widget=ForeignKeyWidget(Lernbereich, "name")
    )
    lehrplan = fields.Field(
        column_name="lehrplan",
        attribute="lernziel__lernbereich__lehrplan",
        widget=ForeignKeyWidget(Lehrplan, "fach")
    )

    class Meta:
        model = Teilziel
        fields = ("id", "name", "lernziel", "lernbereich", "lehrplan")
        export_order = fields

class TeilzielBeschreibungResource(resources.ModelResource):
    """Resource for importing/exporting Sub-Objective Description data"""
    teilziel = fields.Field(
        column_name="teilziel",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "name")
    )
    lernziel = fields.Field(
        column_name="lernziel",
        attribute="teilziel__lernziel",
        widget=ForeignKeyWidget(Lernziel, "name")
    )

    class Meta:
        model = TeilzielBeschreibung
        fields = ("id", "teilziel", "lernziel", "text")
        export_order = fields

class LerninhaltResource(resources.ModelResource):
    """Resource for importing/exporting Learning Content data"""
    teilziel = fields.Field(
        column_name="teilziel",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "name")
    )
    lernziel = fields.Field(
        column_name="lernziel",
        attribute="teilziel__lernziel",
        widget=ForeignKeyWidget(Lernziel, "name")
    )
    lernbereich = fields.Field(
        column_name="lernbereich",
        attribute="teilziel__lernziel__lernbereich",
        widget=ForeignKeyWidget(Lernbereich, "name")
    )

    class Meta:
        model = Lerninhalt
        fields = ("id", "name", "teilziel", "lernziel", "lernbereich")
        export_order = fields

class LerninhaltBeschreibungResource(resources.ModelResource):
    """Resource for importing/exporting Learning Content Description data"""
    lerninhalt = fields.Field(
        column_name="lerninhalt",
        attribute="lerninhalt",
        widget=ForeignKeyWidget(Lerninhalt, "name")
    )
    teilziel = fields.Field(
        column_name="teilziel",
        attribute="lerninhalt__teilziel",
        widget=ForeignKeyWidget(Teilziel, "name")
    )
    lernziel = fields.Field(
        column_name="lernziel",
        attribute="lerninhalt__teilziel__lernziel",
        widget=ForeignKeyWidget(Lernziel, "name")
    )

    class Meta:
        model = LerninhaltBeschreibung
        fields = ("id", "lerninhalt", "teilziel", "lernziel", "text")
        export_order = fields

# ========== Nested Inlines ==========

class LerninhaltBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline admin for Learning Content Descriptions"""
    model = LerninhaltBeschreibung
    extra = 0
    max_num = 10
    min_num = 0

class LerninhaltInline(nested_admin.NestedStackedInline):
    """Inline admin for Learning Content with nested descriptions"""
    model = Lerninhalt
    extra = 0
    max_num = 10
    min_num = 0
    inlines = [LerninhaltBeschreibungInline]
    classes = ['collapse']

class TeilzielBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline admin for Sub-Objective Descriptions"""
    model = TeilzielBeschreibung
    extra = 0
    max_num = 10
    min_num = 0

class TeilzielInline(nested_admin.NestedStackedInline):
    """Inline admin for Sub-Objectives with nested descriptions and content"""
    model = Teilziel
    extra = 0
    max_num = 10
    min_num = 0
    inlines = [TeilzielBeschreibungInline, LerninhaltInline]
    classes = ['collapse']

class LernzielBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline admin for Learning Objective Descriptions"""
    model = LernzielBeschreibung
    extra = 0
    max_num = 10
    min_num = 0

class LernzielInline(nested_admin.NestedStackedInline):
    """Inline admin for Learning Objectives with nested descriptions and sub-objectives"""
    model = Lernziel
    extra = 0
    max_num = 10
    min_num = 0
    inlines = [LernzielBeschreibungInline, TeilzielInline]
    classes = ['collapse']

class LernbereichInline(nested_admin.NestedStackedInline):
    """Inline admin for Learning Areas with nested learning objectives"""
    model = Lernbereich
    extra = 0
    max_num = 10
    min_num = 0
    inlines = [LernzielInline]
    classes = ['collapse']

# ========== Admin Classes with Import/Export + Nested Inlines ==========

@admin.register(Lehrplan)
class LehrplanAdmin(nested_admin.NestedModelAdmin, ImportExportModelAdmin):
    """Admin interface for Curriculum with nested learning areas"""
    list_display = ("fach", "klassenstufen", "bundesland")
    resource_class = LehrplanResource
    search_fields = ["fach", "bundesland"]
    list_filter = ["bundesland", "fach"]
    inlines = [LernbereichInline]
    save_on_top = True
    
    class Media:
        css = {
            'all': ('admin/css/forms.css',)
        }
        js = ('admin/js/collapse.js',)

    def get_form(self, request, obj=None, **kwargs):
        """Optimiert das Formular für bessere Performance"""
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['klassenstufen'].widget.attrs['style'] = 'width: 300px;'
        return form

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

# ========== Custom AdminSite ==========

class CurriculumAdminSite(admin.AdminSite):
    """Custom admin site with additional export functionality"""
    site_header = 'Curriculum Administration'
    site_title = 'Curriculum Admin'
    index_template = 'admin/curriculum_admin/index.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('export-all/', self.admin_view(self.export_all), name='export-all'),
        ]
        return custom_urls + urls

    def export_all(self, request):
        """Export all curriculum data as CSV files in a ZIP archive"""
        # Create a ZIP file in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # UTF-8 BOM für Excel-Kompatibilität
            utf8_bom = '\ufeff'.encode('utf-8')

            # Export Lehrplan
            lehrplan_resource = LehrplanResource()
            lehrplan_data = lehrplan_resource.export()
            csv_content = utf8_bom + lehrplan_data.csv.encode('utf-8')
            zip_file.writestr('1_lehrplan.csv', csv_content)

            # Export Lernbereich
            lernbereich_resource = LernbereichResource()
            lernbereich_data = lernbereich_resource.export()
            csv_content = utf8_bom + lernbereich_data.csv.encode('utf-8')
            zip_file.writestr('2_lernbereich.csv', csv_content)

            # Export Lernziel
            lernziel_resource = LernzielResource()
            lernziel_data = lernziel_resource.export()
            csv_content = utf8_bom + lernziel_data.csv.encode('utf-8')
            zip_file.writestr('3_lernziel.csv', csv_content)

            # Export LernzielBeschreibung
            lernziel_beschreibung_resource = LernzielBeschreibungResource()
            lernziel_beschreibung_data = lernziel_beschreibung_resource.export()
            csv_content = utf8_bom + lernziel_beschreibung_data.csv.encode('utf-8')
            zip_file.writestr('4_lernziel_beschreibung.csv', csv_content)

            # Export Teilziel
            teilziel_resource = TeilzielResource()
            teilziel_data = teilziel_resource.export()
            csv_content = utf8_bom + teilziel_data.csv.encode('utf-8')
            zip_file.writestr('5_teilziel.csv', csv_content)

            # Export TeilzielBeschreibung
            teilziel_beschreibung_resource = TeilzielBeschreibungResource()
            teilziel_beschreibung_data = teilziel_beschreibung_resource.export()
            csv_content = utf8_bom + teilziel_beschreibung_data.csv.encode('utf-8')
            zip_file.writestr('6_teilziel_beschreibung.csv', csv_content)

            # Export Lerninhalt
            lerninhalt_resource = LerninhaltResource()
            lerninhalt_data = lerninhalt_resource.export()
            csv_content = utf8_bom + lerninhalt_data.csv.encode('utf-8')
            zip_file.writestr('7_lerninhalt.csv', csv_content)

            # Export LerninhaltBeschreibung
            lerninhalt_beschreibung_resource = LerninhaltBeschreibungResource()
            lerninhalt_beschreibung_data = lerninhalt_beschreibung_resource.export()
            csv_content = utf8_bom + lerninhalt_beschreibung_data.csv.encode('utf-8')
            zip_file.writestr('8_lerninhalt_beschreibung.csv', csv_content)

            # Füge eine README.txt hinzu
            readme_content = """CSV-Export der Curriculum-Daten
            
Alle Dateien sind UTF-8 mit BOM kodiert.
Import-Reihenfolge:
1. lehrplan.csv
2. lernbereich.csv
3. lernziel.csv
4. lernziel_beschreibung.csv
5. teilziel.csv
6. teilziel_beschreibung.csv
7. lerninhalt.csv
8. lerninhalt_beschreibung.csv

Bitte stellen Sie sicher, dass Sie beim Import die UTF-8-Kodierung verwenden."""

            zip_file.writestr('README.txt', readme_content.encode('utf-8'))

        # Prepare the response
        zip_buffer.seek(0)
        response = HttpResponse(zip_buffer.read(), content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="curriculum_export.zip"'
        
        return response

    def index(self, request, extra_context=None):
        """Override index to add export button"""
        extra_context = extra_context or {}
        extra_context['show_export_button'] = True
        return super().index(request, extra_context)

# Create custom admin site instance
curriculum_admin = CurriculumAdminSite(name='curriculum_admin')

# Register all models with the custom admin site
curriculum_admin.register(Lehrplan, LehrplanAdmin)
curriculum_admin.register(Lernbereich, LernbereichAdmin)
curriculum_admin.register(Lernziel, LernzielAdmin)
curriculum_admin.register(LernzielBeschreibung, LernzielBeschreibungAdmin)
curriculum_admin.register(Teilziel, TeilzielAdmin)
curriculum_admin.register(TeilzielBeschreibung, TeilzielBeschreibungAdmin)
curriculum_admin.register(Lerninhalt, LerninhaltAdmin)
curriculum_admin.register(LerninhaltBeschreibung, LerninhaltBeschreibungAdmin)
