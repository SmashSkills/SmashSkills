from django.db import models

class Lehrplan(models.Model):
    klassenstufen = models.CharField(
        max_length=100,
        help_text="Mehrere Klassenstufen durch Komma trennen, z. B. '3, 4, 5a'"
    )
    bundesland = models.CharField(max_length=100)
    fach = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.fach} (Klasse {self.klassenstufen}, {self.bundesland})"

class Lernbereich(models.Model):
    lehrplan = models.ForeignKey(Lehrplan, related_name="lernbereiche", on_delete=models.CASCADE)
    nummer = models.PositiveIntegerField()
    name = models.CharField(max_length=255)
    unterrichtsstunden = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} (#{self.nummer})"

class Lernziel(models.Model):
    lernbereich = models.ForeignKey(Lernbereich, related_name="lernziele", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class LernzielBeschreibung(models.Model):
    lernziel = models.ForeignKey(Lernziel, related_name="beschreibungen", on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return self.text[:50]

class Teilziel(models.Model):
    lernziel = models.ForeignKey(Lernziel, related_name="teilziele", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class TeilzielBeschreibung(models.Model):
    teilziel = models.ForeignKey(Teilziel, related_name="beschreibungen", on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return self.text[:50]

class Lerninhalt(models.Model):
    teilziel = models.ForeignKey(Teilziel, related_name="lerninhalte", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class LerninhaltBeschreibung(models.Model):
    lerninhalt = models.ForeignKey(Lerninhalt, related_name="beschreibungen", on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return self.text[:50]
