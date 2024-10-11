// OFM-ConfigTransfer --
// SPDX-License-Identifier: AGPL-3.0-only

var uctFormatVer = "cv1";
var uctGenVer = "0.1.0";
var uctGen = "uct";
var uctAppId = uctVersionInformation[0];
var uctAppVer = uctVersionInformation[1];
// var uctAppName = null;

function uctIsDisjoint(a, b) {
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < b.length; j++) {
            if (a[i] == b[j]) {
                return false;
            }
        }
    }
    return true;
}

function uctParseRangesString(channelsString) {
    var channels = [];
    var ranges = channelsString.split(",");
    var cs = {};
    for (var i = 0; i < ranges.length; i++) {
        var limits = ranges[i].split("-");
        if (limits.length == 1) {
            var cn = limits[0];
            cs[cn] = true;
        } else if (limits.length == 2) {
            var lower = parseInt(limits[0]);
            var upper = parseInt(limits[1]);
            for (var cn = lower; cn <= upper; cn++) {
                cs[cn] = true;
            }
        } else {
            // TODO exception
        }
    }
    for (var i = 0; i <= 99; i++) {
        if (cs[i]) {
            channels.push(i);
        }
    }
    return channels;
}

function uctBtnExport(device, online, progress, context) {
    Log.info("OpenKNX ConfigTransfer: Handle Channel Export ...")
    var module = uctModuleOrder[device.getParameterByName(context.p_moduleSelection).value];
    var moduleChannelCount = uctChannelParams[module].channels;

    var channelMode = device.getParameterByName(context.p_channelMode).value;
    var channels = [0];
    if (moduleChannelCount > 0) {
        channels = [device.getParameterByName(context.p_channelSource).value];
        if (channelMode == 1) {
            channels = uctParseRangesString(device.getParameterByName(context.p_channelSourcesString).value);
        }
    }
    if (channels.length == 0) {
        throw new Error("Kein Kanal definiert!");
    }
    if (/* channels.length > 0 */ channels[channels.length - 1] > moduleChannelCount) {
        throw new Error("Kanal außerhalb von Modul-Bereich!");
    }
    if (channels.length > 1) {
        Log.info("OpenKNX ConfigTransfer: Multi-Channel " + channels.join(","));
    }

    var includeSelection = device.getParameterByName(context.p_exportParamSelectionSelection).value;
    var includeHidden = (includeSelection == 1);
    var includeDefault = (includeSelection == 2);

    var exportFormatSelection = device.getParameterByName(context.p_exportFormatSelection).value;
    var exportFormat = (exportFormatSelection==3) ? "" : "name";
    // multi-channel export is restricted to single line
    var multiLine = (exportFormatSelection == 1) && (channelMode == 0);

    // TODO add p_messageOutput again?

    var param_exportOutput = device.getParameterByName(context.p_exportOutput);
    var channelExportResult = [];
    for (var i = 0; i < channels.length; i++) {
        var channelNumber = channels[i];
        Log.info("OpenKNX ConfigTransfer: Export Channel " + channelNumber);
        channelExportResult.push(uctExportModuleChannelToString(device, module, channelNumber, exportFormat, multiLine, includeHidden, includeDefault));
        Log.info("OpenKNX ConfigTransfer: Export Channel " + channelNumber + " [DONE]");
    }
    param_exportOutput.value = channelExportResult.join("\n");
    Log.info("OpenKNX ConfigTransfer: Handle Channel Export [DONE]")
}

function uctBtnImport(device, online, progress, context) {
    Log.info("OpenKNX ConfigTransfer: Handle Channel Import ...")
    var module = null; // auto-detection; module is part of export-string!
    var channelTarget = device.getParameterByName(context.p_channelTarget).value;
    var importLine = device.getParameterByName(context.p_importLine).value;
    var importCheck = device.getParameterByName(context.p_importCheck).value;
    
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = uctImportModuleChannelFromString(device, module, channelTarget, importLine, importCheck);
    Log.info("OpenKNX ConfigTransfer: Handle Channel Import [DONE]")
}

