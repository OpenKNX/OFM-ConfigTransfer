# (geplant) v0.3
* Fix: Aktualisierung Hilfetexte zu Update in Hotfix #14 
* Feature #11: Erweiterung der Kopierfunktion um Unterstützung für Kanalgruppen und Mehrfachkopien
* Feature #17: Batch-Export mit Ausgabe von mehreren Einzelkanälen  

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
  * Improvement: Fehleranzeige für Unbekannte Einträge
* Quality: Integration automatisierter Testfälle für JS in ETS-Applikation

# v0.1.0 (2024-07-08, 82f2335a74ffd44254c57ebe58bafb062574f1d2)

Erste Version zur Integration in produktive Applikationen, für neue OpenKNX Releases ab 2024-07.
Export/Import/Kopie/Reset eines Modul-Kanals mit stabiler Version 'cv1' des Transfer-Formats.
