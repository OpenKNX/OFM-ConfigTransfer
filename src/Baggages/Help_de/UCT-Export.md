### Export

Erlaubt die Ausgabe von Konfiguration ...
* ... zur Übertragung in andere OpenKNX-Geräte
* ... zur Weitergabe an andere OpenKNX-Nutzer
* ... zur Sicherung/Dokumentation
* ... zur Nutzung in externen Tools

### Modul
Wählt das Modul, aus dem die Konfiguration exportiert werden soll.
Die Modulbezeichnungen entsprechen der Beschriftung der Konfigurationsseiten innerhalb der ETS-Applikation.

Einzelne Module können vom Ersteller der Applikation von der Nutzung im Konfigurationstransfer ausgeschlossen worden sein.
Diese stehen dann nicht zur Auswahl.

Dieses Modul (Konfigurationstransfer / OFM-ConfigTransfer) wird nicht zum Export angeboten.


### Inhalt/Kanal
Entscheidet welcher Teil der Modul-Konfiguration exportiert werden soll.

#### Basiseinstellungen (kanalunabhängig)
Exportiert Konfiguration die übergreifend für alle Kanäle wirkt, oder keinen Bezug zu einem Kanal besitzt.

Dieser Export ist immer möglich, selbst wenn keine entsprechende Konfigurationsmöglichkeit vorhanden ist.  

#### n (1 bis 99)
Sorgt dafür, dass die Konfiguration des Kanals mit der gewählten Nummer exportiert wird, 
sofern ein Kanal mit dieser Nummer existiert.

Der Export wird scheitern, 
falls das gewählte Modul keine Kanäle besitzt, oder keinen Kanal mit der entsprechenden Nummer.


### Exportierte Parameter
Legt fest in welchem Umfang Parameter in den Export aufgenommen werden sollen, 
die keinen aktuellen Einfluss auf die Konfiguration besitzen.

#### nur aktive/sichtbare (Standard)
Exportiert nur solche Parameter, die aktuell in der ETS angezeigt werden und (soweit einem Speicherbereich zugeordnet) Einfluss auf das Speicherabbild des Gerätes haben.
Frühere vorgenommene Einstellungen, die durch Änderung anderer Parameter ausgeblendet wurden, werden vom Export ausgeschlossen.

Diese Einstellung vermeidet, dass Altlasten in der Konfiguration weiterleben. 
Daraus resultiert im Ergebnis (bei erneutem Import) jedoch ein Verhalten, dass vom Quell-Gerät abweicht: 
Zuvor unsichtbare Parameter erhalten Ihren Standardwert und nicht mehr den zuletzt vergebenen.

#### alle Parameter
Exportiert auch solche Parameter, 
die irgendwann mal auf einen Wert abweichend vom aktuellen Standardwert gesetzt wurden derzeit ausgeblendet/inaktiv sind.
Selbst wenn diese nicht gleichzeitig mit den eingeblendeten/aktiven Parametern wirksam sein können.

Diese Einstellung kann die Größe des Exports *erheblich* erhöhen, 
bietet jedoch auch die Möglichkeit um z.B. Konfigurationen für unterschiedliche Ausgangstypen alternativ abzubilden.


### Format
Wählt die Form in der die Ausgabe erfolgt.
Diese hat keinen Einfluss auf den Inhalt des Exportes, 
legt jedoch fest welche Art der Weiterverarbeitung möglich ist.   

#### Standardformat (für Import)
Der Export erfolgt ohne Zeilenumbrüche in einer einzigen Zeile.
Dies ist zwingend erforderlich um die Ausgabe für den Import in einem andere Gerät nutzen zu können, 
da die ETS keine mehrzeitligen Eingaben unterstützt.  

#### Menschenlesbar/Mehrzeilig (für Analyse)
Der Export erfolgt mit einem Zeilenumbruch jeweils vor und nach jedem Konfigurationswert.
Dadurch ist der Inhalt für Menschen übersichtlicher und wesentlich einfacher zu erfassen,
insbesondere dann wenn innerhalb der Modul-Definition sprechende Parameternamen eingesetzt werden. 

Diese Darstellungsform kann z.B. in der Kommunikation mit Modul-Entwicklern genutzt werden

### Exportieren (Button)
Startet den Export mit den aktuellen Einstellungen.
Dieser Prozess kann u.U. mehrere Minuten in Anspruch nehmen!

### Export-String
Hier erfolgt die Ausgabe der serialisierten Konfigurationsdaten im gewählten Format.
Bei Bedarf kann die Ausgabe in die Zwischenablage kopiert werden.

Sobald einer der anderen Parameter auf dieser Seite verändert wird,
wird der Export-String geleert um Widersprüche zu den gewählten Einstellungen zu verhindern.




