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
import tablib
from django.urls import reverse
from django.urls import reverse_lazy
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.utils.safestring import mark_safe

# ========== Import-Export Resources ==========

class BaseResource(resources.ModelResource):
    """Basis-Resource-Klasse mit ID-Mapping Funktionalität"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.old_id_to_new_id = {}
        
    def get_instance(self, instance_loader, row):
        """Überschreiben um neue Instanzen zu erzeugen statt bestehende zu aktualisieren"""
        return None
        
    def save_instance(self, instance, *args, **kwargs):
        """Speichert die Instanz und mapped die ID"""
        try:
            # Hole dry_run aus kwargs oder setze es auf False
            dry_run = kwargs.get('dry_run', False)
            
            if not dry_run:
                old_id = instance.id
                # Entferne die ID damit eine neue generiert wird
                instance.id = None
                # Rufe die Elternmethode mit den ursprünglichen Argumenten auf
                super().save_instance(instance, *args, **kwargs)
                # Speichere das Mapping zwischen alter und neuer ID
                if old_id is not None:
                    # Hole die neue ID aus der gespeicherten Instanz
                    new_id = instance.id
                    if new_id is not None:
                        self.old_id_to_new_id[old_id] = new_id
                        print(f"Mapped ID {old_id} zu {new_id}")
                    else:
                        print(f"Warnung: Neue ID für {old_id} ist None!")
            return instance
        except Exception as e:
            print(f"Fehler beim Speichern der Instanz: {str(e)}")
            raise

    def import_data(self, dataset, dry_run=False, *args, **kwargs):
        """Überschreibe import_data um das ID-Mapping zu verwalten"""
        result = super().import_data(dataset, dry_run, *args, **kwargs)
        
        if not dry_run and not result.has_errors():
            print(f"Import erfolgreich. ID Mappings: {self.old_id_to_new_id}")
            # Überprüfe ob alle IDs korrekt gemappt wurden
            for old_id, new_id in self.old_id_to_new_id.items():
                if new_id is None:
                    print(f"Warnung: ID {old_id} wurde nicht korrekt gemappt!")
        
        return result

    def skip_row(self, instance, original, row, import_validation_errors=None, **kwargs):
        """
        Überprüft, ob ein identischer Datensatz bereits existiert.
        Sehr einfache, robuste Implementierung.
        
        Args:
            instance: Die zu importierende Instanz
            original: Die ursprüngliche Instanz (falls vorhanden)
            row: Die zu importierende Zeile
            
        Returns:
            bool: True, wenn identischer Datensatz existiert, sonst False
        """
        try:
            # Erstelle eine Instance des Models mit den Daten aus der Zeile
            if instance is None:
                return False
                
            # Hole die Modelklasse
            model_class = self._meta.model
            
            # Entferne die ID und Primärschlüsselfelder
            filter_args = {}
            for field in model_class._meta.fields:
                if field.name == 'id' or field.primary_key:
                    continue
                
                if hasattr(instance, field.name):
                    value = getattr(instance, field.name)
                    
                    # Ignoriere leere Werte
                    if value is None:
                        continue
                    
                    # Handle Foreign Keys
                    if field.is_relation and field.many_to_one:
                        filter_args[f"{field.name}_id"] = value.id if value else None
                    else:
                        filter_args[field.name] = value
            
            # Wenn keine Filter vorhanden sind, überspringen wir nicht
            if not filter_args:
                return False
            
            # Führe die Datenbankabfrage durch
            print(f"Suche nach existierendem {model_class.__name__} mit: {filter_args}")
            exists = model_class.objects.filter(**filter_args).exists()
            
            if exists:
                print(f"ÜBERSPRINGE existierenden {model_class.__name__}: {filter_args}")
                return True
            
            print(f"Importiere neuen {model_class.__name__}: {filter_args}")
            return False
            
        except Exception as e:
            print(f"Fehler bei der Duplikatsprüfung: {str(e)}")
            return False

class ForeignKeyMappingResource(BaseResource):
    """
    Resource-Klasse mit Funktionalität zum Mappen von Foreign Keys
    während des Imports.
    """
    foreign_key_field = None
    foreign_key_model = None
    
    def before_import(self, dataset, using_transactions=True, dry_run=False, **kwargs):
        """Wird vor dem Import aufgerufen"""
        # Reset das ID-Mapping für jeden neuen Import
        self.old_id_to_new_id = {}
        super().before_import(dataset, using_transactions=using_transactions, dry_run=dry_run, **kwargs)
    
    def before_import_row(self, row, **kwargs):
        """
        Aktualisiere Foreign Key IDs basierend auf dem Mapping.
        
        Args:
            row (dict): Die zu importierende Zeile
            kwargs (dict): Zusätzliche Parameter, insbesondere resource_instance
        """
        if not self.foreign_key_field or not self.foreign_key_model:
            return
            
        fk_column = f"{self.foreign_key_field}_id"
        if fk_column in row:
            try:
                old_id = int(row[fk_column])
                print(f"\nVerarbeite {self._meta.model.__name__}-Zeile:")
                print(f"Originale Zeile: {row}")
                print(f"Suche {self.foreign_key_model.__name__} mit ID: {old_id}")
                
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                previous_resource = kwargs.get('resource_instance')
                if previous_resource:
                    found_in_mapping = False
                    if old_id in previous_resource.old_id_to_new_id:
                        new_id = previous_resource.old_id_to_new_id[old_id]
                        print(f"Mapped {self.foreign_key_field}_id {old_id} zu {new_id}")
                        
                        # Überprüfe ob das Objekt existiert
                        try:
                            obj = self.foreign_key_model.objects.get(id=new_id)
                            print(f"{self.foreign_key_model.__name__} gefunden über Mapping: {obj}")
                            row[fk_column] = str(new_id)
                            found_in_mapping = True
                        except self.foreign_key_model.DoesNotExist:
                            print(f"Warnung: {self.foreign_key_model.__name__} mit gemappter ID {new_id} existiert nicht in der Datenbank.")
                    
                    # Wenn kein Mapping gefunden wurde, versuche direkt in der DB zu suchen
                    if not found_in_mapping:
                        # Versuche die ursprüngliche ID direkt in der Datenbank zu finden
                        try:
                            obj = self.foreign_key_model.objects.get(id=old_id)
                            print(f"{self.foreign_key_model.__name__} direkt mit ID {old_id} gefunden: {obj}")
                            row[fk_column] = str(old_id)
                            # Füge diese ID zum Mapping hinzu für nachfolgende Datensätze
                            previous_resource.old_id_to_new_id[old_id] = old_id
                            found_in_mapping = True
                        except self.foreign_key_model.DoesNotExist:
                            print(f"{self.foreign_key_model.__name__} mit ID {old_id} nicht in der Datenbank gefunden.")
                    
                    if not found_in_mapping:
                        error_msg = (
                            f"Keine Mapping-Information für {self.foreign_key_model.__name__}-ID {old_id} gefunden.\n"
                            f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}"
                        )
                        print(error_msg)
                        raise Exception(error_msg)
                else:
                    raise Exception("Keine Resource-Instance für ID-Mapping verfügbar!")
                
            except ValueError as e:
                raise Exception(f"Ungültige {self.foreign_key_model.__name__}-ID: {str(e)}")

class LehrplanResource(ForeignKeyMappingResource):
    """Resource für den Import/Export von Lehrplandaten"""
    
    def before_import_row(self, row, **kwargs):
        """Validiere und bereinige die Daten vor dem Import"""
        try:
            # Stelle sicher, dass alle erforderlichen Felder vorhanden sind
            required_fields = ['id', 'klassenstufen', 'bundesland', 'fach']
            for field in required_fields:
                if field not in row:
                    raise ValueError(f"Spalte '{field}' fehlt in der CSV-Datei")
                if not row[field]:
                    raise ValueError(f"Feld '{field}' darf nicht leer sein")

            # Validiere ID
            if not str(row['id']).isdigit():
                raise ValueError(f"ID muss eine Zahl sein, bekam: {row['id']}")

            # Prüfe, ob klassenstufen nicht den Wert "klassenstufe" enthält
            if 'klassenstufen' in row and (row['klassenstufen'].lower() == 'klassenstufe' or row['klassenstufen'].lower() == 'klassenstufen'):
                raise ValueError(f"Ungültiger Wert für klassenstufen: '{row['klassenstufen']}'. Dies scheint eine Kopfzeile zu sein, nicht ein Datenwert.")

            # Bereinige Klassenstufen (entferne Leerzeichen)
            if 'klassenstufen' in row:
                row['klassenstufen'] = row['klassenstufen'].replace(' ', '')

            print(f"Validiere Zeile: {row}")
        except Exception as e:
            raise Exception(f"Fehler in Zeile mit ID {row.get('id', 'unbekannt')}: {str(e)}")

    def import_row(self, row, instance_loader, **kwargs):
        """Überschreibe import_row um bessere Fehlerbehandlung zu haben"""
        try:
            print(f"Importiere Zeile: {row}")
            result = super().import_row(row, instance_loader, **kwargs)
            
            # Überprüfe ob der Import erfolgreich war
            if result.import_type == result.IMPORT_TYPE_NEW:
                if hasattr(result, 'object'):
                    instance = result.object
                    print(f"Neue Instanz erstellt: ID={instance.id}, Fach={instance.fach}, Bundesland={instance.bundesland}, Klassenstufen={instance.klassenstufen}")
                else:
                    print("Warnung: Keine Instanz im Ergebnis gefunden")
            elif result.import_type == result.IMPORT_TYPE_UPDATE:
                print(f"Bestehende Instanz aktualisiert")
            elif result.import_type == result.IMPORT_TYPE_DELETE:
                print(f"Instanz gelöscht")
            elif result.import_type == result.IMPORT_TYPE_SKIP:
                print(f"Zeile übersprungen")
            else:
                print(f"Unbekannter Import-Typ: {result.import_type}")
            
            return result
        except Exception as e:
            print(f"Fehler beim Import der Zeile: {str(e)}")
            raise

    class Meta:
        model = Lehrplan
        fields = ("id", "klassenstufen", "bundesland", "fach")
        import_id_fields = ["id"]
        export_order = fields
        skip_unchanged = False
        report_skipped = False
        use_bulk = False  # Wichtig: Bulk-Import deaktivieren um IDs korrekt zu tracken
        batch_size = 1

class LernbereichResource(ForeignKeyMappingResource):
    """Resource für den Import/Export von Lernbereichsdaten"""
    lehrplan = fields.Field(
        column_name="lehrplan_id",
        attribute="lehrplan",
        widget=ForeignKeyWidget(Lehrplan, "id")
    )
    
    foreign_key_field = "lehrplan"
    foreign_key_model = Lehrplan

    class Meta:
        model = Lernbereich
        fields = ("id", "lehrplan", "nummer", "name", "unterrichtsstunden")
        import_id_fields = ["id"]
        export_order = fields

class LernzielResource(ForeignKeyMappingResource):
    """Resource für den Import/Export von Lernzieldaten"""
    lernbereich = fields.Field(
        column_name="lernbereich_id",
        attribute="lernbereich",
        widget=ForeignKeyWidget(Lernbereich, "id")
    )
    
    foreign_key_field = "lernbereich"
    foreign_key_model = Lernbereich

    class Meta:
        model = Lernziel
        fields = ("id", "name", "lernbereich")
        import_id_fields = ["id"]
        export_order = fields

class LernzielBeschreibungResource(ForeignKeyMappingResource):
    """Resource für den Import/Export von Lernzielbeschreibungsdaten"""
    lernziel = fields.Field(
        column_name="lernziel_id",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "id")
    )
    
    foreign_key_field = "lernziel"
    foreign_key_model = Lernziel

    class Meta:
        model = LernzielBeschreibung
        fields = ("id", "lernziel", "text")
        import_id_fields = ["id"]
        export_order = fields

class TeilzielResource(ForeignKeyMappingResource):
    """Resource für den Import/Export von Teilzieldaten"""
    lernziel = fields.Field(
        column_name="lernziel_id",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "id")
    )
    
    foreign_key_field = "lernziel"
    foreign_key_model = Lernziel

    class Meta:
        model = Teilziel
        fields = ("id", "name", "lernziel")
        import_id_fields = ["id"]
        export_order = fields

class TeilzielBeschreibungResource(ForeignKeyMappingResource):
    """Resource für den Import/Export von Teilzielbeschreibungsdaten"""
    teilziel = fields.Field(
        column_name="teilziel_id",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "id")
    )
    
    foreign_key_field = "teilziel"
    foreign_key_model = Teilziel

    class Meta:
        model = TeilzielBeschreibung
        fields = ("id", "teilziel", "text")
        import_id_fields = ["id"]
        export_order = fields

class LerninhaltResource(ForeignKeyMappingResource):
    """Resource für den Import/Export von Lerninhaltsdaten"""
    teilziel = fields.Field(
        column_name="teilziel_id",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "id")
    )
    
    foreign_key_field = "teilziel"
    foreign_key_model = Teilziel

    class Meta:
        model = Lerninhalt
        fields = ("id", "name", "teilziel")
        import_id_fields = ["id"]
        export_order = fields

class LerninhaltBeschreibungResource(ForeignKeyMappingResource):
    """Resource für den Import/Export von Lerninhaltsbeschreibungsdaten"""
    lerninhalt = fields.Field(
        column_name="lerninhalt_id",
        attribute="lerninhalt",
        widget=ForeignKeyWidget(Lerninhalt, "id")
    )
    
    foreign_key_field = "lerninhalt"
    foreign_key_model = Lerninhalt

    class Meta:
        model = LerninhaltBeschreibung
        fields = ("id", "lerninhalt", "text")
        import_id_fields = ["id"]
        export_order = fields

# ========== Inline Admin Classes ==========

class LerninhaltBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline-Admin für Lerninhaltsbeschreibungen"""
    model = LerninhaltBeschreibung
    extra = 0
    max_num = None
    min_num = 0

