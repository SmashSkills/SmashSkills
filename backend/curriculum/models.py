from django.db import models

class BaseModel(models.Model):
    """
    Abstrakte Basisklasse, die gemeinsame Felder und Funktionalitäten bereitstellt.
    """
    class Meta:
        abstract = True


class NamedModel(BaseModel):
    """
    Abstrakte Basisklasse für Modelle mit einem Namensfeld.
    """
    name = models.CharField(max_length=255)
    
    class Meta:
        abstract = True
        
    def __str__(self):
        return self.name


class TextualDescriptionModel(BaseModel):
    """
    Abstrakte Basisklasse für Modelle mit einer Textbeschreibung.
    """
    text = models.TextField()
    
    class Meta:
        abstract = True
        
    def __str__(self):
        return self.text[:50] + ('...' if len(self.text) > 50 else '')


class Lehrplan(BaseModel):
    """
    Repräsentiert einen Lehrplan mit Klassenstufen, Bundesland und Fach.
    """
    klassenstufen = models.CharField(
        max_length=100,
        help_text="Mehrere Klassenstufen durch Komma trennen, z. B. '3, 4, 5a'"
    )
    bundesland = models.CharField(max_length=100)
    fach = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = "Lehrplan"
        verbose_name_plural = "Lehrpläne"
        ordering = ['bundesland', 'fach', 'klassenstufen']

    def __str__(self):
        return f"{self.fach} (Klasse {self.klassenstufen}, {self.bundesland})"


class Lernbereich(BaseModel):
    """
    Repräsentiert einen Lernbereich innerhalb eines Lehrplans.
    Enthält Nummer, Name und Unterrichtsstunden.
    """
    lehrplan = models.ForeignKey(Lehrplan, related_name="lernbereiche", on_delete=models.CASCADE)
    nummer = models.PositiveIntegerField()
    name = models.CharField(max_length=255)
    unterrichtsstunden = models.PositiveIntegerField()
    
    class Meta:
        verbose_name = "Lernbereich"
        verbose_name_plural = "Lernbereiche"
        ordering = ['lehrplan', 'nummer']
        unique_together = ['lehrplan', 'nummer']

    def __str__(self):
        return f"{self.name} (#{self.nummer})"


class Lernziel(NamedModel):
    """
    Repräsentiert ein Lernziel innerhalb eines Lernbereichs.
    """
    lernbereich = models.ForeignKey(Lernbereich, related_name="lernziele", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Lernziel"
        verbose_name_plural = "Lernziele"
        ordering = ['lernbereich', 'id']


class LernzielBeschreibung(TextualDescriptionModel):
    """
    Repräsentiert eine detaillierte Beschreibung eines Lernziels.
    """
    lernziel = models.ForeignKey(Lernziel, related_name="beschreibungen", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Lernzielbeschreibung"
        verbose_name_plural = "Lernzielbeschreibungen"


class Teilziel(NamedModel):
    """
    Repräsentiert ein Teilziel innerhalb eines Lernziels.
    """
    lernziel = models.ForeignKey(Lernziel, related_name="teilziele", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Teilziel"
        verbose_name_plural = "Teilziele"
        ordering = ['lernziel', 'id']


class TeilzielBeschreibung(TextualDescriptionModel):
    """
    Repräsentiert eine detaillierte Beschreibung eines Teilziels.
    """
    teilziel = models.ForeignKey(Teilziel, related_name="beschreibungen", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Teilzielbeschreibung"
        verbose_name_plural = "Teilzielbeschreibungen"


class Lerninhalt(NamedModel):
    """
    Repräsentiert einen Lerninhalt, der einem Teilziel zugeordnet ist.
    """
    teilziel = models.ForeignKey(Teilziel, related_name="lerninhalte", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Lerninhalt"
        verbose_name_plural = "Lerninhalte"
        ordering = ['teilziel', 'id']


class LerninhaltBeschreibung(TextualDescriptionModel):
    """
    Repräsentiert eine detaillierte Beschreibung eines Lerninhalts.
    """
    lerninhalt = models.ForeignKey(Lerninhalt, related_name="beschreibungen", on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Lerninhaltbeschreibung"
        verbose_name_plural = "Lerninhaltbeschreibungen"