function uctBtnCopy(device, online, progress, context) {
    Log.info("OpenKNX ConfigTransfer: Handle Channel Copy ...")
    var module = uctModuleOrder[device.getParameterByName(context.p_moduleSelection).value];
    var mode = device.getParameterByName(context.p_copyMode).value;
    var result = [];
    if (mode == 0) {
        var sourceChannel = device.getParameterByName(context.p_channelSource).value;
        var targetChannels = uctParseRangesString(device.getParameterByName(context.p_channelTargetString).value);
        Log.info("OpenKNX ConfigTransfer: Copy single channel " + sourceChannel + " to " + targetChannels.join(","));

        // precheck channels:
        // uctGetModuleParamsDef(module, targetChannel[targetChannel.length - 1]);
        if (targetChannels.length > 0) {
            // ignore result, but expect error for non-existing channel
            uctGetModuleParamsDef(module, targetChannels[targetChannels.length - 1]);
            if (!uctIsDisjoint([sourceChannel], targetChannels)) {
                throw new Error("Ziel-Kanal muss von Quell-Kanal abweichen!");
            }
        }

        for (var i = 0; i < targetChannels.length; i++) {
            result.push(uctCopyModuleChannel(device, module, sourceChannel, targetChannels[i]));
        }
    } else if (mode == 1) {
        var sourceChannels = uctParseRangesString(device.getParameterByName(context.p_channelSourceString).value);
        var targetChannel = device.getParameterByName(context.p_channelTarget).value;
        var offset = targetChannel - sourceChannels[0];
        Log.info("OpenKNX ConfigTransfer: Copy channel group " + sourceChannels.join(",") + " to channels starting at " + targetChannel + "; offset=" + offset);

        if (sourceChannels.length > 0) {
            // ignore result, but expect error for non-existing channel
            uctGetModuleParamsDef(module, sourceChannels[sourceChannels.length - 1]);
        }

        var targetChannels = [];
        for (var i = 0; i < sourceChannels.length; i++) {
            targetChannels.push(sourceChannels[i] + offset);
        }
        if (targetChannels.length > 0) {
            // ignore result, but expect error for non-existing channel
            uctGetModuleParamsDef(module, targetChannels[targetChannels.length - 1]);
        }

        // TODO check range before copy!
        if (offset < 0) {
            for (var i = 0; i < sourceChannels.length; i++) {
                result.push(uctCopyModuleChannel(device, module, sourceChannels[i], sourceChannels[i] + offset));
            }
        } else if (offset > 0) {
            for (var i = sourceChannels.length - 1; i >= 0; i--) {
                result.push(uctCopyModuleChannel(device, module, sourceChannels[i], sourceChannels[i] + offset));
            }
        } else /* (offset == 0) */ {
            // should never happen
        }

        // hide for disjoint only!
        device.getParameterByName(context.p_showButton).value = uctIsDisjoint(sourceChannels, targetChannels) ? 1 : 0;
    }
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = result.join("\n");
    Log.info("OpenKNX ConfigTransfer: Handle Channel Copy [DONE]")
}

function uctBtnReset(device, online, progress, context) {
    Log.info("OpenKNX ConfigTransfer: Handle Channel Reset ...")
    var module = uctModuleOrder[device.getParameterByName(context.p_moduleSelection).value];
    var moduleChannelCount = uctChannelParams[module].channels;

    var channelMode = device.getParameterByName(context.p_channelMode).value;
    var channels = [device.getParameterByName(context.p_channelTarget).value];
    if (channelMode == 1) {
        channels = uctParseRangesString(device.getParameterByName(context.p_channelTargetsString).value);
    }
    if (channels.length == 0) {
        throw new Error("Kein Kanal definiert!");
    }
    if (/* channels.length > 0 */ channels[channels.length - 1] > moduleChannelCount) {
        throw new Error("Kanal außerhalb von Modul-Bereich!");
    }
    if (channels.length > 1) {
        Log.info("OpenKNX ConfigTransfer: Multi-Channel " + channels.join(","));
    }

    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    var result = [];
    for (var i = 0; i < channels.length; i++) {
        var channelNumber = channels[i];
        Log.info("OpenKNX ConfigTransfer: Reset Channel " + channelNumber);
        result.push(uctResetModuleChannel(device, module, channels[i]));
        Log.info("OpenKNX ConfigTransfer: Reset Channel " + channelNumber + " [DONE]");
    }
    param_messageOutput.value = result.join("\n");
    Log.info("OpenKNX ConfigTransfer: Handle Channel Reset [DONE]")
}




