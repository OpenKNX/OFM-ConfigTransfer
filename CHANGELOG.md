# (geplant) v0.2

* Fix #9: 
  Der Versuch eine Basiskonfiguration in einen anderen Zielkanal zu importieren wurde nicht explizit abgefangen 
  und resultierte in einer unpassenden Fehlermeldung. 
  Ein Import bei exakte übereinstimmenden Parameternamen (kein bekanntes Auftreten in Releases) wurde nicht verhindert.
* Fix: Verbesserte Prüfung von Kanal-Definition in Transfer-String beim Import
* Quality: Integration automatisierter Testfälle für JS in ETS-Applikation
* Fix/Rework: Auswertung der Modul-Version in Prüfung vor Import, speziell Fälle ohne Versionsangabe am Modul
* Fix/Improvement: Anzeige von Erfolgsmeldung auch bei Ausgabe von Nachrichten aus Transfer-String
* Fix/Improvement: Genauere Fehleranzeige für Spezial-Einträge

# v0.1.0 (2024-07-08, 82f2335a74ffd44254c57ebe58bafb062574f1d2)

Erste Version zur Integration in produktive Applikationen, für neue OpenKNX Releases ab 2024-07.
Export/Import/Kopie/Reset eines Modul-Kanals mit stabiler Version 'cv1' des Transfer-Formats.
