### Bekannte Limitationen

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