function uctSerializeParamValue(paramValue) {
    /* TODO check inclusion of ` ` and common characters without encoding */
    return encodeURIComponent(paramValue);
}

function uctUnserializeParamValue(encodedParamValue) {
    return decodeURIComponent(encodedParamValue);
}

function uctCreateHeader(module, channel) {
    var version = [uctFormatVer];
    /* TODO make optional */
    /*
    version.push(uctGen);
    version.push(uctGenVer);
    */

    var pathApp = [uctHexNumberStr(uctAppId), uctHexNumberStr(uctAppVer)];
    /* TODO check inclusion of app name
    if (uctAppName) {
        pathApp.push(uctAppName);
    }
    */

    var moduleVersion = uctChannelParams[module].version;
    var pathModule = [
        module,
        ((moduleVersion != undefined) ? uctHexNumberStr(moduleVersion) : '-')
    ];

    var path =  [pathApp.join(":"), pathModule.join(":"), channel];

    var header = ["OpenKNX", version.join(":"), path.join("/")];
    return header.join(",");
}

function uctGetModuleParamsDef(module, channel) {
    var module_params = uctChannelParams[module];
    if (channel>0 && (!module_params.channels || (channel > module_params.channels))) {
        throw new Error("Kanal " + channel + " NICHT verfügbar im Modul " + module + "!");
    }
    return module_params[channel==0 ? "share" : "templ"];
}

function uctGetDeviceParameter(device, paramFullName, paramRefIdSuffix) {
    var paramObj = device.getParameterByName(paramFullName);
    var paramObjRefId = paramObj.parameterRefId;
    if (paramObjRefId.length>2 && paramObjRefId.slice(-2)!=paramRefIdSuffix) {
        paramObj = device.getParameterById(paramObjRefId.slice(0,-2) + (paramRefIdSuffix<10 ? "0":"") + paramRefIdSuffix);
    }
    return paramObj;
}

/**
 * Transform configuration of one channel to single-line string representation.
 * @param {object} device - the device object provided by ETS
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string} keyFormat - ''=defindex,'name'
 * @param {boolean} includeHidden - export inactive/invisible parameters
 * @param {boolean} includeDefault - export parameters with default-value
 * @returns {string[]} - string representations of channel-configuration, different from default value each of format "{$index}={$value}"
 */
function uctExportModuleChannelToStrings(device, module, channel, keyFormat, exportHidden, exportDefault) {
    var params = uctGetModuleParamsDef(module, channel);

    var result = [];
    var errors = [];
    for (var i = 0; i < params.names.length; i++) {
        
        /* compact or human readable output */
        var paramKey = (keyFormat=="name") ? params.names[i] : i;

        try { 

            /* TODO extract to function! */
            var paramNameDef = params.names[i].split(":");
            var paramFullName = module + "_" + paramNameDef[0].replace('~', channel);
            var paramObj = uctGetDeviceParameter(device, paramFullName, (paramNameDef.length>1) ? parseInt(paramNameDef[1]) : 1);

            if (exportHidden || paramObj.isActive) {
                var paramValue = paramObj.value;
                if (exportDefault || paramValue != params.defaults[i]) {
                    result.push(paramKey + "=" +  uctSerializeParamValue(paramValue));
                }
            }
        } catch (e) {
            var errMsg = "[ERR@"+paramKey + "]=" + e + ";" + e.message;
            Log.error(errMsg);
            errors.push(errMsg);
        }
    }
    if (errors.length > 0) {
        throw new Error(errors.length + " FEHLER beim Export! Details siehe ETS-Log; erster Fehler:" + errors[0]);
    }
    return result;
}

