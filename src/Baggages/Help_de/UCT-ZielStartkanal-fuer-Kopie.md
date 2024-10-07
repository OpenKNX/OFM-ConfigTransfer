### Ziel/Startkanal für Kopie


Wählt den Kanal, der als Startkanal die Kanal-Nummern aller Zielkanäle definiert.

Der Quell-Kanal mit der niedrigsten Kanal-Nummer (**Achtung:** diese weicht womöglich von der ersten durch den Nutzer eingegebenen Kanal-Nummer ab!) wird auf diesen Start-Kanal kopiert, alle weiteren Ziel-Kanäle ergeben sich aus der relativen Position der Kanäle wie in der Quelle.

***Beispiel:***
Ein Startkanal `8` wird bei Angabe der Quellkanäle `5-7,1,3` zu einem Kopieren auf die Kanäle `8,10,12-14` führen.
Genauer `1->8, 3->10, 5->12, 6->13, 7->14`.


Die Kanalkopie ist nur dann möglich, wenn die gewählte Kanal-Nummer und alle anderen sich aus dieser egebenden Ziel-Kanäle im gewählten Modul existieren.


