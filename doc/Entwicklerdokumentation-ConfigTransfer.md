<!-- SPDX-License-Identifier: AGPL-3.0-only -->
<!-- Copyright (C) 2025 Cornelius Köpp -->
# Entwicklerdokumentation OFM-ConfigTransfer

# Inhaltsverzeichnis

* [Kanal-Tausch](#kanal-tausch)
    * [Integration eigener Buttons](#integration-eigener-buttons)



# Kanal-Tausch


## Integration eigener Buttons

### Beispiel
```
<ParameterBlock Id="%AID%_PB-nnn" Name="Settings">
  <!-- Anzahl der Kanäle -->
  <choose ParamRefId="%AID%_UP-%TT%00000_R-%TT%0000001">
    <when test="&gt;=%C%">

      <!-- ... Kanal-Spezifische UI ... -->

    </when>
    <when test="&gt;=%C+1%">

      <!-- Tausch von benachbarten Kanälen -->
      <!-- sofern noch ein Nachfolgekanal existiert -->

      <Button Id="%AID%_B-%TT%%CC%901" 
            Icon="ofm-configtransfer-button-swap-small" 
            Text="Tausche %C% und %C+1%" 
            EventHandler="uctBtnSwap"
            EventHandlerParameters="{ &quot;module&quot;:&quot;FCB&quot;, &quot;channelA&quot;:%C%, &quot;channelB&quot;:%C+1% }"
      />

    </when>
  </choose>
</ParameterBlock>
```

## Tausch-Button-Attribute 
Die Tausch-Buttons für den Kanal-Tausch haben folgende Attribute:

### Individuell
- **Text**: Anzeigetext des Buttons, der den Zweck erklärt (z.B. `Tausche %C% und %C+1%`)
- **EventHandlerParameters**: JSON-formatierte Parameter zur Festlegung der zu tauschenden Kanäle:
  - **module**: Gibt das zu bearbeitende Modul an (hier "FCB")
  - **channelA**: Der erste Kanal, der getauscht werden soll (z.B. dynamisch mit `%C%` gefüllt)
  - **channelB**: Der zweite Kanal, der getauscht werden soll (z.B. dynamisch mit `%C+1%` gefüllt, für den nachfolgenden Kanal)
- **Id**: Id im Namespace von Modul und Kanal 

### Vorgabewerte
- **EventHandler**: Funktionsname `uctBtnSwap` zum Aufruf des Tausch-Scripts.
- **Icon**: Immer die Grafik `ofm-configtransfer-button-swap-small`, so wird auch sichergestellt, dass die Abhängigkeit zum ConfigTransfer-Modul erfüllt wird.