/**
 * Transform configuration of one channel to single-line string representation.
 * @param {object} device - the device object provided by ETS
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string} keyFormat - ''=defindex,'name'
 * @param {boolean} multiLine - defines the separator between header and param-values and end ('\n' for multiline, '§' else)
 * @param {boolean} includeHidden - export inactive/invisible parameters
 * @param {boolean} includeDefault - export parameters with default-value
 * @returns {string} - a string representation of channel-configuration, different from default value "{$index}={$value}§..§{$index}={$value}"
 */
function uctExportModuleChannelToString(device, module, channel, keyFormat, multiLine, includeHidden, includeDefault) {
    var lines = uctExportModuleChannelToStrings(device, module, channel, keyFormat, includeHidden, includeDefault);
    lines.push(";OpenKNX");
    var separator = multiLine ? '\n' : '§';
    return uctCreateHeader(module, channel) + separator + lines.join(separator);
}


function uctHexNumberStr(x) {
    return "0x"+x.toString(16).toUpperCase();
}

function uctParseHeader(headerStr) {
    var header = {
        "prefix": undefined,
        "format": undefined,
        "generator": {
            "name": undefined,
            "ver": undefined
        },
        "app": {
            "id": undefined,
            "idStr": undefined,
            "ver": undefined,
            "verStr": undefined,
            "name": undefined
        },
        "modul": {
            "key": undefined,
            "ver": undefined
        },
        "channel": undefined
    };

    var headerParts = headerStr.split(",");

    /* 1. check prefix */
    if (headerParts[0] != "OpenKNX") {
        throw new Error('Format-Prefix ungültig! "OpenKNX" erwartet, aber "' + headerParts[0] + '" gefunden!');
    }
    header.prefix = headerParts[0];

    /* 2. check format version */
    if (headerParts.length < 2) {
        throw new Error('Format-Version NICHT definiert!');
    }
    var versionParts = headerParts[1].split(":");
    var uctFormatVerDev = "ck-dev0"; // legacy support for version id used in development and internal testing; never use in new transfer-strings; can be removed in later versions without notice!
    if (versionParts[0] != uctFormatVer && versionParts[0] != uctFormatVerDev) {
        throw new Error('Format-Version NICHT unterstützt! Version "'+uctFormatVer+'" erwartet, aber "' + versionParts[0] + '" gefunden!');
    }
    header.format = versionParts[0];

    /* ensure header completeness */
    if (headerParts.length < 3) {
        throw new Error('Kopf-Bereich unvollständig! Erwarte 3 Teile (getrennt durch ","), aber nur ' + headerParts.length + ' gefunden!');
    }

    /* TODO include generator, but can be ignored first */
    // versionParts.length>1 ? versionParts[1] : null;
    // versionParts.length>2 ? versionParts[2] : null;
    header.generator.name = null;
    header.generator.ver = null;

    var path = headerParts[2].split("/");
    if (path.length != 3) {
        throw new Error('Pfad-Angabe "'+headerParts[2]+'" ungültig! Erwarte 3 Teile (getrennt durch "/"), aber ' + path.length + ' gefunden!');
    }

    /* check app */
    var headerApp = path[0].split(":");
    /* TODO include app-check, but can be ignored first */
    header.app.idStr = headerApp[0];
    header.app.id = headerApp[0]=="*" ? null : parseInt(headerApp[0]);
    header.app.verStr = (headerApp.length>=2) ? headerApp[1] : null;
    /* TODO support different versions */
    header.app.ver = (headerApp.length>=2 && headerApp[1]!="*") ? parseInt(headerApp[1]) : null;
    header.app.name = (headerApp.length>=3) ? headerApp[2] : null;

    /* check module */
    var headerModule = path[1].split(":");
    if (headerModule.length > 2) {
        /* TODO check need of handling */
    }
    header.modul.key = headerModule[0];
    header.modul.ver = (headerModule.length>=2) ? headerModule[1] : null;

    /* check channel */
    var headerChannel = path[2];
    if (headerChannel!="*" && (headerChannel=="" || isNaN(headerChannel) || headerChannel <0 || headerChannel >99)) {
        throw new Error('Ungültige Kanal-Definition! Erlaubte Werte 0 bis 99 oder *, aber "' + headerChannel + '" gefunden!');
    }
    header.channel = headerChannel;

    return header;
}

