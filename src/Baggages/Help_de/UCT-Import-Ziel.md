### Import-Ziel

Legt fest, wohin innerhalb des Moduls importiert werden soll. 


#### automatisch aus Export übernehmen

Sorgt dafür, dass in denselben Kanal importiert wird, aus dem zuvor exportiert wurde. 
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



