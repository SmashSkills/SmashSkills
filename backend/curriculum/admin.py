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

# ========== Import-Export Resources ==========

class BaseResource(resources.ModelResource):
    """Basis-Resource-Klasse mit ID-Mapping Funktionalität"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Initialisiere das ID-Mapping als Instanzvariable
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

class LehrplanResource(BaseResource):
    """Resource for importing/exporting Curriculum data"""
    
    def before_import(self, dataset, using_transactions=True, dry_run=False, **kwargs):
        """Wird vor dem Import aufgerufen"""
        # Reset das ID-Mapping für jeden neuen Import
        self.old_id_to_new_id = {}
        super().before_import(dataset, using_transactions=using_transactions, dry_run=dry_run, **kwargs)
    
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
                    print(f"Neue Instanz erstellt: ID={instance.id}, Fach={instance.fach}, Bundesland={instance.bundesland}")
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

    def get_instance(self, instance_loader, row):
        """Überschreiben um neue Instanzen zu erzeugen statt bestehende zu aktualisieren"""
        return None

    class Meta:
        model = Lehrplan
        fields = ("id", "klassenstufen", "bundesland", "fach")
        import_id_fields = ["id"]
        export_order = fields
        skip_unchanged = False
        report_skipped = False
        use_bulk = False  # Wichtig: Bulk-Import deaktivieren um IDs korrekt zu tracken
        batch_size = 1

class LernbereichResource(BaseResource):
    """Resource for importing/exporting Learning Area data"""
    lehrplan = fields.Field(
        column_name="lehrplan_id",
        attribute="lehrplan",
        widget=ForeignKeyWidget(Lehrplan, "id")
    )

    def before_import_row(self, row, **kwargs):
        """Aktualisiere Foreign Key IDs basierend auf dem Mapping"""
        if "lehrplan_id" in row:
            try:
                old_id = int(row["lehrplan_id"])
                print(f"\nVerarbeite Lernbereich-Zeile:")
                print(f"Originale Zeile: {row}")
                print(f"Suche Lehrplan mit ID: {old_id}")
                
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                previous_resource = kwargs.get('resource_instance')
                if previous_resource:
                    print(f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}")
                    if old_id in previous_resource.old_id_to_new_id:
                        new_id = previous_resource.old_id_to_new_id[old_id]
                        print(f"Mapped lehrplan_id {old_id} zu {new_id}")
                        
                        # Überprüfe ob der Lehrplan existiert
                        try:
                            lehrplan = Lehrplan.objects.get(id=new_id)
                            print(f"Lehrplan gefunden: {lehrplan.fach} ({lehrplan.bundesland})")
                            row["lehrplan_id"] = str(new_id)
                        except Lehrplan.DoesNotExist:
                            raise Exception(f"Lehrplan mit ID {new_id} existiert nicht in der Datenbank!")
                    else:
                        raise Exception(
                            f"Keine Mapping-Information für Lehrplan-ID {old_id} gefunden.\n"
                            f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}"
                        )
                else:
                    raise Exception("Keine Resource-Instance für ID-Mapping verfügbar!")
                
            except ValueError as e:
                raise Exception(f"Ungültige Lehrplan-ID: {str(e)}")
            except Exception as e:
                raise Exception(f"Fehler beim Verarbeiten der Lehrplan-ID: {str(e)}")

    def get_instance(self, instance_loader, row):
        """Überschreiben um neue Instanzen zu erzeugen statt bestehende zu aktualisieren"""
        return None

    def skip_row(self, instance, original, row, import_validation_errors=None, **kwargs):
        """Überspringe Zeilen nicht"""
        return False

    class Meta:
        model = Lernbereich
        fields = ("id", "lehrplan", "nummer", "name", "unterrichtsstunden")
        import_id_fields = ["id"]
        export_order = fields

class LernzielResource(BaseResource):
    """Resource for importing/exporting Learning Objective data"""
    lernbereich = fields.Field(
        column_name="lernbereich_id",
        attribute="lernbereich",
        widget=ForeignKeyWidget(Lernbereich, "id")
    )

    def before_import_row(self, row, **kwargs):
        """Aktualisiere Foreign Key IDs basierend auf dem Mapping"""
        if "lernbereich_id" in row:
            try:
                old_id = int(row["lernbereich_id"])
                print(f"\nVerarbeite Lernziel-Zeile:")
                print(f"Originale Zeile: {row}")
                print(f"Suche Lernbereich mit ID: {old_id}")
                
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                previous_resource = kwargs.get('resource_instance')
                if previous_resource:
                    print(f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}")
                    if old_id in previous_resource.old_id_to_new_id:
                        new_id = previous_resource.old_id_to_new_id[old_id]
                        print(f"Mapped lernbereich_id {old_id} zu {new_id}")
                        
                        # Überprüfe ob der Lernbereich existiert
                        try:
                            lernbereich = Lernbereich.objects.get(id=new_id)
                            print(f"Lernbereich gefunden: {lernbereich.name}")
                            row["lernbereich_id"] = str(new_id)
                        except Lernbereich.DoesNotExist:
                            raise Exception(f"Lernbereich mit ID {new_id} existiert nicht in der Datenbank!")
                    else:
                        raise Exception(
                            f"Keine Mapping-Information für Lernbereich-ID {old_id} gefunden.\n"
                            f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}"
                        )
                else:
                    raise Exception("Keine Resource-Instance für ID-Mapping verfügbar!")
                
            except ValueError as e:
                raise Exception(f"Ungültige Lernbereich-ID: {str(e)}")
            except Exception as e:
                raise Exception(f"Fehler beim Verarbeiten der Lernbereich-ID: {str(e)}")
        
        # Altes Verhalten beibehalten für lernziel_id, falls vorhanden
        if "lernziel_id" in row:
            try:
                old_id = int(row["lernziel_id"])
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                lernziel_resource = kwargs.get('resource_instance')
                if lernziel_resource and old_id in lernziel_resource.old_id_to_new_id:
                    row["lernziel_id"] = lernziel_resource.old_id_to_new_id[old_id]
            except (ValueError, KeyError):
                pass

    def skip_row(self, instance, original, row, import_validation_errors=None, **kwargs):
        """Überspringe Zeilen nicht"""
        return False

    def get_instance(self, instance_loader, row):
        """Überschreiben um neue Instanzen zu erzeugen statt bestehende zu aktualisieren"""
        return None

    class Meta:
        model = Lernziel
        fields = ("id", "name", "lernbereich")
        import_id_fields = ["id"]
        export_order = fields

class LernzielBeschreibungResource(BaseResource):
    """Resource for importing/exporting Learning Objective Description data"""
    lernziel = fields.Field(
        column_name="lernziel_id",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "id")
    )

    def before_import_row(self, row, **kwargs):
        """Aktualisiere Foreign Key IDs basierend auf dem Mapping"""
        if "lernziel_id" in row:
            try:
                old_id = int(row["lernziel_id"])
                print(f"\nVerarbeite LernzielBeschreibung-Zeile:")
                print(f"Originale Zeile: {row}")
                print(f"Suche Lernziel mit ID: {old_id}")
                
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                previous_resource = kwargs.get('resource_instance')
                if previous_resource:
                    print(f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}")
                    if old_id in previous_resource.old_id_to_new_id:
                        new_id = previous_resource.old_id_to_new_id[old_id]
                        print(f"Mapped lernziel_id {old_id} zu {new_id}")
                        
                        # Überprüfe ob das Lernziel existiert
                        try:
                            lernziel = Lernziel.objects.get(id=new_id)
                            print(f"Lernziel gefunden: {lernziel.name}")
                            row["lernziel_id"] = str(new_id)
                        except Lernziel.DoesNotExist:
                            raise Exception(f"Lernziel mit ID {new_id} existiert nicht in der Datenbank!")
                    else:
                        raise Exception(
                            f"Keine Mapping-Information für Lernziel-ID {old_id} gefunden.\n"
                            f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}"
                        )
                else:
                    raise Exception("Keine Resource-Instance für ID-Mapping verfügbar!")
                
            except ValueError as e:
                raise Exception(f"Ungültige Lernziel-ID: {str(e)}")
            except Exception as e:
                raise Exception(f"Fehler beim Verarbeiten der Lernziel-ID: {str(e)}")

    def skip_row(self, instance, original, row, import_validation_errors=None, **kwargs):
        """Überspringe Zeilen nicht"""
        return False
        
    def get_instance(self, instance_loader, row):
        """Überschreiben um neue Instanzen zu erzeugen statt bestehende zu aktualisieren"""
        return None

    class Meta:
        model = LernzielBeschreibung
        fields = ("id", "lernziel", "text")
        import_id_fields = ["id"]
        export_order = fields

class TeilzielResource(BaseResource):
    """Resource for importing/exporting Sub-Objective data"""
    lernziel = fields.Field(
        column_name="lernziel_id",
        attribute="lernziel",
        widget=ForeignKeyWidget(Lernziel, "id")
    )

    def before_import_row(self, row, **kwargs):
        """Aktualisiere Foreign Key IDs basierend auf dem Mapping"""
        if "lernziel_id" in row:
            try:
                old_id = int(row["lernziel_id"])
                print(f"\nVerarbeite Teilziel-Zeile:")
                print(f"Originale Zeile: {row}")
                print(f"Suche Lernziel mit ID: {old_id}")
                
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                previous_resource = kwargs.get('resource_instance')
                if previous_resource:
                    print(f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}")
                    if old_id in previous_resource.old_id_to_new_id:
                        new_id = previous_resource.old_id_to_new_id[old_id]
                        print(f"Mapped lernziel_id {old_id} zu {new_id}")
                        
                        # Überprüfe ob das Lernziel existiert
                        try:
                            lernziel = Lernziel.objects.get(id=new_id)
                            print(f"Lernziel gefunden: {lernziel.name}")
                            row["lernziel_id"] = str(new_id)
                        except Lernziel.DoesNotExist:
                            raise Exception(f"Lernziel mit ID {new_id} existiert nicht in der Datenbank!")
                    else:
                        raise Exception(
                            f"Keine Mapping-Information für Lernziel-ID {old_id} gefunden.\n"
                            f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}"
                        )
                else:
                    raise Exception("Keine Resource-Instance für ID-Mapping verfügbar!")
                
            except ValueError as e:
                raise Exception(f"Ungültige Lernziel-ID: {str(e)}")
            except Exception as e:
                raise Exception(f"Fehler beim Verarbeiten der Lernziel-ID: {str(e)}")
        
        # Altes Verhalten beibehalten für teilziel_id, falls vorhanden
        if "teilziel_id" in row:
            try:
                old_id = int(row["teilziel_id"])
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                teilziel_resource = kwargs.get('resource_instance')
                if teilziel_resource and old_id in teilziel_resource.old_id_to_new_id:
                    row["teilziel_id"] = teilziel_resource.old_id_to_new_id[old_id]
            except (ValueError, KeyError):
                pass

    def skip_row(self, instance, original, row, import_validation_errors=None, **kwargs):
        """Überspringe Zeilen nicht"""
        return False
        
    def get_instance(self, instance_loader, row):
        """Überschreiben um neue Instanzen zu erzeugen statt bestehende zu aktualisieren"""
        return None

    class Meta:
        model = Teilziel
        fields = ("id", "name", "lernziel")
        import_id_fields = ["id"]
        export_order = fields

class LerninhaltResource(BaseResource):
    """Resource for importing/exporting Learning Content data"""
    teilziel = fields.Field(
        column_name="teilziel_id",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "id")
    )

    def before_import_row(self, row, **kwargs):
        """Aktualisiere Foreign Key IDs basierend auf dem Mapping"""
        if "teilziel_id" in row:
            try:
                old_id = int(row["teilziel_id"])
                print(f"\nVerarbeite Lerninhalt-Zeile:")
                print(f"Originale Zeile: {row}")
                print(f"Suche Teilziel mit ID: {old_id}")
                
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                previous_resource = kwargs.get('resource_instance')
                if previous_resource:
                    print(f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}")
                    if old_id in previous_resource.old_id_to_new_id:
                        new_id = previous_resource.old_id_to_new_id[old_id]
                        print(f"Mapped teilziel_id {old_id} zu {new_id}")
                        
                        # Überprüfe ob das Teilziel existiert
                        try:
                            teilziel = Teilziel.objects.get(id=new_id)
                            print(f"Teilziel gefunden: {teilziel.name}")
                            row["teilziel_id"] = str(new_id)
                        except Teilziel.DoesNotExist:
                            raise Exception(f"Teilziel mit ID {new_id} existiert nicht in der Datenbank!")
                    else:
                        raise Exception(
                            f"Keine Mapping-Information für Teilziel-ID {old_id} gefunden.\n"
                            f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}"
                        )
                else:
                    raise Exception("Keine Resource-Instance für ID-Mapping verfügbar!")
                
            except ValueError as e:
                raise Exception(f"Ungültige Teilziel-ID: {str(e)}")
            except Exception as e:
                raise Exception(f"Fehler beim Verarbeiten der Teilziel-ID: {str(e)}")
        
        # Altes Verhalten beibehalten für lerninhalt_id, falls vorhanden
        if "lerninhalt_id" in row:
            try:
                old_id = int(row["lerninhalt_id"])
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                lerninhalt_resource = kwargs.get('resource_instance')
                if lerninhalt_resource and old_id in lerninhalt_resource.old_id_to_new_id:
                    row["lerninhalt_id"] = lerninhalt_resource.old_id_to_new_id[old_id]
            except (ValueError, KeyError):
                pass

    def skip_row(self, instance, original, row, import_validation_errors=None, **kwargs):
        """Überspringe Zeilen nicht"""
        return False
        
    def get_instance(self, instance_loader, row):
        """Überschreiben um neue Instanzen zu erzeugen statt bestehende zu aktualisieren"""
        return None

    class Meta:
        model = Lerninhalt
        fields = ("id", "name", "teilziel")
        import_id_fields = ["id"]
        export_order = fields

class TeilzielBeschreibungResource(BaseResource):
    """Resource for importing/exporting Sub-Objective Description data"""
    teilziel = fields.Field(
        column_name="teilziel_id",
        attribute="teilziel",
        widget=ForeignKeyWidget(Teilziel, "id")
    )

    def before_import_row(self, row, **kwargs):
        """Aktualisiere Foreign Key IDs basierend auf dem Mapping"""
        if "teilziel_id" in row:
            try:
                old_id = int(row["teilziel_id"])
                print(f"\nVerarbeite TeilzielBeschreibung-Zeile:")
                print(f"Originale Zeile: {row}")
                print(f"Suche Teilziel mit ID: {old_id}")
                
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                previous_resource = kwargs.get('resource_instance')
                if previous_resource:
                    print(f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}")
                    if old_id in previous_resource.old_id_to_new_id:
                        new_id = previous_resource.old_id_to_new_id[old_id]
                        print(f"Mapped teilziel_id {old_id} zu {new_id}")
                        
                        # Überprüfe ob das Teilziel existiert
                        try:
                            teilziel = Teilziel.objects.get(id=new_id)
                            print(f"Teilziel gefunden: {teilziel.name}")
                            row["teilziel_id"] = str(new_id)
                        except Teilziel.DoesNotExist:
                            raise Exception(f"Teilziel mit ID {new_id} existiert nicht in der Datenbank!")
                    else:
                        raise Exception(
                            f"Keine Mapping-Information für Teilziel-ID {old_id} gefunden.\n"
                            f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}"
                        )
                else:
                    raise Exception("Keine Resource-Instance für ID-Mapping verfügbar!")
                
            except ValueError as e:
                raise Exception(f"Ungültige Teilziel-ID: {str(e)}")
            except Exception as e:
                raise Exception(f"Fehler beim Verarbeiten der Teilziel-ID: {str(e)}")

    def skip_row(self, instance, original, row, import_validation_errors=None, **kwargs):
        """Überspringe Zeilen nicht"""
        return False
        
    def get_instance(self, instance_loader, row):
        """Überschreiben um neue Instanzen zu erzeugen statt bestehende zu aktualisieren"""
        return None

    class Meta:
        model = TeilzielBeschreibung
        fields = ("id", "teilziel", "text")
        import_id_fields = ["id"]
        export_order = fields

class LerninhaltBeschreibungResource(BaseResource):
    """Resource for importing/exporting Learning Content Description data"""
    lerninhalt = fields.Field(
        column_name="lerninhalt_id",
        attribute="lerninhalt",
        widget=ForeignKeyWidget(Lerninhalt, "id")
    )

    def before_import_row(self, row, **kwargs):
        """Aktualisiere Foreign Key IDs basierend auf dem Mapping"""
        if "lerninhalt_id" in row:
            try:
                old_id = int(row["lerninhalt_id"])
                print(f"\nVerarbeite LerninhaltBeschreibung-Zeile:")
                print(f"Originale Zeile: {row}")
                print(f"Suche Lerninhalt mit ID: {old_id}")
                
                # Hole das ID-Mapping aus der korrekten Resource-Instanz
                previous_resource = kwargs.get('resource_instance')
                if previous_resource:
                    print(f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}")
                    if old_id in previous_resource.old_id_to_new_id:
                        new_id = previous_resource.old_id_to_new_id[old_id]
                        print(f"Mapped lerninhalt_id {old_id} zu {new_id}")
                        
                        # Überprüfe ob der Lerninhalt existiert
                        try:
                            lerninhalt = Lerninhalt.objects.get(id=new_id)
                            print(f"Lerninhalt gefunden: {lerninhalt.name}")
                            row["lerninhalt_id"] = str(new_id)
                        except Lerninhalt.DoesNotExist:
                            raise Exception(f"Lerninhalt mit ID {new_id} existiert nicht in der Datenbank!")
                    else:
                        raise Exception(
                            f"Keine Mapping-Information für Lerninhalt-ID {old_id} gefunden.\n"
                            f"Verfügbare Mappings: {previous_resource.old_id_to_new_id}"
                        )
                else:
                    raise Exception("Keine Resource-Instance für ID-Mapping verfügbar!")
                
            except ValueError as e:
                raise Exception(f"Ungültige Lerninhalt-ID: {str(e)}")
            except Exception as e:
                raise Exception(f"Fehler beim Verarbeiten der Lerninhalt-ID: {str(e)}")

    def skip_row(self, instance, original, row, import_validation_errors=None, **kwargs):
        """Überspringe Zeilen nicht"""
        return False
        
    def get_instance(self, instance_loader, row):
        """Überschreiben um neue Instanzen zu erzeugen statt bestehende zu aktualisieren"""
        return None

    class Meta:
        model = LerninhaltBeschreibung
        fields = ("id", "lerninhalt", "text")
        import_id_fields = ["id"]
        export_order = fields

# ========== Nested Inlines ==========

class LerninhaltBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline admin for Learning Content Descriptions"""
    model = LerninhaltBeschreibung
    extra = 0
    max_num = None
    min_num = 0