class LerninhaltInline(nested_admin.NestedStackedInline):
    """Inline-Admin für Lerninhalte mit eingebetteten Beschreibungen"""
    model = Lerninhalt
    extra = 0
    max_num = None
    min_num = 0
    inlines = [LerninhaltBeschreibungInline]
    classes = ['collapse']

class TeilzielBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline-Admin für Teilzielbeschreibungen"""
    model = TeilzielBeschreibung
    extra = 0
    max_num = None
    min_num = 0

class TeilzielInline(nested_admin.NestedStackedInline):
    """Inline-Admin für Teilziele mit eingebetteten Beschreibungen und Lerninhalten"""
    model = Teilziel
    extra = 0
    max_num = None
    min_num = 0
    inlines = [TeilzielBeschreibungInline, LerninhaltInline]
    classes = ['collapse']

class LernzielBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline-Admin für Lernzielbeschreibungen"""
    model = LernzielBeschreibung
    extra = 0
    max_num = None
    min_num = 0

class LernzielInline(nested_admin.NestedStackedInline):
    """Inline-Admin für Lernziele mit eingebetteten Beschreibungen und Teilzielen"""
    model = Lernziel
    extra = 0
    max_num = None
    min_num = 0
    inlines = [LernzielBeschreibungInline, TeilzielInline]
    classes = ['collapse']

