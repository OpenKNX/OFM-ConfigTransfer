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


