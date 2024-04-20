### Exportierte Parameter

Legt fest in welchem Umfang Parameter in den Export aufgenommen werden sollen, 
die keinen aktuellen Einfluss auf die Konfiguration besitzen.


#### Standard

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



