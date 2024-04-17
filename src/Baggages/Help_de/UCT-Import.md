### Import

Erlaubt die Übernahme von Konfiguration ...
* ... aus anderen OpenKNX-Geräten
* ... aus Konfigurationsbeispielen
* ... von anderen OpenKNX-Nutzern
* ... aus externen Konfigurationstools

### Export-String
Hier muss die Zeichenkette mit der (serialisierten) Konfiguration in einem unterstützten Format eingegeben werden.
Diese Zeichenkette enthält u.A. auch eine Referenz auf das OpenKNX-Modul, in das die Konfiguration importiert wird.

Eine oberflächliche Formatprüfung stellt sicher, 
dass nur Eingaben angenommen werden die einen vollständigen ConfigTransfer-String enthalten *können*. 
Eine genaue Prüfung erfolgt jedoch erst nach dem Klick auf den Button *Importieren*.

> Exporte aus anderen ConfigTransfer-Versionen werden unterstützt, solange keine Änderung des Formats erfolgt.
> Abweichende Formatversionen werden hier noch nicht erkannt. 


### Import-Ziel
Legt fest, wohin innerhalb des Moduls importiert werden soll. 

#### automatisch aus Export übernehmen
Sorgt dafür, dass in denselben Kanal exportiert wird, aus dem zuvor exportiert wurde. 
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



### Kompatibilitätsprüfung
Ein Konfigurationstransfer zwischen unterschiedlichen Applikationen birgt ein gewisses Risiko von unerwarteten Ergebnissen,
bedingt durch z.B. unterschiedliche KO-Nummern, veränderte Parameter, Parameterwerten und deren Interpretation innerhalb eines Moduls.

Durch das Level der Kompatibilitätsprüfung kann dieses Risiko, zu Lasten eines flexibleren Konfiguratrionstransfers, beschränkt werden.


#### streng       (selbe Modul- &amp; ETS-App-Version)
Akzeptiert nur Importe, die aus exakt derselben Applikation mit exakt derselben Version stammen (und damit auch gleichzeitig dieselbe Modul-Version aufweisen).

Abgesehen von allgemeinen technischen Limitationen, bietet diese Einstellung die höchste Sicherheit einer unveränderten Konfigurationsübernahme,
bei Abweichungen in referenzierten Kanälen sind jedoch auch hier Einschränkungen möglich.

> Anwendungsszenarien:
> * Verschiebung von einzelnen Funktionalitäten zwischen (von Applikationsseite) identischen OpenKNX-Geräten
> * Aktualisierung von einzelnen Funktionalitäten die identisch auf mehreren Geräten umgesetzt wurde (z.B. selbe Funktion in je einem Gerät pro Raum)

#### moderat   (selbe Modul-Version)
Akzeptiert Importe, solange diese aus derselben Modulversion stammen.

Diese Einstellung bietet immer noch eine hohe Sicherheit der korrekten Konfigurationsübernahme, 
solange die Kanal-Konfiguration keinen Bezug nach außen hat.
Erwartbare Einschränkungen sind z.B. Verknüpfungen zu internen KOs, die nicht mehr auf das erwarte Ziel zeigen, 
wenn KO-Nummern zwischen den beteiligten Applikation abweichen.

> Anwendungsszenarien:
> * Verschiebung von einzelnen Funktionalitäten (oder Migration) zwischen verschiedenen OpenKNX-Applikationen derselben Generation (z.B. zwischen TP und IP, von OAM-LogicModule auf OAM-DFA oder OAM-PresenceModule)
> * Weitergabe von Konfigurationsbeispielen einer aktuellen Modul-Version


#### locker       (gleiche Parameternamen)
Versucht den Import durchzuführen, 
solange keine Parameternamen enthalten sind, die im Modul in dieser Applikation unbekannt sind.

Das wird in vielen Fällen immer noch zum gewünschten Ergebnis führen, 
wobei die in den anderen Stufen genannten Einschränkungen weiterhi gelten. 
Das Risiko von unerwarteten Effekten steigt mit dem Abstand zwischen den Versionen. 
Fälle in denen auch ein ETS-Upgrade möglich wäre bergen nur ein geringes Risiko.

Unter individueller Beachtung der Versionsunterschiede erlaubt diese Option eine sehr hohe Flexibilität.

> Anwendungsszenarien:
> * Verschiebung von einzelnen Funktionalitäten (oder Migration) zwischen sehr unterschiedlichen OpenKNX-Applikationen
> * Weitergabe von Versions-unabhängigen Konfigurationsbeispielen mit Bezug zu stabilen Konfigurationsoptionen




### Importieren (Button)
Startet den Import mit den aktuellen Eingaben/Einstellungen.
Dieser Prozess kann u.U. mehrere Minuten in Anspruch nehmen und kann weder unterbrochen noch rückgängig gemacht werden!

> **ACHTUNG**: Vor dem Import sollte sichergestellt werden, dass durch Überschreiben des Zielkanals keine Konfigurationsdaten verloren gehen! 


### Import-Resultat
Hier erfolgt eine Rückmeldung aus dem Import-Prozess. 
Bei Bedarf kann die Ausgabe in die Zwischenablage kopiert werden;
sobald einer der anderen Parameter auf dieser Seite verändert wird, 
wird der die Ausgabe geleert um Widersprüche zu den gewählten Einstellungen zu verhindern.  

Der Wert wird nicht weiterverarbeitet innerhalb der Applikation.