class LerninhaltInline(nested_admin.NestedStackedInline):
    """Inline admin for Learning Content with nested descriptions"""
    model = Lerninhalt
    extra = 0
    max_num = None
    min_num = 0
    inlines = [LerninhaltBeschreibungInline]
    classes = ['collapse']

class TeilzielBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline admin for Sub-Objective Descriptions"""
    model = TeilzielBeschreibung
    extra = 0
    max_num = None
    min_num = 0

class TeilzielInline(nested_admin.NestedStackedInline):
    """Inline admin for Sub-Objectives with nested descriptions and content"""
    model = Teilziel
    extra = 0
    max_num = None
    min_num = 0
    inlines = [TeilzielBeschreibungInline, LerninhaltInline]
    classes = ['collapse']

class LernzielBeschreibungInline(nested_admin.NestedTabularInline):
    """Inline admin for Learning Objective Descriptions"""
    model = LernzielBeschreibung
    extra = 0
    max_num = None
    min_num = 0

class LernzielInline(nested_admin.NestedStackedInline):
    """Inline admin for Learning Objectives with nested descriptions and sub-objectives"""
    model = Lernziel
    extra = 0
    max_num = None
    min_num = 0
    inlines = [LernzielBeschreibungInline, TeilzielInline]
    classes = ['collapse']

class LernbereichInline(nested_admin.NestedStackedInline):
    """Inline admin for Learning Areas with nested learning objectives"""
    model = Lernbereich
    extra = 0
    max_num = None
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
            path('import-all/', self.admin_view(self.import_all), name='import-all'),
        ]
        return custom_urls + urls

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

                    # Importiere zuerst nur die Lehrpläne
                    try:
                        print(f"\nImportiere Lehrpläne...")
                        csv_content = z.read('01_lehrplan.csv').decode('utf-8-sig')
                        dataset = tablib.Dataset().load(csv_content, format='csv')
                        print(f"Lehrplan CSV Inhalt:")
                        print(f"Spalten: {dataset.headers}")
                        for i, row in enumerate(dataset.dict, 1):
                            print(f"Zeile {i}: {row}")
                        
                        # Führe Dry-Run durch
                        print("\nStarte Dry-Run...")
                        result = resources['01_lehrplan.csv'].import_data(
                            dataset, 
                            dry_run=True,
                            raise_errors=True,  # Wichtig: Lasse Fehler durchkommen
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
                            raise Exception("Fehler beim Validieren der Lehrplan-Daten:\n" + "\n".join(errors))
                        
                        if result.has_validation_errors():
                            validation_errors = []
                            for invalid_row in result.invalid_rows:
                                row_number = invalid_row.number + 1
                                validation_errors.append(f"Zeile {row_number}: {str(invalid_row.error)}")
                            raise Exception("Validierungsfehler in den Lehrplan-Daten:\n" + "\n".join(validation_errors))
                        
                        print("Dry-Run erfolgreich, importiere Lehrpläne...")
                        
                        # Importiere die Lehrpläne
                        result = resources['01_lehrplan.csv'].import_data(
                            dataset, 
                            dry_run=False,
                            raise_errors=True,  # Wichtig: Lasse Fehler durchkommen
                            use_transactions=True
                        )
                        
                        if not result.has_errors() and not result.has_validation_errors():
                            id_mappings['01_lehrplan.csv'] = resources['01_lehrplan.csv'].old_id_to_new_id
                            print(f"Lehrplan-Mappings: {id_mappings['01_lehrplan.csv']}")
                            
                            # Überprüfe ob die Lehrpläne in der Datenbank sind
                            for old_id, new_id in id_mappings['01_lehrplan.csv'].items():
                                lehrplan = Lehrplan.objects.get(id=new_id)
                                print(f"Lehrplan {new_id} (war {old_id}) wurde erfolgreich importiert: {lehrplan.fach} ({lehrplan.bundesland})")
                        else:
                            raise Exception("Unerwarteter Fehler beim Import der Lehrpläne")
                        
                    except Exception as e:
                        raise Exception(f"Fehler beim Import der Lehrpläne: {str(e)}")

                    # Importiere die restlichen Dateien
                    for filename in expected_files[1:]:  # Überspringe 01_lehrplan.csv
                        try:
                            print(f"\nVerarbeite Datei: {filename}")
                            csv_content = z.read(filename).decode('utf-8-sig')
                            print(f"Erste 500 Zeichen der Datei: {csv_content[:500]}")
                            
                            dataset = tablib.Dataset().load(csv_content, format='csv')
                            print(f"Anzahl Zeilen in {filename}: {len(dataset)}")
                            if len(dataset) > 0:
                                print(f"Spalten in {filename}: {dataset.headers}")
                                print(f"Erste Zeile in {filename}: {dataset[0]}")
                            
                            # Hole die passende Resource
                            resource = resources[filename]
                            
                            # Bestimme die richtige vorherige Resource basierend auf den Abhängigkeiten
                            # LernbereichResource benötigt -> LehrplanResource
                            # LernzielResource benötigt -> LernbereichResource
                            # LernzielBeschreibungResource benötigt -> LernzielResource
                            # TeilzielResource benötigt -> LernzielResource
                            # TeilzielBeschreibungResource benötigt -> TeilzielResource
                            # LerninhaltResource benötigt -> TeilzielResource
                            # LerninhaltBeschreibungResource benötigt -> LerninhaltResource
                            previous_resource = None
                            
                            if filename == '02_lernbereich.csv':
                                previous_resource = resources['01_lehrplan.csv']
                                print(f"Verwende LehrplanResource als vorherige Resource")
                            elif filename == '03_lernziel.csv':
                                previous_resource = resources['02_lernbereich.csv']
                                print(f"Verwende LernbereichResource als vorherige Resource")
                            elif filename == '04_lernziel_beschreibung.csv':
                                previous_resource = resources['03_lernziel.csv']
                                print(f"Verwende LernzielResource als vorherige Resource")
                            elif filename == '05_teilziel.csv':
                                previous_resource = resources['03_lernziel.csv']
                                print(f"Verwende LernzielResource als vorherige Resource")
                            elif filename == '06_teilziel_beschreibung.csv':
                                previous_resource = resources['05_teilziel.csv']
                                print(f"Verwende TeilzielResource als vorherige Resource")
                            elif filename == '07_lerninhalt.csv':
                                previous_resource = resources['05_teilziel.csv']
                                print(f"Verwende TeilzielResource als vorherige Resource")
                            elif filename == '08_lerninhalt_beschreibung.csv':
                                previous_resource = resources['07_lerninhalt.csv']
                                print(f"Verwende LerninhaltResource als vorherige Resource")
                            else:
                                previous_resource = resources[expected_files[expected_files.index(filename)-1]]
                                print(f"Verwende Standard-Resource: {expected_files[expected_files.index(filename)-1]}")
                                
                            print(f"ID-Mappings von vorheriger Resource ({previous_resource.__class__.__name__}): {previous_resource.old_id_to_new_id}")
                            
                            # Führe einen Dry-Run durch
                            dry_run_result = resource.import_data(
                                dataset, 
                                dry_run=True,
                                resource_instance=previous_resource
                            )
                            if dry_run_result.has_errors():
                                errors = []
                                for row in dry_run_result.row_errors():
                                    row_number = row[0] + 1
                                    row_errors = row[1]
                                    for error in row_errors:
                                        if isinstance(error.error, Exception):
                                            errors.append(f"Zeile {row_number}: {str(error.error)}")
                                        else:
                                            errors.append(f"Zeile {row_number}: {str(error)}")
                                raise Exception('\n'.join(errors))
                            
                            # Wenn der Dry-Run erfolgreich war, führe den echten Import durch
                            result = resource.import_data(
                                dataset, 
                                dry_run=False,
                                resource_instance=previous_resource
                            )
                            
                            # Speichere das ID-Mapping für die nächste Resource
                            id_mappings[filename] = resource.old_id_to_new_id
                            print(f"Gespeicherte Mappings für {filename}: {id_mappings[filename]}")

                        except Exception as e:
                            messages.error(
                                request,
                                f'Fehler beim Import von {filename}: {str(e)}'
                            )
                            return HttpResponseRedirect('.')

                messages.success(request, 'Alle Dateien wurden erfolgreich importiert!')
                return HttpResponseRedirect('.')

            except Exception as e:
                messages.error(
                    request,
                    f'Fehler beim Import: {str(e)}'
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