function uctFindIndexByParamName(params, paramKey, paramRefSuffix) {
    var paramName = paramKey;

    // TODO FIXME: replace with a implementation of better runtime!
    if (paramRefSuffix==1) {
        for (var i = 0; i < params.names.length; i++) {
            if (params.names[i] == paramName) {
                return i;
            }
        }
    }
    paramName = paramName + ':' + paramRefSuffix;
    // TODO FIXME remove redundancy!
    for (var i = 0; i < params.names.length; i++) {
        if (params.names[i] == paramName) {
            return i;
        }
    }
    return -1;
}

/**
 * Restore a channel configuration from a single-line string representation.
 * @param {object} device - the device object provided by ETS
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string} exportStr - a previously exported configuration in the format "{$index}={$value}§..§{$index}={$value}"
 */
function uctImportModuleChannelFromString(device, module, channel, exportStr, importCheck) {
    Log.info("OpenKNX ConfigTransfer: ImportModuleChannelFromString ...")

    var allowMissing = (importCheck == 0);

    var checkModuleVersion = (importCheck >= 1);
    var checkAppId =  (importCheck >= 7);
    var checkAppVersion = (importCheck >= 7);

    var importLines = exportStr.split("§");

    var header = uctParseHeader(importLines[0]);

    /* check for completeness */
    var importEnd = importLines[importLines.length-1];
    if (importEnd != ";OpenKNX") {
        throw new Error('Unvollständiger Transfer-String: Fehlender End-Marker ";OpenKNX"!');
    }

    /* check module */
    if (module != null && header.modul.key != module) {
        throw new Error('Modul "'+module+'" erwartet, aber "'+header.modul.key+'" gefunden!');
    }
    if (!uctChannelParams[header.modul.key]) {
        throw new Error('Modul "'+header.modul.key+'" ist NICHT Teil dieser ETS-Applikation!');
    }
    module = header.modul.key;

    var isDifferentAppId = (header.app.id != uctAppId);
    var isDifferentAppVer = (header.app.ver != uctAppVer);

    // check module version
    if (checkModuleVersion) {
        var headerModVerDash = (header.modul.ver=='-');
        var paramModVerUndef = (uctChannelParams[module].version==undefined);
        if (headerModVerDash || paramModVerUndef) {
            // => at least one version is missing
            if (paramModVerUndef != headerModVerDash) {
                // => not both at the same time
                // TODO show versions in same format, to prevent mixed decimal/hex representation
                throw new Error('Einseitig unspezifische Modul-Version: '+uctChannelParams[module].version+' erwartet, aber ' +header.modul.ver+' gefunden!');
            }
            // => both at the same time
            if (!checkAppVersion && (isDifferentAppId || isDifferentAppVer)) {
                throw new Error('Für Modul-Version "-" ist Gleichheit nur bei identischer Applikation und Version möglich!');
            }
    
        } else if (header.modul.ver != uctChannelParams[module].version) {
            // TODO show versions in same format, to prevent mixed decimal/hex representation
            throw new Error('Modul-Version '+uctChannelParams[module].version+' erwartet, aber ' +header.modul.ver+' gefunden!');
        }
    }

    // TODO implement handling of module version '*'

    // check app
    // '*' will not be accepted when app should be the same
    if (checkAppId) {
        if (isDifferentAppId) {
            throw new Error('Applikation '+uctAppId+' erwartet, aber '+header.app.id+' gefunden!');
        }
        if (checkAppVersion && isDifferentAppVer) {
            throw new Error('Applikations-Version '+uctAppVer+' erwartet, aber '+header.app.ver+' gefunden!');
        }
    }


    /* allow channel auto-selection from export-string */
    if (channel == 100) {
        if (isNaN(header.channel)) {
            throw new Error('Keine explizite Kanal-Definition im Transfer-String!');
        }
        channel = header.channel;
    }
    /* channel 0 can not be imported into any other */
    if (header.channel == 0 && channel != 0) {
        throw new Error('Basiseinstellungen können nicht in einen Kanal importiert werden!');
    }
    if (header.channel != 0 && channel == 0) {
        throw new Error('Kanaleinstellungen können nicht in Basiseinstellungen importiert werden!');
    }

    var params = uctGetModuleParamsDef(module, channel);
    if (!params) {
        throw new Error('Keine Parameter definiert für Modul "'+module+'" und Kanal "'+channel+'"!');
    }

    Log.info("OpenKNX ConfigTransfer: ImportModuleChannelFromString - Prepare Param Values ...")
    var importContent = importLines.slice(1, -1);
    var merge = (importContent.length > 0 && importContent[0]=="!merge");
    if (merge) {
        importContent = importContent.slice(1);
    }
    var result = {
        'lines':[],
        'messages': 0,
        'warnings': 0,
        'errors': 0
    };
    var newValues = uctPrepareParamValues(params, importContent, result, merge, allowMissing);

    /* write new values */
    Log.info("OpenKNX ConfigTransfer: ImportModuleChannelFromString - Write Params ...")
    var writeClean = uctWriteParams(device, module, channel, params, newValues, result);
    if (!writeClean) {
        Log.error("OpenKNX ConfigTransfer: ImportModuleChannelFromString - Write Params produced Errors!")
    }
    /* TODO check need of validation, or repeated writing to compensate values updated by ETS, e.g. by calc */

    Log.info("OpenKNX ConfigTransfer: ImportModuleChannelFromString [DONE]")
    var msg = module + "/" + channel + " Import ";
    if (result.errors) {
        msg = msg + "[ >>> FEHLER! <<< ]\n";
    } else if (result.warnings) {
        msg = msg + "[ >>> Warnungen beachten! <<< ]\n";
    } else {
        msg = msg + "[OK]";
    }
    if (result.messages) {
        msg = msg + '\nTransfer-String enthält Hinweise:\n';
    }
    if (result.lines.length) {
        msg = msg + '\n' + result.lines.join('\n');
    }
    return msg;
}

