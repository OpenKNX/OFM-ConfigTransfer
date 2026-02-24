<!--
# Universal Configuration Transfer for OpenKNX Modules

Application Part for Export, Import, Copy and Cleanup of OpenKNX Modules Channel Configuration 

By Cornelius Koepp 2024-2026

---
-->
# Universeller Konfigurationstransfer für OpenKNX-Module

ETS-Anwendungsteil zum Exportieren, Importieren, Kopieren, Reorganisieren und Zurücksetzen der Konfiguration von OpenKNX-Modul-Kanälen

Von Cornelius Köpp 2024-2026



## Inhaltsverzeichnis

> Eine [**Beschreibung des ETS-Applikationsteils** erfolgt in einem separaten Dokument](doc/Applikationsbeschreibung-ConfigTransfer.md)!

* [Konzepte](#konzepte)
  * [OpenKNX-Module und -Module-Kanäle](#openknx-module-und--module-kanäle)
  * [Serialisierung der Konfigurationsdaten als Zeichenkette](#serialisierung-der-konfigurationsdaten-als-zeichenkette)
* [Funktionen](#funktionen)
  * [Export](#export)
  * [Import](#import)
  * [Kanalkopie](#kanalkopie)
  * [Kanaltausch](#kanaltausch)
  * [Standardwerte](#standardwerte)
* [Geprüfte OpenKNX-Module](#geprüfte-openknx-module)
  * [LogikModul](#logikmodul)
    * [Patch für Parameteränderung mit LogikModul Version 4.0](#patch-für-parameteränderung-mit-logikmodul-version-40)
* [OpenKNX-Applikation mit integriertem Konfigurationstransfer](#openknx-applikation-mit-integriertem-konfigurationstransfer)
* [Integration in ETS-Applikation](#integration-in-ets-applikation)
  * [Voraussetzungen](#voraussetzungen)
  * [ApplikationName.xml](#applikationnamexml)
* (geplant) Beispiele
* [Formatspezifikation (Entwurf)](#formatspezifikation-entwurf)



# Konzepte


## OpenKNX-Module und -Module-Kanäle

Die ETS-Applikationen für OpenKNX-Geräte bestehen aus mehreren Teil-Applikationen die von den genutzten OpenKNX-Modulen bereitgestellt werden.
In den meisten Fällen sind die Module in der ETS direkt in der Block-Struktur einer Applikation sichtbar:

````
+----------------------------+  
| - # OpenKNX                +   \
+----------------------------+    |
|     # Allgemein            |    |  Modul "OpenKNX"
+----------------------------+     > nur Basiseinstellungen (kanalunabhängig)
|     = Erweitert            |    |  
+----------------------------+    |
|     ? Hilfe                |   /
+----------------------------+       dieses Modul
| + # Konfigurationstransfer +   <-  (nur Basiseinstellungen, von Kanaltransfer 
+----------------------------+        ausgeschlossen)
| + # Beispiel-Modul A       |
+----------------------------+
|   ...                      |
+----------------------------+
| - # Beispiel-Modul I       |                                                    \  
+----------------------------+                                                     |
|     # Allgemein            |   \                                                 |
+----------------------------+     > Basiseinstellungen                            |
|       ...                  |   /                                                 |
+----------------------------+                                                     |
|     # Modul-Kanal 1        |   \                                                 |
+----------------------------+    |                                                |
|       ...                  |    |  kanalspezifische Einstellungen                |
+----------------------------+    |  (Anzahl Kanäle abhängig von Applikation)      |
|     # Modul-Kanal n        |   /                                                / 
+----------------------------+
|   ...                      |
+----------------------------+
| + # Beispiel-Modul N       |
+----------------------------+
````

### Modul

> ***ACHTUNG***: Dieser Modul-Begriff weicht vom Konzept der ETS-XML-Module ab!

Ein OpenKNX-Modul stellt eine bestimmte abgrenzbare Funktionalität bereit,
die in vielen Fällen (aber nicht immer) in mehreren Applikationen eingesetzt werden kann.

Beispiele:

* Grundlegende Gerätekonfiguration (BASE aus OGM-Common) die in allen OpenKNX-Applikationen enthalten ist
* Logiken (LOG aus OFM-LogicModule) die in sehr vielen OpenKNX-Geräten enthalten sind
* Konfigurationstransfer (UCT aus OFM-ConfigTransfer, also dieses Modul selbst)


### Kanal

Ein OpenKNX-Modul kann mehrere Instanzen (von ConficTransfer werden bislang 99 unterstützt) der enthaltenen Funktionalität bereitstellen,
die unabhängig voneinander konfigurierbar sind. 
Darüber hinaus besitzen OpenKNX-Module eine "zentrale" Konfiguration die losgelöst von einem einzelnen Kanal existiert.
Beim Konfigurationstransfer wird diese Basiskonfiguration als "Kanal 0" abgebildet. 

Beispiele:

* Logikkanäle innerhalb des Logik-Moduls, die jeweils z.B. eine UND-Verknüpfung oder Zeitschaltuhr abbilden.
* Die grundlegende Gerätekonfiguration und der Konfigurationstransfer enthalten keine Kanäle.


## Serialisierung der Konfigurationsdaten als Zeichenkette

Die Übertragung der Konfigurationsdaten erfolgt serialisiert als Zeichenkette.
Diese kann über die Zwischenablage mit der ETS-Applikation ausgetauscht werden. 
Zeichenvorrat und Codierungsverfahren erlauben eine unkomplizierte Übertagung über gängige Kommunikations-Kanäle, 
auch für Nicht-Entwickler.

ConfigTransfer-Strings haben eine leicht erkennbare Struktur:
```
OpenKNX,cv1,{R}§{E}§;OpenKNX
```

Durch Beginn einschließlich Format-Version und End-Markierung ist eine Erkennung und Prüfung auf Vollständigkeit möglich.
Der Referenz-Pfad (`{R}`) enthält Informationen über die ETS-Applikation, das Modul und den Modul-Kanal. 
Dadurch ist eine Zuordnung der Konfigurationsdaten möglich, sowie auch eine Kompatibilitätsprüfung zwischen Quell und Zielumgebung.
Die Konfigurationseinträge (`{E}`) enthalten Schlüssel-Werte-Paare basierend auf der Modul-internen repräsentation der Konfigurationsdaten.  

Details zum Format siehe Abschnitt [Formatspezifikation (Entwurf)](#formatspezifikation-entwurf).




## Funktionen


### Export
Exportieren eines Modul-Kanals (oder der Modul-Basiskonfiguration) in eine Zeichenkette. 

Der Export erfolgt in eine einzeilige (zum Import) oder mehrzeilige (zur Analyse) Zeichenkette in einem standardisierten und identifizierbaren Format.
Dieses enthält neben der individuellen Konfiguration auch folgende Informationen als Referenz:
* Applikations-ID und Applikations-Version der OpenKNX-Applikation
* Modul-Schlüssel und soweit vorhanden Modul-Version
* Kanal-Nummer (bzw. 0 für Modul-Basiskonfiguration)


### Import

Importieren eines Modul-Kanals (oder der Modul-Basiskonfiguration) aus einer Zeichenkette.

Der Import erfolgt aus einer einzeiligen Zeichenkette, die einem definierten Format entsprechen muss. 
Dieses ist erkennbar an der Struktur `OpenKNX,cv1 ... ;OpenKNX`
Daten in einer abweichenden, nicht unterstützten, Format-Version werden abgelehnt.

Zwingende Voraussetzung für einen Import ist ein übereinstimmender Modul-Schlüssel (Siehe Prefix in [Liste der OpenKNX Module](https://github.com/OpenKNX/OpenKNX/wiki/OpenKNX-Modules#liste-der-openknx-module)).
Eine abweichende Applikations-Version, Applikations-ID, oder Modul-Version können ggf. ignoriert werden (unter Inkaufnahme von je nach Konstellation möglichen Ungenauigkeiten).
Die Kanal-Nummer kann automatisch aus dem Export übernommen, oder manuell - auch abweichend - gewählt werden. 



### Kanalkopie

Duplizieren der Konfiguration eines Kanals auf einen anderen Kanal desselben Moduls.



### Kanaltausch

Vertauschen der Konfiguration eines Kanals auf einen anderen Kanal desselben Moduls.



### Standardwerte

Partielles zurücksetzen auf Standardparameter eines einzelnen Modul-Kanals.

Durch die ETS-Funktion **Standardparameter** werden alle Parameter des Gerätes auf Standardwerte zurückgesetzt.
**Zurücksetzen** simuliert diesen Vorgang lokal beschränkt auf einen einzelnen Kanal eines Moduls.



#### Bekannte Limitationen

* Parameter mit Kanal-spezifischen Werten können (bislang) nicht vollständig zurückgesetzt werden
* Es erfolgt kein (direkter) Schreibzugriff auf Parameter anderer Kanäle oder Module um deren Konfiguration nicht zu verändern. 
  Bei kanalübergreifenden Abhängigkeiten können Nebeneffekte jedoch nicht ausgeschlossen werden. 



## Geprüfte OpenKNX-Module

Die Implementation des Konfigurationstransfers unterstützt grundsätzlich jedes OpenKNX-Modul, 
das über den OpenKNXproducer (Minimalversion siehe [Voraussetzungen](#voraussetzungen)) in eine ETS-Applikation eingebunden werden kann, 
ohne dass dazu besondere Anpassungen vorgesehen sind.

Nutzung von nicht durch den Konfigurationstansfer unterstützten Konstrukten oder Limitationen der ETS können zu Einschränkungen führen.
Im Rahmen der Neuentwicklung von Applikationen mit integrierten Konfigurationstransfer, wurde die Funktion mit verschiedenen OpenKNX-Modulen getestet. 
Die Ergebnisse dieser Prüfungen sind soweit bekannt in der nachfolgenden tabellarischen Auflistung dokumentiert, 
im Fall von behebbaren Auffälligkeiten wird ggf. eine Korrektur des Moduls eingeplant.

| Modul              | Versionen                | Test   | Ergänzende Bemerkungen zur Prüfung                                                                                                                                                                                                                                                                                                                                                                                                                       | ETS-Log       |
|--------------------|--------------------------|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| OGM-Common         | 1.5                      | OK     | Modul-Sichtbarkeit wurde bewusst von der Verarbeitung ausgeschlossen.                                                                                                                                                                                                                                                                                                                                                                                    | -             |
| OGM-Common         | 1.4<br>1.2               | OK     |                                                                                                                                                                                                                                                                                                                                                                                                                                                          | -             |
| OFM-LogicModule    | zwischen <4.0 und>=4.0   | OK*    | ***Einschränkung bei Transfer zwischen Versionen vor und ab 4.0.** Durch Änderungen an der Parameter-Struktur und Verschieben von Funktionen in andere Module können nicht alle Einstellungen beim Wechsel zwischen den Modul-Versionen vor 4.0 und ab 4.0 übertragen werden.                                                                                                                                                                            | ?             |
| OFM-LogicModule    | alle bis inklusive 3.7   | (OK)*  | ***Bekanntes Problem:**<br>Das Sende-Verhalten für EIN und AUS wird abhängig vom einstellten Hardware-Support im Modul (vorhandener Buzzer und vorhandene LED) übertragen. Beim Austausch zwischen Geräten mit unterschiedlicher Konfiguration kann dieser Wert nicht übertragen werden. Bei den meisten Applikationen ist der Hardware-Support nicht konfigurierbar. Probleme können in Verbindung mit OAM-RaumController und OAM-SensorModul auftreten | -             |
| OFM-LogicModule    | 3.5<br>3.3               | OK     |                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ?             |
| OFM-LogicModule    | 3.2<br>3.1               | OK*    | ***Bekannte Einschränkung:**<br>Der mehrzeilige Kanal-Kommentar kann bislang nicht übertragen werden. Dies ist bedingt durch die Einbindung als ETS-Modul.                                                                                                                                                                                                                                                                                               | WARN-Einträge |
| OFM-DFA            | 0.7<br>0.6<br>0.4<br>0.1 | OK     | Sehr lange Operationsdauern. In Tests bis zu 2 Minuten.                                                                                                                                                                                                                                                                                                                                                                                                  | -             |
| OFM-PresenceModule | 3.0                      | OK     |                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ?             |
| OFM-SensorModule   |                          | OK     |                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ?             |
| OFM-VirtualButton  | 0.5                      | OK     |                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ?             |
| OFM-VirtualButton  | bis 0.4                  | FEHLER | Nicht nutzbar in ETS5.7, durch Parameternamen die die beim Zugriff unterstützte Maximallänge überschreiten. Anpassung des Moduls erfolgt, so dass Folgeversionen kompatibel sind.                                                                                                                                                                                                                                                                        | -             |
| OFM-Meter          | 0.2                      | OK     |                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ?             |
| SOM-UP             | 1.0                      | OK     |                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ?             |

### LogikModul

#### Patch für Parameteränderung mit LogikModul Version 4.0

Mit der LogikModul Version 4.0 werden LED und Buzzer-Funktionen in separate Module ausgelagert und Probleme im Zusammenhang mit der Hardwarekonfiguration beseitigt.
In diesem Zusammenhang erfolgt auch eine Änderung der Parameter-Struktur für Konfiguration der Ausgangswerte.
Angesichts der Integration des LogikModuls in nahezu alle OpenKNX-Applikationen wurde in den Konfigurationstransfer 
ab Version 0.5 eine Patch-Funktion integriert, die Probleme beim Übertragen zwischen älteren (vor 4.0) und neueren (ab 4.0) Versionen des Logikmoduls reduziert.

Hintergründe siehe [Besonderheiten ab der Version 4.0 bezüglich Update und Konfigurationstransfer](https://github.com/OpenKNX/OFM-LogicModule/blob/v1/doc/Applikationsbeschreibung-Logik.md#besonderheiten-ab-der-version-40-bez%C3%BCglich-update-und-konfigurationstransfer)


Der Konfigurationstransfer enthält ab v0.5 eine Anpassung die den Austausch von Logiken vor und ab Version 4.0 zu ermöglichen.


## OpenKNX-Applikation mit integriertem Konfigurationstransfer

Der Konfigurationstransfer ist in die meisten ab Juli 2024 veröffentlichten Releases von OpenKNX-Applikationen integriert.
Ein Austausch von Einstellungen kann zwischen allen Applikationen mit demselben OpenKNX-Modul (siehe Spalten) erfolgen.
Einschränkungen sind ggf. durch abweichenden Versionen, oder (sofern diese referenziert werden) durch unterschiedliche Nummerierung von KOs möglich.

### Beispiele von Applikationen und Modulen (unvollständig)

| OpenKNX-Applikation | Version | Release                                               | (UCT) | BASE | NET | LOG | DFA | FCB | SHC | PM  | MTR | BTN | BI  | SENS | WIRE | ADC | SOM     | FIN | FINACT | SWA |
|---------------------|---------|-------------------------------------------------------|-------|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|------|-----|---------|-----|--------|-----|
| OAM-LogicModule     | 3.3     | LogicModule-Release-3.3                               | 0.1   | 1.2  |     | 3.3 |     |     |     |     |     |     |     |      |      |     |         |     |        |     |
| OAM-LogicModule     | 3.3     | LogicModule-**IP**-3.3                                | 0.1   | 1.2  | 0.3 | 3.3 |     |     |     |     |     |     |     |      |      |     |         |     |        |     |
| OAM-StateEngine     | 0.7.1   | StateEngine-DFA16-Release-0.7.1                       | 0.4   | 1.5  |     | 3.7 | 0.7 |     |     |     |     |     |     |      |      |     |         |     |        |     |
| OAM-StateEngine     | 0.1     | StateEngineDFA16 1.0 Beta                             | 0.2   | 1.2  |     | 3.5 | 0.4 |     |     |     |     |     |     |      |      |     |         |     |        |     |
| OAM-RaumController  | 5.1.5   | RaumController-Release-5.1.5                          | 0.4   | 1.5  | 0.5 | 3.7 | 0.6 | 0.6 | 0.4 | 3.9 | 0.5 | 0.5 | 0.2 | 4.10 | 2.1  | 0.1 |         |     |        |     |
| OAM-PresenceModule  | 3.1     | PresenceModule-Big-3.1                                | 0.1   | 1.2  |     | 3.3 |     |     |     | 3.1 |     | 0.5 |     |      |      |     |         |     |        |     |
| OAM-PresenceModule  | 3.1     | PresenceModule-**IP**-3.1                             | 0.1   | 1.2  | 0.3 | 3.3 |     |     |     | 3.1 |     | 0.5 |     |      |      |     |         |     |        |     |
| OAM-PresenceModule  | 1.12.3  | *Nur zur Migration!*<br>PresenceModule-Release-1.12.3 | 0.1   | alt  |     | alt |     |     |     | alt |     |     |     |      |      |     |         |     |        |     |
| SOM-UP              | 1.0     | SoundModule-Release-1.0                               | 0.1   | 1.2  |     | 3.3 |     |     |     |     |     | 0.4 | 0.2 |      |      |     | - (App) |     |        |     |
| OAM-Fingerprint     | 0.6     | FingerPrintModuleReleaseR503-0.6                      | 0.1   | 1.2  |     | 3.3 |     |     |     |     |     | 0.4 | 0.2 |      |      |     |         | 0.6 | - (?)  | 0.1 |



## Integration in ETS-Applikation

Zur Integration des Konfigurationstransfers muss nur die (mit dem [OpenKNXProducer](https://github.com/OpenKNX/OpenKNXproducer) erzeugte) OpenKNX ETS Applikation erweitert werden. 
An der Firmware ist zum aktuellen Zeitpunkt keine Anpassung erforderlich; dies kann sich mit zukünftigen Funktionserweiterungen jedoch noch ändern.


### Voraussetzungen

* Der [OpenKNXProducer](https://github.com/OpenKNX/OpenKNXproducer) wird in einer Version ab Release [4.0.1](https://github.com/OpenKNX/OpenKNXproducer/releases/tag/v4.0.1) benötigt um die Modulinformationen zur integrieren.
  > **Achtung:** Es erfolgt technisch bedingt *keine* Warnung und kein Hinweis beim Einsatz einer veralteten Producer-Version (vor 4.0)!
  > 
  > Ältere Versionen des Producers sind u.A. nicht in der Lage die erforderliche Minimalversion anderer Module sicherzustellen,
  > dies würde zu erheblichen Problemen bei Verwendung mit dem LogikModul führen!
  > Ältere Versionen können auch Parameter einschließen, die nicht im Konfigurationstransfer verwendet werden dürfen.
* Das [LogikModul](https://github.com/OpenKNX/OAM-LogicModule) muss auf Version 4.0 aktualisiert werden, falls gemeinsam verwendet.
  Bei älteren Versionen kann durch den Migrations-Patch für dieses Modul ein Verlust der Ausgangskonfiguration beim Import auftreten.
  Der OpenKNXProducer ab Version 4.0 wird eine gemeinsame Nutzung mit einem veralteten LogikModul verhindern 


### ApplikationName.xml

An der gewünschten Stelle (z.B. hinter BASE) den folgenden Code einbinden:
```
  <!-- Set current version to use: -->
  <op:config name="%UCT_VerifyVersion%"  value="..." />
  
  <!-- no KOs -->
  <op:define prefix="UCT"
             share="../lib/OFM-ConfigTransfer/src/ConfigTransfer.share.xml"
             ModuleType="19">
    <op:verify File="../lib/OFM-ConfigTransfer/library.json" ModuleVersion="%UCT_VerifyVersion%" />
  </op:define>
```

# Formatspezifikation (Entwurf)
![EBNF Format-Spezifikation](doc/config-serial-format.ebnf.png)