import os
import django
import csv

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from curriculum.models import (
    Lehrplan, Lernbereich, Lernziel, LernzielBeschreibung,
    Teilziel, TeilzielBeschreibung, Lerninhalt, LerninhaltBeschreibung
)

def export_model_to_csv(model, filename):
    """Export ein Django-Model zu CSV"""
    # Hole alle Instanzen
    instances = model.objects.all()
    if not instances:
        print(f"Keine Daten für {model.__name__}")
        return
    
    # Bestimme die Felder
    fields = [f.name for f in model._meta.fields]
    
    # Schreibe CSV
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        # Schreibe Header
        writer.writerow(fields)
        # Schreibe Daten
        for instance in instances:
            row = [getattr(instance, field) for field in fields]
            writer.writerow(row)
    
    print(f"{model.__name__} exportiert nach {filename}")

def main():
    """Hauptfunktion zum Exportieren aller Modelle"""
    models = [
        (Lehrplan, '1_lehrplan.csv'),
        (Lernbereich, '2_lernbereich.csv'),
        (Lernziel, '3_lernziel.csv'),
        (LernzielBeschreibung, '4_lernziel_beschreibung.csv'),
        (Teilziel, '5_teilziel.csv'),
        (TeilzielBeschreibung, '6_teilziel_beschreibung.csv'),
        (Lerninhalt, '7_lerninhalt.csv'),
        (LerninhaltBeschreibung, '8_lerninhalt_beschreibung.csv')
    ]
    
    for model, filename in models:
        export_model_to_csv(model, filename)

if __name__ == '__main__':
    main() 