class LernbereichInline(nested_admin.NestedStackedInline):
    """Inline-Admin für Lernbereiche mit eingebetteten Lernzielen"""
    model = Lernbereich
    extra = 0
    max_num = None
    min_num = 0
    inlines = [LernzielInline]
    classes = ['collapse']

# ========== Admin Classes with Import/Export + Nested Inlines ==========

@admin.register(Lehrplan)
class LehrplanAdmin(nested_admin.NestedModelAdmin, ImportExportModelAdmin):
    """Admin-Oberfläche für Lehrpläne mit eingebetteten Lernbereichen"""
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
    """Admin-Oberfläche für Lernbereiche"""
    list_display = ("name", "nummer", "unterrichtsstunden", "lehrplan")
    resource_class = LernbereichResource

@admin.register(Lernziel)
class LernzielAdmin(ImportExportModelAdmin):
    """Admin-Oberfläche für Lernziele"""
    list_display = ("name", "lernbereich")
    resource_class = LernzielResource

@admin.register(LernzielBeschreibung)
class LernzielBeschreibungAdmin(ImportExportModelAdmin):
    """Admin-Oberfläche für Lernzielbeschreibungen"""
    list_display = ("text", "lernziel")
    resource_class = LernzielBeschreibungResource

@admin.register(Teilziel)
class TeilzielAdmin(ImportExportModelAdmin):
    """Admin-Oberfläche für Teilziele"""
    list_display = ("name", "lernziel")
    resource_class = TeilzielResource