/**
 * Define new values for all paramters of a module channel
 * @param {object} params - module-channel's parameter definition
 * @param {array} importContent - the entries from ConfigTransfer-string; typical case is the format 'key[:ref]=value', other possibilities are '#comment', '>msg', '!cmd'
 * @param {array} result - (output) collection of ouput-messages
 * @param {boolean} merge - `false` = overwrite and use default for all missing params, `true` = keep values of all missing params
 * @param {boolean} allowMissing - defines behaviour when unkown paramter is found: `false` = throw Error, `true` = add warning-message to result
 * @returns {array} - new param values, or `null` to keep current, by index of param-definition
 */
function uctPrepareParamValues(params, importContent, result, merge, allowMissing) {
    var newValues = [];
    if (merge) {
        // use empty values - to ignore in writing
        for (var i = 0; i < params.defaults.length; i++) {
            newValues[i] = null;
        }
    } else {
        // use defaults for values not defined in import
        for (var i = 0; i < params.defaults.length; i++) {
            newValues[i] = params.defaults[i];
        }
    }

    var prefix = '';

    /* use values from import */
    for (var i = 0; i < importContent.length; i++) {
        var entry = importContent[i];
        var start = entry.slice(0, 1);
        var paramValuePair = entry.split("=");
        if (start=="#") {
            // ignore comments
        } else if (start==">") {
            // output-message for user
            result.lines.push(entry);
            result.messages++;
        } else if (start=="!") {
            throw new Error('Spezial-Eintrag "'+entry+'" hier nicht unterstützt in dieser Version von ConfigTransfer!');
        } else if (start=="^") {
            // set prefix
            prefix = entry.slice(1);
        } else if (paramValuePair.length >= 2) {
            var paramPart = paramValuePair[0].split(":");
            var paramKey = prefix + paramPart[0];
            /* TODO check format */
            var paramRefSuffix = paramPart.length>1 ? parseInt(paramPart[1]) : 1;

            var paramIndex = -1;
            if (isNaN(paramKey)) {
                // param is given by name
                paramIndex = uctFindIndexByParamName(params, paramKey, paramRefSuffix);
            } else if (paramKey < newValues.length) {
                // valid index
                // TODO FIXME: Ensure same version!
                paramIndex = paramKey;
            } else {
                // TODO error-handling
            }

            if (paramIndex >=0) {
                var paramValue = uctUnserializeParamValue(paramValuePair.slice(1).join("="));
                newValues[paramIndex] = paramValue;
            } else if (allowMissing) {
                // TODO handling of invalid parameters!
                result.lines.push('[WARN] Unbekannter Parameter: '+ paramKey + ' ("'+entry+'")');
                result.warnings++;
            } else {
                // TODO handling of invalid parameters!
                throw new Error('Unbekannter Parameter: '+ paramKey + ' ("'+entry+'")');
            }
        } else {
            // TODO error-handling; this is not a param=value pair
            throw new Error('Ungültiger Eintrag: "'+entry+'"');
        }
    }

    return newValues;
}

