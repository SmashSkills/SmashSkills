from django.db import models

# Create your models here.


class Bundesland(models.Model):
    bundesland = models.CharField(max_length=100)

    def __str__(self):
        return self.bundesland
    
class Klassenstufe(models.Model):
    klassenstufe = models.CharField(max_length=100)
    def __str__(self):
        return self.klassenstufe

class Fach(models.Model):
    fach_titel = models.CharField(max_length=100)
    bundesland = models.ForeignKey(Bundesland, on_delete=models.CASCADE)
    klassenstufe = models.ForeignKey(Klassenstufe, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.klassenstufe} - {self.fach_titel}"
    
class Lernfeld(models.Model):
    lernfeld = models.CharField(max_length=100)
    unterrichtseinheiten = models.IntegerField() #Parameter für positive Zahlen
    fach_id = models.ForeignKey(Fach, on_delete=models.CASCADE)

    def __str__(self):
        return f"Klassenstufe: {self.fach_id.klassenstufe} – Fach: {self.fach_id.fach_titel} – Lernfeld: {self.lernfeld}"

class Lernziele(models.Model):
    lernziel = models.CharField(max_length=100)
    lernfeld_id = models.ForeignKey(Lernfeld, on_delete=models.CASCADE)

    def __str__(self):
        return f"Klassenstufe: {self.lernfeld_id.fach_id.klassenstufe} – Lernfeld: {self.lernfeld_id.lernfeld} – Lernziel: {self.lernziel}"
    
class Lernziele_Beschreibung(models.Model):
    lernziel_beschreibung = models.TextField()
    lernziel_id = models.ForeignKey(Lernziele, on_delete=models.CASCADE)

    def __str__(self):
        return self.lernziel_beschreibung
    
class Teilziele(models.Model):
    teilziel = models.CharField(max_length=100)
    lernziele_id = models.ForeignKey(Lernziele, on_delete=models.CASCADE)

    def __str__(self):
        return f"Teilziel-ID: {self.id} – Teilziel: {self.teilziel}"
    
class Teilziele_Beschreibung(models.Model):
    teilziel_beschreibung = models.TextField()
    teilziel_id = models.ForeignKey(Teilziele, on_delete=models.CASCADE)

    def __str__(self):
        return self.teilziel_beschreibung
    
class Lerninhalt(models.Model):
    lerninhalt = models.CharField(max_length=100)
    teilziel_id = models.ForeignKey(Teilziele, on_delete=models.CASCADE)

    def __str__(self):
        return f"Lerninhalt-ID: {self.id} – Lerninhalt: {self.lerninhalt}" 
    
class Lerninhalt_Beschreibung(models.Model):
    lerninhalt_beschreibung = models.TextField()
    lerninhalt_id = models.ForeignKey(Lerninhalt, on_delete=models.CASCADE)

    def __str__(self):
        return self.lerninhalt_beschreibung

