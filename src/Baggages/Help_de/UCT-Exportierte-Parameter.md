### Exportierte Parameter

Legt fest in welchem Umfang Parameter in den Export aufgenommen werden sollen, 
die keinen aktuellen Einfluss auf die Konfiguration besitzen.


#### Standard (aktive mit individuellem Wert)

Exportiert nur solche Parameter, die aktuell in der ETS angezeigt werden und auf einen Wert haben der nicht dem Standard-Wert entspricht.
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


