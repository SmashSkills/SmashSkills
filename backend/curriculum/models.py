from django.db import models

class Lehrplan(models.Model):
    """
    Represents a curriculum with grade levels, state and subject.
    """
    klassenstufen = models.CharField(
        max_length=100,
        help_text="Mehrere Klassenstufen durch Komma trennen, z. B. '3, 4, 5a'"
    )
    bundesland = models.CharField(max_length=100)
    fach = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.fach} (Klasse {self.klassenstufen}, {self.bundesland})"

class Lernbereich(models.Model):
    """
    Represents a learning area within a curriculum.
    Contains number, name and teaching hours.
    """
    lehrplan = models.ForeignKey(Lehrplan, related_name="lernbereiche", on_delete=models.CASCADE)
    nummer = models.PositiveIntegerField()
    name = models.CharField(max_length=255)
    unterrichtsstunden = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} (#{self.nummer})"

class Lernziel(models.Model):
    """
    Represents a learning objective within a learning area.
    """
    lernbereich = models.ForeignKey(Lernbereich, related_name="lernziele", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class LernzielBeschreibung(models.Model):
    """
    Represents a detailed description of a learning objective.
    """
    lernziel = models.ForeignKey(Lernziel, related_name="beschreibungen", on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return self.text[:50]

class Teilziel(models.Model):
    """
    Represents a sub-objective within a learning objective.
    """
    lernziel = models.ForeignKey(Lernziel, related_name="teilziele", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class TeilzielBeschreibung(models.Model):
    """
    Represents a detailed description of a sub-objective.
    """
    teilziel = models.ForeignKey(Teilziel, related_name="beschreibungen", on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return self.text[:50]

class Lerninhalt(models.Model):
    """
    Represents learning content associated with a sub-objective.
    """
    teilziel = models.ForeignKey(Teilziel, related_name="lerninhalte", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class LerninhaltBeschreibung(models.Model):
    """
    Represents a detailed description of learning content.
    """
    lerninhalt = models.ForeignKey(Lerninhalt, related_name="beschreibungen", on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return self.text[:50]
