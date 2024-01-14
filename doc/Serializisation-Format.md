
# Format Draft

## Requirements
* MUST allow import into ETS by normal user
  * MUST fit in one line
  * MUST contain only characters supported by ETS-param-input-fields
  * MUST not exceed maximum length limit
* MUST support all contents
* MUST contain only characters supported by Forum, Internet, eMail
* MUST ensure identification (is a given string is an export?)
* MUST prepare further extensions
* MUST allow a compact representation
* MUST support all OpenKNX-Modules (OFM)
* MUST support all OpenKNX-Applications
* MUST support different app and module versions
* MUST support OpenKNX-Channels
* MUST allow reimport into same module (and version) in other application
* SHOULD be human readably, OPTIONAL as an alternative output-only-format
* SHOULD be human editable
* MUST allow representation without default values
* MUST support channels of unlimited size
* SHOULD support multiple channels in one package
* SHOULD support module base configuration
* OPTIONAL: support a form of compression
* SHOULD: support check of completeness
* SHOULD: support a checksum to detect modification in transfer
* OPTIONAL: support a signature to detect other modification
* OPTIONAL: include meta-data of export
  * OPTIONAL: include export-time
  * OPTIONAL: include device info, as far as available in ETS
* SHOULD: support individual serialisation
  * MUST be detectable from importer

## Contents
* Format-Specifier
  * Type
  * Version
  * Variant
  * ...
* Application (at least for information)
  * Id
  * Version
* Module-Specifier
  * Name
  * Version
* Channel-Number
* Configuration
  * Param-Value-Pairs

## Format
* Use `§` as alternative to `\n` as this character is typically not part of text-entries in ETS (at least this is my assumption)

<!-- FORMAT := HEADER ; ( SEPARATOR ; DATA )* -->
```
FORMAT := FORMAT_MULTI | FORMAT_SINGLE
FORMAT_SINGLE := HEADER ; ( '§'  ; DATA )*
FORMAT_MULTI  := HEADER ; ( '\n' ; DATA )*
```
### Header
```
HEADER   := HEADERv1
HEADERv1 := MAGIC ; ',' ; VERSION ; ',' ; MODULE_PREFIX ; ',' ; MODULE_VERSION ; ',' ; CHANNEL_NUMBER

HEADERvX := MAGIC ; ',' ; VERSION ; ',' ; ... ; MODULE_PREFIX ; ',' ; MODULE_VERSION ; ',' ; CHANNEL_NUMBER
```
### Data
```
DATA := DATA_KEY_VALUE | DATA_VALUE_KEYS

KEY_SET := KEY_RANGE ; ( ',' ; KEY_RANGE )+
KEY_RANGE : = KEY | KEY ; ':' ; KEY | KEY ; ':' ; KEY ; ':' ; KEY 
```

<!--
KEY := /\d+/
KEY_RANGE := /\d+-\d+/ 
KEY_RANGE := KEY ; '-' ; KEY

KEY_SET := /\d+-\d+(,\d+-\d+)*/
-->

```
DATA_KEY_VALUE  := PARAM_NUMBER ; '=' ; VALUE
DATA_VALUE_KEYS := VALUE ; '~' ; PARAM_NUMBER ( ',' ; PARAM_NUMBER)* 
``` 
