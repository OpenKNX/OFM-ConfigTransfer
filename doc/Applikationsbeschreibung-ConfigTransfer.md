<!-- SPDX-License-Identifier: AGPL-3.0-only -->
<!-- Copyright (C) 2024-2025 Cornelius Köpp -->
# Applikationsbeschreibung OFM-ConfigTransfer



# Inhaltsverzeichnis

* [Bekannte Limitationen](#bekannte-limitationen)
* ETS-Konfiguration:
  [**Konfigurationstransfer**](#ets-applikationsteilkonfigurationstransfer)
    * [**Hinweise &amp; Limitationen**](#hinweise--limitationen)
    * [**Kanalkopie**](#kanalkopie)
    * [**Kanaltausch**](#kanaltausch)
    * [**Standardwerte**](#standardwerte)
    * [**Import**](#import)
    * [**Export**](#export)

* [Kommunikationsobjekte](#kommunikationsobjekte)



<!-- DOC -->
# Bekannte Limitationen

## Fehlende Unterstützung von KOs (Kommunikationsobjekten)

* Die KO-Konfiguration (GA-Zuordnungen oder KO-Flags) kann NICHT transferiert werden.
* KOs werden beim Schreiben von Konfiguration ohne die übliche Rückfrage ausgeblendet unter Verlust der GA-Verknüpfungen.
* KOs die durch einen Import wieder sichtbar werden, können ggf. noch frühere GA-Verknüpfungen enthalten.

## ETS-Module (z.B. Mehrzeilige Kommentare)

* Parameter in ETS-Modulen werden bislang NICHT unterstützt.

## Abweichungen zwischen Kanälen

* Parameter deren Standardwert abhängig vom Kanal definiert ist, können nicht zurückgesetzt werden.

## Abweichungen bei Modul-Integration/-Version

* Innerhalb von OpenKNX-Modulen veränderte Standard-Parameter-Werte können dazu führen, dass beim Import die Standardwerte der Zielumgebung verwendet werden.



# ETS-Applikationsteil:<br />Konfigurationstransfer


## Hinweise &amp; Limitationen


### Konfigurationstransfer

#### Version

Zeigt die Modul-Version im Format `Major.Minor` an.

> Das Versions-Schema von OpenKNX-Modulen ist an die Versionierung von ETS-Applikationen angelehnt 
> und weicht daher vom Konzept der semantischen Versionierung (SemVer) ab! 

### Hinweise zur Nutzung

Wichtige Bemerkungen zum Einsatz dieses Moduls 


### Bekannte Limitationen

Auflistung von bekannter Einschränkungen bei der Nutzung vom Konfigurationstransfer.




<!-- DOC -->
## Kanalkopie

Erlaubt die Vervielfältigung von Kanal-Konfigurationen, bzw. kann unterstützen bei der Reorganisation von Kanälen innerhalb eines Moduls.


### Modul

<!-- TODO Redundante Beschreibungen besser lösen -->
Wählt das Modul, zwischen dessen Kanälen die Konfiguration kopiert werden soll.
Die Modulbezeichnungen entsprechen der Beschriftung der Konfigurationsseiten innerhalb der ETS-Applikation.

Einzelne Module können vom Ersteller der Applikation von der Nutzung im Konfigurationstransfer ausgeschlossen worden sein.
Diese und auch Module ohne enthaltene Kanäle stehen nicht zur Auswahl.




### Quell-Kanal

Wählt den Kanal, der als Kopier-Vorlage dienen soll.

Die Kanalkopie wird scheitern, 
falls das gewählte Modul keine Kanäle besitzt, 
oder keinen Kanal mit der entsprechenden Nummer.


### Ziel-Kanal

Wählt den Kanal, der mit der Konfiguration des Quell-Kanals überschrieben werden soll.

Die Kanalkopie wird scheitern, 
falls das gewählte Modul keinen Kanal mit der entsprechenden Nummer besitzt,
oder der Ziel-Kanal identisch zum Quell-Kanal ausgewählt wurde.


### Kopieren (Button)

Startet den Kopiervorgang mit Überschreiben des Ziel-Kanals.
Dieser Prozess kann u.U. mehrere Minuten in Anspruch nehmen und kann weder unterbrochen noch rückgängig gemacht werden!

> **ACHTUNG**: Vor dem Kopieren sollte sichergestellt werden, dass durch Überschreiben des Ziel-Kanals keine Konfigurationsdaten verloren gehen!


### Kopier-Resultat

Hier erfolgt eine Rückmeldung aus dem Kopier-Prozess.
Bei Bedarf kann die Ausgabe in die Zwischenablage kopiert werden;
sobald einer der anderen Parameter auf dieser Seite verändert wird,
wird der die Ausgabe geleert um Widersprüche zu den gewählten Einstellungen zu verhindern.

Der Wert wird nicht weiterverarbeitet innerhalb der Applikation.




<!-- DOC -->
## Kanaltausch

Erlaubt das Tauschen von Kanal-Konfigurationen, 
bzw. kann unterstützen bei der Reorganisation von Kanälen innerhalb eines Moduls.

> **ACHTUNG**: Ggf. vorhandene Verknüpfungen mit Gruppenadresse werden *nicht* getauscht!


### Modul

<!-- TODO Redundante Beschreibungen besser lösen -->
Wählt das Modul, in dem Kanäle getauscht werden sollen.
Die Modulbezeichnungen entsprechen der Beschriftung der Konfigurationsseiten innerhalb der ETS-Applikation.

Einzelne Module können vom Ersteller der Applikation von der Nutzung im Konfigurationstransfer ausgeschlossen worden sein.
Diese und auch Module ohne enthaltene Kanäle stehen nicht zur Auswahl.




### Kanal A/B

Wählt die Kanäle, die gegeneinander getauscht werden sollen.

Der Kanaltausch wird scheitern,
falls das gewählte Modul keine Kanäle mit der entsprechenden Nummer besitzt,
oder beide Kanäle identisch ausgewählt wurden.


### Tauschen (Button)

Startet das Tauschen von Kanal A und B.
Dieser Prozess kann u.U. mehrere Minuten in Anspruch nehmen und kann weder unterbrochen noch rückgängig gemacht werden!


### Tausch-Resultat

Hier erfolgt eine Rückmeldung aus dem Tausch-Prozess.
Bei Bedarf kann die Ausgabe in die Zwischenablage kopiert werden;
sobald einer der anderen Parameter auf dieser Seite verändert wird,
wird der die Ausgabe geleert um Widersprüche zu den gewählten Einstellungen zu verhindern.

Der Wert wird nicht weiterverarbeitet innerhalb der Applikation.



<!-- DOC -->
## Standardwerte

Erlaubt die Bereinigung von Kanal-Konfigurationen.



### Modul

<!-- TODO Redundante Beschreibungen besser lösen -->
Wählt das Modul, dessen Kanal auf Standardwerte zurückgesetzt werden.
Die Modulbezeichnungen entsprechen der Beschriftung der Konfigurationsseiten innerhalb der ETS-Applikation.

Einzelne Module können vom Ersteller der Applikation von der Nutzung im Konfigurationstransfer ausgeschlossen worden sein.
Diese und auch Module ohne enthaltene Kanäle stehen nicht zur Auswahl.



### Kanal

Wählt den Kanal, der mit Standardeinstellungen überschrieben werden soll.

Das Zurücksetzen des Kanals wird scheitern,
falls das gewählte Modul keinen Kanal mit der entsprechenden Nummer besitzt.


### Zurücksetzen (Button)

Startet das Überschreiben des ausgewählten Kanals mit Standardeinstellungen.
Dieser Prozess kann u.U. mehrere Minuten in Anspruch nehmen und kann weder unterbrochen noch rückgängig gemacht werden!

> **ACHTUNG**: Vor dem Kopieren sollte sichergestellt werden, dass durch Überschreiben des Ziel-Kanals keine Konfigurationsdaten verloren gehen!


### Resultat

Hier erfolgt eine Rückmeldung aus dem Rücksetz-Prozess.
Bei Bedarf kann die Ausgabe in die Zwischenablage kopiert werden;
sobald einer der anderen Parameter auf dieser Seite verändert wird,
wird die Ausgabe geleert um Widersprüche zu den gewählten Einstellungen zu verhindern.

Der Wert wird nicht weiterverarbeitet innerhalb der Applikation.




<!-- DOC -->
## Import

Erlaubt die Übernahme von Konfiguration ...

* ... aus anderen OpenKNX-Geräten
* ... aus Konfigurationsbeispielen
* ... von anderen OpenKNX-Nutzern
* ... aus externen Konfigurationstools

<!-- DOCCONTENT
### Importieren (Button)

Startet den Import mit den aktuellen Eingaben/Einstellungen.
Dieser Prozess kann u.U. mehrere Minuten in Anspruch nehmen und kann weder unterbrochen noch rückgängig gemacht werden!

> **ACHTUNG**: Vor dem Import sollte sichergestellt werden, dass durch Überschreiben des Zielkanals keine Konfigurationsdaten verloren gehen! 
DOCCONTENT -->


<!-- DOC -->
### Transfer-String

Hier muss die Zeichenkette mit der (serialisierten) Konfiguration in einem unterstützten Format eingegeben werden.
Diese Zeichenkette enthält u.A. auch eine Referenz auf das OpenKNX-Modul, in das die Konfiguration importiert wird.

Eine oberflächliche Formatprüfung stellt sicher,
dass nur Eingaben angenommen werden die einen vollständigen ConfigTransfer-String enthalten *können*.
Eine genaue Prüfung erfolgt jedoch erst nach dem Klick auf den Button *Importieren*.

> Exporte aus anderen ConfigTransfer-Versionen werden unterstützt, solange keine Änderung des Formats erfolgt.
  Abweichende Formatversionen werden hier noch nicht erkannt.



<!-- DOC -->
### Import-Ziel

Legt fest, wohin innerhalb des Moduls importiert werden soll.


#### automatisch aus Export übernehmen

Sorgt dafür, dass in denselben Kanal importiert wird, aus dem zuvor exportiert wurde.
Voraussetzung dafür ist eine im Export-String enthaltene Kanal-Nummer.

Der Import mit dieser Einstellung wird scheitern,
falls ein kanal-neutraler ConfigTransfer-String genutzt wird,
oder eine Kanal-Nummer angegeben ist die in dieser Applikation nicht für das Modul definiert ist.


#### Basiseinstellungen (kanalunabhängig)

Erzwingt, dass nur eine kanalunabhängige Konfiguration importiert wird.

Der Import mit dieser Einstellung wird scheitern,
falls ein kanal-bezogener oder kanal-neutraler ConfigTransfer-String genutzt wird.


#### n (1 bis 99)

Sorgt dafür, dass eine Kanal-Konfiguration in den gewählten Kanal importiert wird,
unabhängig davon aus welchem Kanal sie exportiert wurde.

Der Import mit dieser Einstellung wird scheitern,
falls ein kanalunabhängiger ConfigTransfer-String genutzt wird,
oder eine Kanal-Nummer angegeben ist die in dieser Applikation nicht für das Modul definiert ist.


<!-- DOC -->
### Importieren (Button)

Startet den Import mit den aktuellen Eingaben/Einstellungen.
Dieser Prozess kann u.U. mehrere Minuten in Anspruch nehmen und kann weder unterbrochen noch rückgängig gemacht werden!

> **ACHTUNG**: Vor dem Import sollte sichergestellt werden, dass durch Überschreiben des Zielkanals keine Konfigurationsdaten verloren gehen!



<!-- DOC -->
### Import-Resultat

Hier erfolgt eine Rückmeldung aus dem Import-Prozess.
Bei Bedarf kann die Ausgabe in die Zwischenablage kopiert werden;
sobald einer der anderen Parameter auf dieser Seite verändert wird,
wird der die Ausgabe geleert um Widersprüche zu den gewählten Einstellungen zu verhindern.

Der Wert wird nicht weiterverarbeitet innerhalb der Applikation.




<!-- DOC -->
## Export

Erlaubt die Ausgabe von Konfiguration ...

* ... zur Übertragung in andere OpenKNX-Geräte
* ... zur Weitergabe an andere OpenKNX-Nutzer
* ... zur Sicherung/Dokumentation
* ... zur Nutzung in externen Tools

<!-- DOCCONTENT
### Exportieren (Button)

Startet den Export mit den aktuellen Einstellungen.
Dieser Prozess kann u.U. mehrere Minuten in Anspruch nehmen!
DOCCONTENT -->


<!-- DOC -->
### Modul

Wählt das Modul, aus dem die Konfiguration exportiert werden soll.
Die Modulbezeichnungen entsprechen der Beschriftung der Konfigurationsseiten innerhalb der ETS-Applikation.

Einzelne Module können vom Ersteller der Applikation von der Nutzung im Konfigurationstransfer ausgeschlossen worden sein.
Diese stehen dann nicht zur Auswahl. Das Modul Konfigurationstransfer selbst wird ebenfalls nicht zum Export angeboten.



<!-- DOC -->
### Inhalt/Kanal

Entscheidet welcher Teil der Modul-Konfiguration exportiert werden soll:


#### Basiseinstellungen (kanalunabhängig)

Exportiert Konfiguration die übergreifend für alle Kanäle wirkt, oder keinen Bezug zu einem Kanal besitzt.

Dieser Export ist immer möglich, selbst wenn keine entsprechende Konfigurationsmöglichkeit vorhanden ist.


#### n (1 bis 99)

Sorgt dafür, dass die Konfiguration des Kanals mit der gewählten Nummer exportiert wird,
sofern ein Kanal mit dieser Nummer existiert.

Der Export wird scheitern,
falls das gewählte Modul keine Kanäle besitzt, oder keinen Kanal mit der entsprechenden Nummer.



<!-- DOC -->
### Exportierte Parameter

Legt fest in welchem Umfang Parameter in den Export aufgenommen werden sollen,
die keinen aktuellen Einfluss auf die Konfiguration besitzen.


#### Standard (aktive mit individuellem Wert)

Exportiert nur solche Parameter, die aktuell in der ETS angezeigt werden und entweder
auf einen Wert eingestellt sind, der nicht dem Standard-Wert entspricht,
oder
unabhängig vom Wert immer exportiert werden müssen.

Frühere vorgenommene Einstellungen, die durch Änderung anderer Parameter ausgeblendet wurden, werden vom Export ausgeschlossen.

Diese Einstellung vermeidet, dass Altlasten in der Konfiguration weiterleben.
Daraus resultiert im Ergebnis (bei erneutem Import) jedoch ein Verhalten, dass vom Quell-Gerät abweicht:
Zuvor unsichtbare Parameter erhalten Ihren Standardwert und nicht mehr den zuletzt vergebenen.


#### auch inaktive/unsichtbare

Exportiert auch solche Parameter,
die irgendwann mal auf einen Wert abweichend vom aktuellen Standardwert gesetzt wurden derzeit ausgeblendet/inaktiv sind.
Selbst wenn diese nicht gleichzeitig mit den eingeblendeten/aktiven Parametern wirksam sein können.

Diese Einstellung kann die Größe des Exports *erheblich* erhöhen,
bietet jedoch auch die Möglichkeit um z.B. Konfigurationen für unterschiedliche Ausgangstypen alternativ abzubilden.


#### auch Standardwerte

Exportiert alle Parameter, die sichtbar sind, auch wenn sie auf den Standard-Wert gesetzt sind.

Diese Einstellung wird die Größe des Exports i.d.R. *erheblich* erhöhen,
kann jedoch helfen, wenn eine Übertragung in eine abweichende Modulversion mit veränderten Standardwerten erfolgen soll.


<!-- DOC -->
### Format

Wählt die Form in der die Ausgabe erfolgt.
Diese hat keinen Einfluss auf den Inhalt des Exportes,
legt jedoch fest welche Art der Weiterverarbeitung möglich ist.


#### Standard (für Import und Support)

Der Export erfolgt ohne Zeilenumbrüche in einer einzigen Zeile.
Dies ist zwingend erforderlich um die Ausgabe für den Import in einem andere Gerät nutzen zu können,
da die ETS keine mehrzeitligen Eingaben unterstützt.


#### Mehrzeilig (kein Import möglich!)

**Achtung:** Für Support-Zwecke sollte dieses Format nicht verwendet werden, ohne eine explizite Aufforderung durch Modul-Entwickler.

Der Export erfolgt mit einem Zeilenumbruch jeweils vor und nach jedem Konfigurationswert.

Falls innerhalb der Modul-Definition sprechende Parameternamen eingesetzt werden,
können Entwickler u.U. bei einfachen Modulen direkt bestimmte Einstellungen erkennen.


<!-- DOC -->
### Exportieren (Button)

Startet den Export mit den aktuellen Einstellungen.
Dieser Prozess kann u.U. mehrere Minuten in Anspruch nehmen!


<!-- DOC -->
### Export-String

Hier erfolgt die Ausgabe der serialisierten Konfigurationsdaten im gewählten Format.
Bei Bedarf kann die Ausgabe in die Zwischenablage kopiert werden.

Sobald einer der anderen Parameter auf dieser Seite verändert wird,
wird der Export-String geleert um Widersprüche zu den gewählten Einstellungen zu verhindern.




# Kommunikationsobjekte

Dieses Modul besitzt keine KOs.
