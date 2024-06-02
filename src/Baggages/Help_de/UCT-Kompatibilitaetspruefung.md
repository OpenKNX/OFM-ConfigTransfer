### Kompatibilitätsprüfung

Ein Konfigurationstransfer zwischen unterschiedlichen Applikationen birgt ein gewisses Risiko von unerwarteten Ergebnissen,
bedingt durch z.B. unterschiedliche KO-Nummern, veränderte Parameter, Parameterwerten und deren Interpretation innerhalb eines Moduls.

Durch das Level der Kompatibilitätsprüfung kann dieses Risiko, zu Lasten eines flexibleren Konfiguratrionstransfers, beschränkt werden.


#### streng       (selbe Modul- & ETS-App-Version)

Akzeptiert nur Importe, die aus exakt derselben Applikation mit exakt derselben Version stammen (und damit auch gleichzeitig dieselbe Modul-Version aufweisen).

Abgesehen von allgemeinen technischen Limitationen, bietet diese Einstellung die höchste Sicherheit einer unveränderten Konfigurationsübernahme,
bei Abweichungen in referenzierten Kanälen sind jedoch auch hier Einschränkungen möglich.



#### moderat   (selbe Modul-Version)

Akzeptiert Importe, solange diese aus derselben Modulversion stammen.

Diese Einstellung bietet immer noch eine hohe Sicherheit der korrekten Konfigurationsübernahme, 
solange die Kanal-Konfiguration keinen Bezug nach außen hat.
Erwartbare Einschränkungen sind z.B. Verknüpfungen zu internen KOs, die nicht mehr auf das erwarte Ziel zeigen, 
wenn KO-Nummern zwischen den beteiligten Applikation abweichen.



#### locker       (gleiche Parameternamen)

Versucht den Import durchzuführen, 
solange keine Parameternamen enthalten sind, die im Modul in dieser Applikation unbekannt sind.

Das wird in vielen Fällen immer noch zum gewünschten Ergebnis führen, 
wobei die in den anderen Stufen genannten Einschränkungen weiterhin gelten. 
Das Risiko von unerwarteten Effekten steigt mit dem Abstand zwischen den Versionen. 
Fälle in denen auch ein ETS-Upgrade möglich wäre bergen nur ein geringes Risiko.

Unter individueller Beachtung der Versionsunterschiede erlaubt diese Option eine sehr hohe Flexibilität.




