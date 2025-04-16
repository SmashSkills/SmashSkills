# Text-Popup für TldrawEditor

Diese Erweiterung fügt ein Text-Popup zur Bearbeitung von Textelementen im Tldraw-Editor hinzu.

## Implementierte Features

- **TextPopUp:** Ein Wrapper-Komponente für die TextSettingsPopup, der dem gleichen Muster wie DrawPopUp und ShapePopUp folgt.
- **TextSettingsPopup:** Eine umfassende Komponente zur Konfiguration von Textelementen mit folgenden Funktionen:
  - Auswahl der Textfarbe aus einer vordefinierten Farbpalette
  - Auswahl von Schriftarten (Sans-Serif, Serif, Monospace, Handschrift)
  - Auswahl von Schriftstilen (Normal, Kursiv)
  - Auswahl von Schriftgrößen (Klein, Mittel, Groß, Sehr groß)
  - Auswahl der Textausrichtung (Links, Mitte, Rechts)
  - Live-Vorschau der aktuellen Textformatierung
  - Aktivierung des Textwerkzeugs direkt aus dem Popup

## Integration in die bestehende Anwendung

Die neue Textfunktionalität wurde in die bestehende Anwendung integriert durch:

1. Erstellung der neuen TextPopUp- und TextSettingsPopup-Komponenten
2. Erweiterung der Worksheet-Komponente, um den Zustand und die Anzeige des TextPopUps zu verwalten
3. Aktualisierung der CustomToolbar-Komponente mit neuen Text-bezogenen Buttons und Funktionen

## Verwendung

1. Klicke auf den Text-Button in der Toolbar, um das Text-Werkzeug zu aktivieren
2. Klicke auf die Arbeitsfläche, um einen Text zu platzieren
3. Verwende das Texteinstellungs-Popup, um das Erscheinungsbild des Textes anzupassen
4. Alternativ: Wähle ein bestehendes Textelement aus und nutze das Einstellungs-Popup, um es zu formatieren

## Beispiel

Das Texteinstellungs-Popup bietet eine intuitive Oberfläche mit:

- Farbauswahl
- Schriftartenauswahl
- Formatierungsoptionen
- Vorschau der aktuellen Einstellungen

Diese Erweiterung vervollständigt die Editor-Funktionalität und bietet nun umfassende Werkzeuge für das Zeichnen, das Erstellen von Formen und die Textbearbeitung.