function uctWriteParams(device, module, channel, params, newValues, result) {
    var clean = true;
    for (var i = 0; i < params.names.length; i++) {
        var paramNameDef = params.names[i].split(":");
        var paramName = paramNameDef[0];
        var paramRefIdSuffix = (paramNameDef.length>1) ? parseInt(paramNameDef[1]) : 1;

        var paramValue = newValues[i];
        try {
            /* TODO set paramValue to channel-specific value */
            if (paramValue !=null) {
                var paramFullName = module + "_" + paramName.replace('~', channel);
                var param = uctGetDeviceParameter(device, paramFullName, paramRefIdSuffix);
                if (typeof param.value == "number") {
                    // At least in German Localisation with ',' as decimal separator: 
                    // using string with '.' as decimal separator would remove decimal separtor a all
                    // parse string to number to prevent this problem
                    param.value = parseFloat(paramValue);
                } else {
                    param.value = paramValue;
                }
            }

        } catch (e) {
            var paramFullNameTempl = module + "_" + paramName;
            Log.error("Failed writing "+paramFullNameTempl+" in channel "+channel+": "+e)
            result.lines.push("[ERR@"+i + ";" + paramFullNameTempl + "=" + paramValue + "]=" + e + ";" + e.message);
            result.errors++;
            clean = false;
        }
    }
    return clean;
}

/**
 * Copy the configuration from one channel to an other.
 * @param {object} device - the device object provided by ETS
 * @param {string} module
 * @param {number} channelSource 
 * @param {number} channelTarget 
 */
function uctCopyModuleChannel(device, module, channelSource, channelTarget) {
    if (channelTarget == channelSource) {
        throw new Error('Quell- und Ziel-Kanal dürfen NICHT identisch sein!');
    }
    /* TODO copy without serialize/deserialize */
    var exportStr = uctExportModuleChannelToString(device, module, channelSource, "", false, true);
    uctImportModuleChannelFromString(device, module, channelTarget, exportStr, 7);
    return module + "/" + channelSource + " -> " + module + "/" + channelTarget + " [OK]";
}

/**
 * Set channel configuration to default values.
 * LIMITATION: Default values are independent of assignments.
 * @param {object} device - the device object provided by ETS
 * @param {string} module 
 * @param {number} channel 
 */
function uctResetModuleChannel(device, module, channel) {
    uctImportModuleChannelFromString(device, module, channel, uctCreateHeader(module, channel) + '§' + ";OpenKNX", 7);
    return module + "/" + channel+" Reset [OK]";
}

function uctParamResetResult(input, output, context) {
    // reset `result` parameter
    output.result = '';
}

function uctParamResetSelection(input, output, context) {
    Log.info("OpenKNX ConfigTransfer: uctParamResetSelection")
    // reset `selection` parameter
    output.selection = 255;
}

function uctParamResetNothing(input, output, context) {
    // do nothing
} 

