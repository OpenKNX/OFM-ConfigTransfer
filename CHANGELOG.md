# 0.5.0 "LOG-Patches" (2026-02-24)

* **Wichtig:** Der [OpenKNXProducer](https://github.com/OpenKNX/OpenKNXproducer) muss auf Version [4.0.1](https://github.com/OpenKNX/OpenKNXproducer/releases/tag/v4.0.1) aktualisiert werden!
  > ***Achtung:*** Es erfolgt keine Warnung oder Hinweis beim Einsatz einer veralteten Producer-Version!


* Fix: Patch zur Parameter-Umstellung im Logikmodul 4.0
  * Verhindert Fehlermeldungen beim ansonsten funktionierenden Import aus älteren Versionen
  * Verhindert stillen Konfigurationsverlust beim Import in ältere Versionen des LogikModuls (der bei den häufigsten Hardware-Konfigurationen eintreten würde)
* Import:
  * Hinweise bei Versionsänderungen
  * Zusätzlicher Hinweis bei Fehlern/Warnungen, falls eine Änderung der Modulversion erfolgt 
  * Anpassung von Parameter-Fehlermeldungen
* Dokumentation: Update/Erweiterung


# 0.4.0 (2025-07-03)

* **Wichtig:** Der [OpenKNXProducer](https://github.com/OpenKNX/OpenKNXproducer) muss auf Version [3.8.0](https://github.com/OpenKNX/OpenKNXproducer/releases/tag/v3.8.0) aktualisiert werden!
  > ***Achtung:*** Es erfolgt keine Warnung oder Hinweis beim Einsatz einer veralteten Producer-Version!
  
  Folgende Änderungen/Verbesserungen ergeben sich durch Updates des OpenKNXproducer seit Erscheinen von ConfigTransfer v0.2.0 und sind ggf. auch schon in einzelnen OpenKNX-Applikationen mit ConfigTransfer v0.2 verfügbar:
  * Fix: Ausschluss von Parametern die nicht direkt durch den Nutzer geändert werden können.
    (Diese hatten teilweise für Probleme beim Transfer gesorgt und werden i.d.R. aus den anderen Parametern abgeleitet. Durch den Ausschluss haben sich in der Praxis bisher keine Nachteile gezeigt.)
  * Fix: Standard-Parameter-Werte können nun das Zeichen `%` enthalten
  * Detail-Verbesserung: Darstellung der Modul-Auswahl
  * Erweiterung: Explizite Beeinflussung ob Parameter-Werte in den Transfer eingeschlossen/ausgeschlossen werden, oder immer exportiert werden. 
    Diese Möglichkeit ist erforderlich zur Verbesserung der Kompatiblität beim Transfer mit veränderten Standardwerten und wird im neuen OpenKNX Common 1.4 benötigt. 
* Feature #36: **Tausch von Kanälen**
  * Eigener Parameterblock analog zu *Kanalkopie*
  * Bereitstellung Funktion zur Nutzung in Modulen, siehe [Entwicklerdokumentation](doc/Entwicklerdokumentation-ConfigTransfer.md)
* Verbesserungen/Anpassungen, basierend auf Nutzererfahrungen:
  * Geänderte Reihenfolge der Parameter-Blöcke (Seiten): Kanalkopie, Kanaltausch, Standardwerte, Import, Export.
    Operationen innerhalb der Applikation werden in der Praxis häufiger verwendet als Import und Export.
  * Import
    * Konfiguration der Kompatibilitätsprüfung aus der Benutzeroberfläche entfernt.
      Das Verhalten entspricht nun dem Kompatibilitätslevel **lockerer**.
      Der bisherige Standard-Level **streng** verhinderte in der Praxis sehr häufig den Import, 
      was bei Nutzern teilweise für Verwirrung sorgte.
      In der Praxis führte die deutlich höhere Toleranz von **lockerer** zu keinen gravierenden Problemen.
    * Tolerieren/Trimmen von Whitespaces vor und nach Transfer-String
    * Direkte Integration von Hinweis zur erforderlichen Nachbereitung
  * Beschriftung für Auswahl von Export-Format.
    "Menschenlesbar" wurde häufig fälschlicherweise für Support-Zwecke ausgewählt.
  * Anzeige von Applikations- und Modul-Versionsnummern in lesbarer einheitlicher Form
  * Dokumentation Bekannte Limitationen in Kontexthilfe verschoben
* Vorbereitung auf Multi-Channel-Transfer: Hinweis bei Erkennung von geplanter Format-Version
* Bereinigung XML, Dokumentation, Kommentare

# v0.2.0 (2024-07-28, 5e1b62604e6c71fb299dbdece9e8c145a9e35fde)

* **Hotfix #14 für OAM-PresenceModule/OFM-PresenceModule:**
  Exporte aus älteren Versionen von PM konnten nicht importiert werden, weil Parameter entfallen sind.
  Mit Kompatibilität **lockerer** wird der Import nun nicht mehr abgebrochen, wenn unbekannte Parameter-Namen auftreten,
  sondern nur noch Warn-Meldungen im Import-Resultat ausgegeben. 
  Dies betraf vor allem den Migrationspfad zum Wechsel auf eine andere Applikations-Variante.
* **Import** - Verbesserungen bei der Fehlerbehandlung und Rückmeldung:
  * Fix #9: 
    Der Versuch eine Basiskonfiguration in einen anderen Zielkanal zu importieren (oder umgekehrt) wurde nicht explizit abgefangen 
    und resultierte in einer unpassenden Fehlermeldung. 
    Ein Import bei exakt übereinstimmenden Parameternamen (kein bekanntes Auftreten in Releases) wurde nicht verhindert.
  * Fix/Improvement: 
    **Import-Resultat** unterscheidet sich im Text nun 
    zwischen Importen ohne Auffälligkeiten, mit Warnungen oder Fehlern. 
    Dazu wurde die Erzeugung des Meldungstextes umgestellt.   
  * Fix: Verbesserte Prüfung von Kanal-Definition in Transfer-String beim Import
  * Fix/Rework: Auswertung der Modul-Version in Prüfung vor Import, speziell Fälle ohne Versionsangabe am Modul
  * Improvement: Genauere Fehleranzeige für Spezial-Einträge
  * Improvement: Fehleranzeige für unbekannte Einträge
* Quality: Integration automatisierter Testfälle für JS in ETS-Applikation

# v0.1.0 (2024-07-08, 82f2335a74ffd44254c57ebe58bafb062574f1d2)

Erste Version zur Integration in produktive Applikationen, für neue OpenKNX Releases ab 2024-07.
Export/Import/Kopie/Reset eines Modul-Kanals mit stabiler Version 'cv1' des Transfer-Formats.
