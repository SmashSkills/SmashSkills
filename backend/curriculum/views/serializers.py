"""
Serialisierer für Curriculum-Modelle.

Dieses Modul enthält Serialisierer-Klassen für die Umwandlung von Modellinstanzen
in JSON-serialisierbare Datenstrukturen. Diese Serialisierer werden von den API-Views
verwendet, um konsistente Antwortformate bereitzustellen.
"""

class CurriculumSerializer:
    """
    Hilfsklasse für die Serialisierung von Lehrplandaten mit allen zugehörigen Entitäten.
    Zentralisiert die Serialisierungslogik, um Code-Duplikation zu vermeiden.
    
    Diese Klasse verwendet einen statischen Ansatz ohne Instanzvariablen, da sie
    hauptsächlich als Utility-Klasse dient. Alle Methoden sind als @staticmethod
    implementiert, um eine einfache Verwendung ohne Instanziierung zu ermöglichen.
    """
    
    @staticmethod
    def serialize_curriculum(lehrplan):
        """
        Serialisiert ein Lehrplanobjekt mit allen zugehörigen Daten in eine hierarchische Struktur.
        
        Args:
            lehrplan: Das zu serialisierende Lehrplanobjekt
            
        Returns:
            dict: Ein Dictionary mit der vollständigen Lehrplanstruktur
        """
        data = {
            "Lehrplan_id": lehrplan.id,
            "Klassenstufen": lehrplan.klassenstufen,
            "Bundesland": lehrplan.bundesland,
            "Fach": lehrplan.fach,
            "Lernbereiche": []
        }

        for lb in lehrplan.lernbereiche.all():
            lb_data = {
                "Lernbereich_id": lb.id,
                "Lernbereich_Nummer": lb.nummer,
                "Lernbereich_name": lb.name,
                "Unterrichtsstunden": lb.unterrichtsstunden,
                "Lernziele": []
            }

            for lz in lb.lernziele.all():
                lz_data = {
                    "Lernziel_id": lz.id,
                    "Lernziel_name": lz.name,
                    "Lernziel_Beschreibungen": [b.text for b in lz.beschreibungen.all()],
                    "Teilziele": []
                }

                for tz in lz.teilziele.all():
                    tz_data = {
                        "Teilziel_id": tz.id,
                        "Teilziel_name": tz.name,
                        "Teilziel_beschreibungen": [b.text for b in tz.beschreibungen.all()],
                        "Lerninhalte": []
                    }

                    for li in tz.lerninhalte.all():
                        li_data = {
                            "Lerninhalt_id": li.id,
                            "Lerninhalt_name": li.name,
                            "Lerninhalt_beschreibungen": [b.text for b in li.beschreibungen.all()]
                        }
                        tz_data["Lerninhalte"].append(li_data)

                    lz_data["Teilziele"].append(tz_data)

                lb_data["Lernziele"].append(lz_data)

            data["Lernbereiche"].append(lb_data)

        return data

    @staticmethod
    def get_prefetch_related_fields():
        """
        Gibt eine Liste von Feldern zurück, die für optimierte Abfragen vorgeladen werden sollen
        
        Returns:
            list: Eine Liste von zugehörigen Feld-Pfaden zum Vorladen
        """
        return [
            'lernbereiche',
            'lernbereiche__lernziele',
            'lernbereiche__lernziele__beschreibungen',
            'lernbereiche__lernziele__teilziele',
            'lernbereiche__lernziele__teilziele__beschreibungen',
            'lernbereiche__lernziele__teilziele__lerninhalte',
            'lernbereiche__lernziele__teilziele__lerninhalte__beschreibungen'
        ] 