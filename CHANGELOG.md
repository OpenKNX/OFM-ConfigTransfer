# v0.2.0
* Hotfix #14 für OAM-PresenceModule/OFM-PresenceModule:
  Exporte aus älteren Versionen von PM konnten nicht importiert werden, weil Parameter entfallen sind.
  Mit Kompatibilität **lockerer** wird der Import nun nicht mehr abgebrochen, wenn unbekannte Parameter-Namen auftreten,
  sondern nur noch Warn-Meldungen im Import-Resultat ausgegeben. 
  Dies betraf vor allem den Migrationspfad zum Wechsel auf eine andere Applikations-Variante.
* Fix #9: 
  Der Versuch eine Basiskonfiguration in einen anderen Zielkanal zu importieren wurde nicht explizit abgefangen 
  und resultierte in einer unpassenden Fehlermeldung. 
  Ein Import bei exakte übereinstimmenden Parameternamen (kein bekanntes Auftreten in Releases) wurde nicht verhindert.
* Fix/Improvement: Anzeige von Erfolgsmeldung auch bei Ausgabe von Nachrichten aus Transfer-String
* Fix: Verbesserte Prüfung von Kanal-Definition in Transfer-String beim Import
* Quality: Integration automatisierter Testfälle für JS in ETS-Applikation
* Fix/Rework: Auswertung der Modul-Version in Prüfung vor Import, speziell Fälle ohne Versionsangabe am Modul
* Fix/Improvement: Genauere Fehleranzeige für Spezial-Einträge

# v0.1.0 (2024-07-08, 82f2335a74ffd44254c57ebe58bafb062574f1d2)

Erste Version zur Integration in produktive Applikationen, für neue OpenKNX Releases ab 2024-07.
Export/Import/Kopie/Reset eines Modul-Kanals mit stabiler Version 'cv1' des Transfer-Formats.
