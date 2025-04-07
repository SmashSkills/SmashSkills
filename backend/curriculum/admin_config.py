"""
Gemeinsame Konfigurationen für Admin-Klassen.

Dieses Modul enthält gemeinsame Konfigurationsklassen und Hilfsprogramme für die Admin-Oberfläche,
um Konsistenz zu gewährleisten und Duplikation in Admin-Klassendefinitionen zu reduzieren.
"""

class AdminConfig:
    """
    Gemeinsame Konfiguration für Admin-Klassen.
    
    Diese Klasse stellt eine zentrale Stelle für die Konfiguration von Admin-Klassen
    bereit und hilft dabei, Konsistenz in der gesamten Admin-Oberfläche zu gewährleisten.
    Sie enthält vordefinierte Konfigurationen für Inline-Modelle, Medien-Assets und
    Import/Export-Einstellungen sowie Hilfsmethoden für häufige Admin-Konfigurationsaufgaben.
    
    Verwendungsbeispiel:
        class MeinModelAdmin(admin.ModelAdmin):
            # Standardkonfigurationen verwenden
            inlines = [MeineInlineKlasse(**AdminConfig.INLINE_CONFIG)]
            
            # Medien-Ressourcen hinzufügen
            class Media:
                css = AdminConfig.COMMON_MEDIA['css']
                js = AdminConfig.COMMON_MEDIA['js']
            
            # Widget-Konfiguration bei Formulargenerierung
            def get_form(self, request, obj=None, **kwargs):
                form = super().get_form(request, obj, **kwargs)
                widget_configs = {'feld1': {'style': 'width: 300px;'}}
                return AdminConfig.configure_form_widgets(form, widget_configs)
    """
    
    # Inline-Konfiguration
    INLINE_CONFIG = {
        'extra': 0,
        'max_num': None,
        'min_num': 0,
    }
    
    # Admin Media-Konfiguration
    COMMON_MEDIA = {
        'css': {
            'all': ('admin/css/forms.css',)
        },
        'js': ('admin/js/collapse.js',)
    }
    
    # Import-Export-Konfiguration
    IMPORT_EXPORT_CONFIG = {
        'skip_unchanged': False,
        'report_skipped': False,
        'use_bulk': False,
        'batch_size': 1,
    }
    
    @staticmethod
    def get_list_display_with_actions(fields):
        """
        Fügt Standardaktionsfelder zur Listendarstellung hinzu.
        
        Args:
            fields (list): Die Basisfelder, die angezeigt werden sollen
            
        Returns:
            list: Felder plus Aktionsfelder
        """
        return list(fields) + ['changed_date_display', 'created_date_display']
        
    @staticmethod
    def configure_form_widgets(form, widget_configs):
        """
        Konfiguriert Formular-Widgets mit spezifischen Attributen.
        
        Args:
            form: Das zu konfigurierende Formular
            widget_configs (dict): Dictionary, das Feldnamen auf Attributwörterbücher abbildet
            
        Returns:
            form: Das konfigurierte Formular
        """
        for field_name, attrs in widget_configs.items():
            if field_name in form.base_fields:
                for attr_name, attr_value in attrs.items():
                    form.base_fields[field_name].widget.attrs[attr_name] = attr_value
        return form 