function uctParamModulSelectionCheck(input, output, context) {
    Log.info("OpenKNX ConfigTransfer: Param Selection check ...")

    var channelCount = 0;
    var channelError = false;
    var overview = "";

    if (input.modul < uctModuleOrder.length) {
        // get module prefix and module channel count
        var module = uctModuleOrder[input.modul];
        channelCount = uctChannelParams[module].channels;
        channelCount = (channelCount != undefined) ? channelCount : 0;
        Log.info("OpenKNX UCT Check: module=" + module + " / channelCount=" + channelCount);

        var channels = (input.channelSelectionMode == 0) ? [input.channelSource] : uctParseRangesString(input.channelSourcesString);
        channelError = (channels.length > 0) && channels[channels.length - 1] > channelCount;
        Log.info("OpenKNX UCT Check: channels=" + channels.join(",") + " / channelError=" + channelError);
    } else {
        Log.info("OpenKNX UCT Check: No Module")
    }

    output.modulChannelCount = channelCount;
    output.channelError = channelError ? 1 : 0;
    output.result = overview;
}

function uctParamCopyCheck(input, output, context) {
    Log.info("OpenKNX ConfigTransfer: Param Copy check ...")

    var channelCount = 0;    
    var sourceError = false;
    var targetError = false;
    var sameError = false;
    var error = true;
    var overview = "";

    if (input.CopyModul < uctModuleOrder.length) {
        // get module prefix and module channel count
        var module = uctModuleOrder[input.CopyModul];
        channelCount = uctChannelParams[module].channels;
        Log.info("OpenKNX UCT Copy Check: module=" + module + " / channelCount=" + channelCount);

        // check parameter depending on copy mode
        if (input.CopyMode == 0) {
            var sourceChannel = input.CopySource;
            sourceError = (sourceChannel > channelCount);
            var targetChannels = uctParseRangesString(input.CopyTargetString);
            var targetChCount = targetChannels.length;
            targetError = (targetChCount > 0 && targetChannels[targetChCount - 1] > channelCount);

            Log.info("OpenKNX UCT Copy Check: Single channel source " + sourceChannel);
            sameError = !uctIsDisjoint([sourceChannel], targetChannels);
            error = sourceError || targetError || sameError;
            overview = "VORSCHAU\n" + targetChCount + "-fache Kopie von Einzelkanal:\n  " + sourceChannel + " -> " + targetChannels.join(",");
        } else if (input.CopyMode == 1) {
            var sourceChannels = uctParseRangesString(input.CopySourceString);
            var sourceChCount = sourceChannels.length;
            sourceError = (sourceChCount > 0 && sourceChannels[sourceChCount - 1] > channelCount);

            Log.info("OpenKNX UCT Copy Check: Multi channel source " + sourceChannels.join(","));
            var targetChannelsList = [];
            var offset = input.CopyTarget - sourceChannels[0];
            var src = {};
            for (var i = 0; i < sourceChCount; i++) {
                src[sourceChannels[i]] = true;
                targetChannelsList.push(sourceChannels[i] + offset);
                Log.info("OpenKNX UCT Copy Check: " + sourceChannels[i] + " -> " + (sourceChannels[i] + offset));
            }
            targetError = (targetChannelsList[sourceChCount - 1] > channelCount);

            var ovCh = [];
            var hasOverlaps = false;
            for (var i = 0; i < sourceChCount; i++) {
                var overlaps = src[targetChannelsList[i]];
                ovCh.push("  " + sourceChannels[i] + " -> " + "\t" + targetChannelsList[i] + (overlaps ? " *" : (targetChannelsList[i] > channelCount ? " !" : "")));
                hasOverlaps = hasOverlaps || overlaps;
            }
            sameError = hasOverlaps;

            error = sourceError || targetError;
            overview = "VORSCHAU\nKopie von Kanalgruppe mit " + sourceChCount + " Kanälen:\n" + ovCh.join("\n") + (hasOverlaps ? "\n* Überlappung" : "") + (targetError ? "\n! Nicht existierender Kanal" : "");
        }
    } else {
        Log.info("OpenKNX UCT Copy Check: No Module")
    }

    output.CopyModulChannelCount = channelCount;
    output.CopySourceError = sourceError ? 1 : 0;
    output.CopyTargetError = targetError ? 1 : 0;
    output.CopySameError = sameError ? 1 : 0;
    output.CopyError = error ? 1 : 0;
    output.CopyButtonShow = 1; // show ony chaning any input
    output.result = overview;
}

// -- OFM-ConfigTransfer //