@admin.register(TeilzielBeschreibung)
class TeilzielBeschreibungAdmin(ImportExportModelAdmin):
    """Admin-Oberfläche für Teilzielbeschreibungen"""
    list_display = ("text", "teilziel")
    resource_class = TeilzielBeschreibungResource

@admin.register(Lerninhalt)
class LerninhaltAdmin(ImportExportModelAdmin):
    """Admin-Oberfläche für Lerninhalte"""
    list_display = ("name", "teilziel")
    resource_class = LerninhaltResource

@admin.register(LerninhaltBeschreibung)
class LerninhaltBeschreibungAdmin(ImportExportModelAdmin):
    """Admin-Oberfläche für Lerninhaltsbeschreibungen"""
    list_display = ("text", "lerninhalt")
    resource_class = LerninhaltBeschreibungResource

# ========== Custom AdminSite ==========

class CurriculumAdminSite(admin.AdminSite):
    """Benutzerdefinierte Admin-Site mit zusätzlicher Export-Funktionalität"""
    site_header = 'Curriculum Administration'
    site_title = 'Curriculum Admin'
    index_template = 'admin/curriculum_admin/index.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('export-all/', self.admin_view(self.export_all), name='export-all'),
            path('import-all/', self.admin_view(self.import_all), name='import-all'),
        ]
        return custom_urls + urls

    def _validate_and_fix_csv(self, csv_content, expected_headers=None):
        """
        Überprüft und korrigiert CSV-Inhalte, um häufige Importprobleme zu vermeiden.
        
        Args:
            csv_content (str): Der Inhalt der CSV-Datei
            expected_headers (list): Die erwarteten Spaltenüberschriften
            
        Returns:
            str: Der korrigierte CSV-Inhalt
        """
        try:
            # Konvertiere in eine Tablib-Dataset für einfachere Verarbeitung
            dataset = tablib.Dataset().load(csv_content, format='csv')
            
            if len(dataset) == 0:
                print("Warnung: CSV-Datei ist leer!")
                return csv_content
                
            # Überprüfe die Kopfzeilen
            headers = dataset.headers
            print(f"Gefundene Kopfzeilen: {headers}")
            
            if expected_headers and not all(header in headers for header in expected_headers):
                missing = [h for h in expected_headers if h not in headers]
                print(f"Warnung: Fehlende erwartete Kopfzeilen: {missing}")
            
            # Überprüfe auf typische Probleme:
            # 1. Prüfen, ob die erste Zeile Daten enthält, die wie Kopfzeilen aussehen
            first_row = dataset[0]
            first_row_contains_headers = False
            
            if 'klassenstufen' in headers:
                idx = headers.index('klassenstufen')
                if idx < len(first_row) and isinstance(first_row[idx], str):
                    value = first_row[idx].lower()
                    if value in ('klassenstufe', 'klassenstufen'):
                        first_row_contains_headers = True
                        print("Warnung: Erste Datenzeile enthält wahrscheinlich Kopfzeilen")
            
            # Wenn die erste Zeile Kopfzeilen zu enthalten scheint, entferne sie
            if first_row_contains_headers:
                new_dataset = tablib.Dataset(headers=headers)
                for i in range(1, len(dataset)):
                    new_dataset.append(dataset[i])
                dataset = new_dataset
                print("Erste Zeile entfernt, da sie Kopfzeilen enthielt")
            
            # Konvertiere zurück zu CSV
            return dataset.export('csv')
        except Exception as e:
            print(f"Fehler bei der CSV-Validierung: {str(e)}")
            # Gib im Fehlerfall den Original-Inhalt zurück
            return csv_content

    def import_all(self, request):
        """Import all curriculum data from uploaded CSV files"""
        if request.method == 'POST':
            if 'zip_file' not in request.FILES:
                messages.error(request, 'Bitte wählen Sie eine ZIP-Datei aus.')
                return HttpResponseRedirect('.')

            zip_file = request.FILES['zip_file']
            
            try:
                with zipfile.ZipFile(zip_file) as z:
                    filenames = sorted(z.namelist())
                    print(f"\nGefundene Dateien im ZIP: {filenames}")
                    
                    expected_files = [
                        '01_lehrplan.csv',
                        '02_lernbereich.csv',
                        '03_lernziel.csv',
                        '04_lernziel_beschreibung.csv',
                        '05_teilziel.csv',
                        '06_teilziel_beschreibung.csv',
                        '07_lerninhalt.csv',
                        '08_lerninhalt_beschreibung.csv'
                    ]
                    
                    missing_files = set(expected_files) - set(filenames)
                    if missing_files:
                        messages.error(
                            request, 
                            f'Folgende Dateien fehlen im ZIP: {", ".join(missing_files)}'
                        )
                        return HttpResponseRedirect('.')

                    # Erwartete Spaltenüberschriften pro Datei
                    expected_headers = {
                        '01_lehrplan.csv': ['id', 'klassenstufen', 'bundesland', 'fach'],
                        '02_lernbereich.csv': ['id', 'lehrplan_id', 'nummer', 'name', 'unterrichtsstunden'],
                        '03_lernziel.csv': ['id', 'name', 'lernbereich_id'],
                        '04_lernziel_beschreibung.csv': ['id', 'lernziel_id', 'text'],
                        '05_teilziel.csv': ['id', 'name', 'lernziel_id'],
                        '06_teilziel_beschreibung.csv': ['id', 'teilziel_id', 'text'],
                        '07_lerninhalt.csv': ['id', 'name', 'teilziel_id'],
                        '08_lerninhalt_beschreibung.csv': ['id', 'lerninhalt_id', 'text'],
                    }

                    # Erstelle Resource-Instanzen
                    resources = {
                        '01_lehrplan.csv': LehrplanResource(),
                        '02_lernbereich.csv': LernbereichResource(),
                        '03_lernziel.csv': LernzielResource(),
                        '04_lernziel_beschreibung.csv': LernzielBeschreibungResource(),
                        '05_teilziel.csv': TeilzielResource(),
                        '06_teilziel_beschreibung.csv': TeilzielBeschreibungResource(),
                        '07_lerninhalt.csv': LerninhaltResource(),
                        '08_lerninhalt_beschreibung.csv': LerninhaltBeschreibungResource()
                    }

                    # Dictionary für ID-Mappings
                    id_mappings = {}
                    import_success = True
                    error_messages = []
                    
                    # Statistiken für den Import
                    import_stats = {}
                    skipped_stats = {}
                    error_counts = {}

                    # Importiere zuerst nur die Lehrpläne
                    try:
                        print(f"\nImportiere Lehrpläne...")
                        csv_content = z.read('01_lehrplan.csv').decode('utf-8-sig')
                        
                        # Validiere und korrigiere die CSV-Datei
                        corrected_csv = self._validate_and_fix_csv(
                            csv_content, 
                            expected_headers=expected_headers['01_lehrplan.csv']
                        )
                        
                        dataset = tablib.Dataset().load(corrected_csv, format='csv')
                        print(f"Lehrplan CSV Inhalt:")
                        print(f"Spalten: {dataset.headers}")
                        print(f"Anzahl Zeilen: {len(dataset)}")
                        
                        # Führe Dry-Run durch
                        print("\nStarte Dry-Run...")
                        result = resources['01_lehrplan.csv'].import_data(
                            dataset, 
                            dry_run=True,
                            raise_errors=False,
                            use_transactions=True
                        )
                        
                        if result.has_errors():
                            errors = []
                            for row in result.row_errors():
                                row_number = row[0] + 1
                                row_errors = row[1]
                                for error in row_errors:
                                    if isinstance(error.error, Exception):
                                        errors.append(f"Zeile {row_number}: {str(error.error)}")
                                    else:
                                        errors.append(f"Zeile {row_number}: {str(error)}")
                            warning_msg = "Warnung beim Validieren der Lehrplan-Daten:\n" + "\n".join(errors)
                            print(warning_msg)
                            error_messages.append(warning_msg)
                            error_counts['01_lehrplan.csv'] = error_counts.get('01_lehrplan.csv', 0) + len(errors)
                        
                        if result.has_validation_errors():
                            validation_errors = []
                            for invalid_row in result.invalid_rows:
                                row_number = invalid_row.number + 1
                                validation_errors.append(f"Zeile {row_number}: {str(invalid_row.error)}")
                            warning_msg = "Validierungswarnung in den Lehrplan-Daten:\n" + "\n".join(validation_errors)
                            print(warning_msg)
                            error_messages.append(warning_msg)
                            error_counts['01_lehrplan.csv'] = error_counts.get('01_lehrplan.csv', 0) + len(validation_errors)
                        
                        print("Import der Lehrpläne wird durchgeführt...")
                        
                        # Importiere die Lehrpläne
                        result = resources['01_lehrplan.csv'].import_data(
                            dataset, 
                            dry_run=False,
                            raise_errors=False,
                            use_transactions=True
                        )
                        
                        # Zähle neue und übersprungene Einträge
                        totals = result.totals
                        if hasattr(result, 'totals'):
                            if totals.get('new', 0) > 0:
                                import_stats['01_lehrplan.csv'] = totals.get('new', 0)
                            if totals.get('skip', 0) > 0:
                                skipped_stats['01_lehrplan.csv'] = totals.get('skip', 0)
                                
                        id_mappings['01_lehrplan.csv'] = resources['01_lehrplan.csv'].old_id_to_new_id
                        print(f"Lehrplan-Mappings: {id_mappings['01_lehrplan.csv']}")
                        
                        # Überprüfe ob Lehrpläne importiert wurden
                        if id_mappings['01_lehrplan.csv']:
                            imported_count = 0
                            for old_id, new_id in id_mappings['01_lehrplan.csv'].items():
                                try:
                                    lehrplan = Lehrplan.objects.get(id=new_id)
                                    print(f"Lehrplan {new_id} (war {old_id}) wurde erfolgreich importiert: {lehrplan.fach} ({lehrplan.bundesland})")
                                    imported_count += 1
                                except Lehrplan.DoesNotExist:
                                    print(f"Warnung: Lehrplan mit ID {new_id} (war {old_id}) wurde nicht gefunden.")
                            
                            # Falls die Totals nicht richtig erfasst wurden, verwenden wir den manuellen Zähler
                            if '01_lehrplan.csv' not in import_stats and imported_count > 0:
                                import_stats['01_lehrplan.csv'] = imported_count
                        else:
                            warning_msg = "Keine Lehrpläne wurden importiert oder alle wurden übersprungen."
                            print(warning_msg)
                            error_messages.append(warning_msg)
                            
                    except Exception as e:
                        error_msg = f"Fehler beim Import der Lehrpläne: {str(e)}"
                        print(error_msg)
                        error_messages.append(error_msg)
                        error_counts['01_lehrplan.csv'] = error_counts.get('01_lehrplan.csv', 0) + 1
                        import_success = False

                    # Importiere die restlichen Dateien
                    for filename in expected_files[1:]:  # Überspringe 01_lehrplan.csv
                        try:
                            print(f"\nVerarbeite Datei: {filename}")
                            csv_content = z.read(filename).decode('utf-8-sig')
                            
                            # Validiere und korrigiere die CSV-Datei
                            corrected_csv = self._validate_and_fix_csv(
                                csv_content, 
                                expected_headers=expected_headers[filename]
                            )
                            
                            dataset = tablib.Dataset().load(corrected_csv, format='csv')
                            print(f"Anzahl Zeilen in {filename}: {len(dataset)}")
                            
                            # Hole die passende Resource
                            resource = resources[filename]
                            
                            # Bestimme die richtige vorherige Resource basierend auf den Abhängigkeiten
                            previous_resource = None
                            
                            if filename == '02_lernbereich.csv':
                                previous_resource = resources['01_lehrplan.csv']
                            elif filename == '03_lernziel.csv':
                                previous_resource = resources['02_lernbereich.csv']
                            elif filename == '04_lernziel_beschreibung.csv':
                                previous_resource = resources['03_lernziel.csv']
                            elif filename == '05_teilziel.csv':
                                previous_resource = resources['03_lernziel.csv']
                            elif filename == '06_teilziel_beschreibung.csv':
                                previous_resource = resources['05_teilziel.csv']
                            elif filename == '07_lerninhalt.csv':
                                previous_resource = resources['05_teilziel.csv']
                            elif filename == '08_lerninhalt_beschreibung.csv':
                                previous_resource = resources['07_lerninhalt.csv']
                            else:
                                previous_resource = resources[expected_files[expected_files.index(filename)-1]]
                                
                            # Zähle Abhängigkeitsfehler
                            dependency_error_count = 0
                                
                            # Führe einen Dry-Run durch
                            dry_run_result = resource.import_data(
                                dataset, 
                                dry_run=True,
                                resource_instance=previous_resource,
                                raise_errors=False
                            )
                            if dry_run_result.has_errors():
                                errors = []
                                for row in dry_run_result.row_errors():
                                    row_number = row[0] + 1
                                    row_errors = row[1]
                                    for error in row_errors:
                                        error_str = str(error.error) if isinstance(error.error, Exception) else str(error)
                                        errors.append(f"Zeile {row_number}: {error_str}")
                                        if "Keine Mapping-Information" in error_str:
                                            dependency_error_count += 1
                                warning_msg = f"Warnung beim Import von {filename}:\n" + "\n".join(errors)
                                print(warning_msg)
                                error_messages.append(warning_msg)
                            
                            # Führe den tatsächlichen Import durch
                            result = resource.import_data(
                                dataset, 
                                dry_run=False,
                                resource_instance=previous_resource,
                                raise_errors=False
                            )
                            
                            # Zähle neue und übersprungene Einträge
                            if hasattr(result, 'totals'):
                                totals = result.totals
                                if totals.get('new', 0) > 0:
                                    import_stats[filename] = totals.get('new', 0)
                                if totals.get('skip', 0) > 0:
                                    skipped_stats[filename] = totals.get('skip', 0)
                            
                            # Zähle Abhängigkeitsfehler
                            if dependency_error_count > 0:
                                error_counts[filename] = dependency_error_count
                            
                            # Speichere das ID-Mapping für die nächste Resource
                            id_mappings[filename] = resource.old_id_to_new_id
                            print(f"Gespeicherte Mappings für {filename}: {id_mappings[filename]}")

                        except Exception as e:
                            error_msg = f"Fehler beim Import von {filename}: {str(e)}"
                            print(error_msg)
                            error_messages.append(error_msg)
                            error_counts[filename] = error_counts.get(filename, 0) + 1
                            continue

                # Erstelle eine übersichtliche Zusammenfassung
                summary = []
                
                # Formatiere die Ausgabe so, dass jede CSV-Datei in einer eigenen Zeile steht
                if skipped_stats or import_stats or error_counts:
                    summary.append("<p><strong>Importergebnisse:</strong></p>")
                    summary.append("<ul>")
                    
                    # Sortiere die Dateien nach der richtigen Reihenfolge
                    for filename in expected_files:
                        file_summary = []
                        
                        # Neue Einträge
                        if filename in import_stats and import_stats[filename] > 0:
                            file_summary.append(f"{import_stats[filename]} neue Einträge")
                        
                        # Übersprungene Einträge (normale)
                        if filename in skipped_stats and skipped_stats[filename] > 0:
                            file_summary.append(f"{skipped_stats[filename]} übersprungene Duplikate")
                        
                        # Übersprungene Einträge wegen fehlender Abhängigkeiten
                        if filename in error_counts and error_counts[filename] > 0:
                            file_summary.append(f"{error_counts[filename]} übersprungene Einträge (fehlende Verknüpfungen)")
                        
                        # Füge die Datei zur Zusammenfassung hinzu, wenn es Statistiken dazu gibt
                        if file_summary:
                            summary.append(f"<li><strong>{filename}:</strong> {', '.join(file_summary)}</li>")
                    
                    summary.append("</ul>")
                
                summary_text = "\n".join(summary)
                
                if import_success:
                    messages.success(
                        request,
                        mark_safe(f'Import abgeschlossen!<br/>{summary_text}')
                    )
                else:
                    messages.warning(
                        request,
                        mark_safe(f'Import teilweise abgeschlossen!<br/>{summary_text}')
                    )

                return HttpResponseRedirect('.')

            except Exception as e:
                messages.error(
                    request,
                    f'Kritischer Fehler beim Import: {str(e)}'
                )
                return HttpResponseRedirect('.')

        context = dict(
            self.each_context(request),
            title='CSV-Dateien importieren',
        )
        return TemplateResponse(request, 'admin/curriculum_admin/import.html', context)

    def export_all(self, request):
        """Export all curriculum data as CSV files in a ZIP archive"""
        # Create a ZIP file in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Definiere die Export-Reihenfolge
            export_configs = [
                ('01_lehrplan.csv', LehrplanResource()),
                ('02_lernbereich.csv', LernbereichResource()),
                ('03_lernziel.csv', LernzielResource()),
                ('04_lernziel_beschreibung.csv', LernzielBeschreibungResource()),
                ('05_teilziel.csv', TeilzielResource()),
                ('06_teilziel_beschreibung.csv', TeilzielBeschreibungResource()),
                ('07_lerninhalt.csv', LerninhaltResource()),
                ('08_lerninhalt_beschreibung.csv', LerninhaltBeschreibungResource())
            ]

            # UTF-8 BOM für Excel-Kompatibilität
            utf8_bom = '\ufeff'.encode('utf-8')

            # Exportiere alle Dateien in der definierten Reihenfolge
            for filename, resource in export_configs:
                dataset = resource.export()
                csv_content = utf8_bom + dataset.csv.encode('utf-8')
                zip_file.writestr(filename, csv_content)

            # Füge eine README.txt hinzu
            readme_content = """Curriculum Daten Export

Die Dateien MÜSSEN in dieser Reihenfolge importiert werden:
1. 01_lehrplan.csv
2. 02_lernbereich.csv
3. 03_lernziel.csv
4. 04_lernziel_beschreibung.csv
5. 05_teilziel.csv
6. 06_teilziel_beschreibung.csv
7. 07_lerninhalt.csv
8. 08_lerninhalt_beschreibung.csv

Wichtige Hinweise:
- Alle Dateien sind UTF-8 mit BOM kodiert
- Die Reihenfolge ist zwingend einzuhalten
- Alle Verknüpfungen erfolgen über IDs
- Nicht die Dateinamen ändern
"""
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
