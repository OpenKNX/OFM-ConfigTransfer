// OFM-ConfigTransfer --
// SPDX-License-Identifier: AGPL-3.0-only

// TODO update format to v1 when stable
var uctFormatVer = "ck-dev0";
var uctGenVer = "0.1.0";
var uctGen = "uct";
var uctAppId = uctVersionInformation[0];
var uctAppVer = uctVersionInformation[1];
var uctAppName = null;


function uctBtnExport(device, online, progress, context) {
    Log.info("OpenKNX ConfigTransfer: Handle Channel Export ...")
    var module = uctModuleOrder[device.getParameterByName(context.p_moduleSelection).value];
    var channelSource = device.getParameterByName(context.p_channelSource).value;

    var includeInactive = device.getParameterByName(context.p_exportParamSelectionSelection).value;

    var exportFormatSelection = device.getParameterByName(context.p_exportFormatSelection).value;
    var exportFormat = (exportFormatSelection==3) ? "" : "name";
    var multiLine = (exportFormatSelection==1);

    // TODO add p_messageOutput again?

    var param_exportOutput = device.getParameterByName(context.p_exportOutput);
    param_exportOutput.value = uctExportModuleChannelToString(device, module, channelSource, exportFormat, multiLine, includeInactive);
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

function uctBtnImportDirect(device, online, progress, context) {
    Log.info("OpenKNX ConfigTransfer: Handle Channel Import Direct ...")
    var module = context.module;
    var channelTarget = context.channel;
    var importLine = device.getParameterByName(context.p_importLine).value;
    var importCheck = device.getParameterByName(context.p_importCheck).value;
    
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = uctImportModuleChannelFromString(device, module, channelTarget, importLine, importCheck);
    Log.info("OpenKNX ConfigTransfer: Handle Channel Import Direct [DONE]")
}

function uctBtnCopy(device, online, progress, context) {
    Log.info("OpenKNX ConfigTransfer: Handle Channel Copy ...")
    var module = uctModuleOrder[device.getParameterByName(context.p_moduleSelection).value];
    var channelSource = device.getParameterByName(context.p_channelSource).value;
    var channelTarget = device.getParameterByName(context.p_channelTarget).value;
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = uctCopyModuleChannel(device, module, channelSource, channelTarget);
    Log.info("OpenKNX ConfigTransfer: Handle Channel Copy [DONE]")
}

function uctBtnReset(device, online, progress, context) {
    Log.info("OpenKNX ConfigTransfer: Handle Channel Reset ...")
    var module = uctModuleOrder[device.getParameterByName(context.p_moduleSelection).value];
    var channelTarget = device.getParameterByName(context.p_channelTarget).value;
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = uctResetModuleChannel(device, module, channelTarget);
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
    if (uctAppName) {
        pathApp.push(uctAppName);
    }

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
        throw new Error("Channel " + channel + " NOT available in module " + module + "!");
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
 * @param {boolean} includeNonActive - export all values, not only the actives
 * @returns {string[]} - string representations of channel-configuration, different from default value each of format "{$index}={$value}"
 */
function uctExportModuleChannelToStrings(device, module, channel, keyFormat, includeNonActive) {
    var params = uctGetModuleParamsDef(module, channel);
    var exportAll = !!includeNonActive;

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

            if (exportAll || paramObj.isActive) {
                var paramValue = paramObj.value;
                if (paramValue != params.defaults[i]) {
                    /* non-default values only */
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
        throw new Error("ERRs:" + errors.length + " see ETS log /first:"+errors[0]);
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
 * @param {boolean} includeNonActive - export all values, not only the actives
 * @returns {string} - a string representation of channel-configuration, different from default value "{$index}={$value}§..§{$index}={$value}"
 */
function uctExportModuleChannelToString(device, module, channel, keyFormat, multiLine, includeNonActive) {
    var lines = uctExportModuleChannelToStrings(device, module, channel, keyFormat, includeNonActive);
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
        throw new Error('Format Prefix does NOT match! Expected "OpenKNX" but found "' + headerParts[0] + '"!');
    }
    header.prefix = headerParts[0];

    /* 2. check format version */
    if (headerParts.length < 2) {
        throw new Error("Format Version NOT defined !");
    }
    var versionParts = headerParts[1].split(":");
    if (versionParts[0] != uctFormatVer) {
        throw new Error('Format Version does NOT match! Expected "'+uctFormatVer+'" but found "' + versionParts[0] + '"!');
    }
    header.format = versionParts[0];

    /* ensure header completeness */
    if (headerParts.length < 3) {
        throw new Error("Header is incomplete! Expected 3 parts (separated by ',') but has only " + headerParts.length);
    }

    /* TODO include generator, but can be ignored first */
    // versionParts.length>1 ? versionParts[1] : null;
    // versionParts.length>2 ? versionParts[2] : null;
    header.generator.name = null;
    header.generator.ver = null;

    var path = headerParts[2].split("/");
    if (path.length != 3) {
        throw new Error("Path is expected to have 3 parts (separated by '/') but has only " + path.length);
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
    /* TODO validate format! */
    if (headerChannel!="*" && (headerChannel <0 || headerChannel >99)) {
        throw new Error("Invalid Channel-Definition! Allowed Formar 0|1-99|*, but found " + headerChannel);
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

    var checkModuleVersion = (importCheck >= 1);
    var checkAppId =  (importCheck >= 7);
    var checkAppVersion = (importCheck >= 7);

    var result = [];
    var importLines = exportStr.split("§");

    var header = uctParseHeader(importLines[0]);

    /* check for completeness */
    var importEnd = importLines[importLines.length-1];
    if (importEnd != ";OpenKNX") {
        throw new Error('Incomplete Import, MISSING End-Marker ";OpenKNX"!');
    }

    /* check module */
    if (module != null && header.modul.key != module) {
        throw new Error('Module "'+module+'" expected, but found "'+header.modul.key+'"');
    }
    if (!uctChannelParams[header.modul.key]) {
        throw new Error('Module "'+header.modul.key+'" NOT part of application!');
    }
    module = header.modul.key;

    /* check module version */
    if (checkModuleVersion) {
        if (!checkAppVersion) {
            if (uctChannelParams[module].version==undefined) {
                throw new Error('Can not ensure same version of unversioned module without app version check!');
            }
            if (header.modul.ver=='-') {
                throw new Error('Found module version "-", can not ensure same without app version check!');
            }
        }
        if (checkAppVersion && uctChannelParams[module].version==undefined && header.modul.ver=='-') {
            // ok, for same app version
        } else if (header.modul.ver != uctChannelParams[module].version) {
            // TODO show versions in same format, to prevent mixed decimal/hex representation
            throw new Error('Module version '+uctChannelParams[module].version+' expected, but found ' +header.modul.ver+'!');
        }
    }

    // TODO implement handling of module version '*'

    /* check app */
    // if (header.app.id != '*' && (header.app.id != uctAppId)) {
    if (checkAppId) {
        if ((header.app.id != uctAppId)) {
            throw new Error('Application '+uctAppId+' expected, but found '+header.app.id+'!');
        }
        /* TODO check version */
        if (checkAppVersion && header.app.ver != uctAppVer) {
            throw new Error('Application version '+uctAppVer+' expected, but found '+header.app.ver+'!');
        }
    }


    /* allow channel auto-selection from export-string */
    if (channel == 100) {
        if (isNaN(header.channel)) {
            throw new Error('No explicit channel defined in export-string!');
        }
        channel = header.channel;
    }


    var params = uctGetModuleParamsDef(module, channel);
    if (!params) {
        throw new Error('No Params defined for Module "'+module+'" and channel "'+channel+'"!');
    }

    Log.info("OpenKNX ConfigTransfer: ImportModuleChannelFromString - Prepare Param Values ...")
    var importContent = importLines.slice(1, -1);
    var newValues = uctPrepareParamValues(params, importContent, result);

    /* write new values */
    Log.info("OpenKNX ConfigTransfer: ImportModuleChannelFromString - Write Params ...")
    uctWriteParams(device, module, channel, params, newValues, result);
    /* TODO check need of validation, or repeated writing to compensate values updated by ETS, e.g. by calc */

    Log.info("OpenKNX ConfigTransfer: ImportModuleChannelFromString [DONE]")
    return result.length>0 ? result.join('\n') : "[Import "+module+":"+channel+" OK]";
}

function uctPrepareParamValues(params, importContent, result) {
    /* use defaults for values not defined in import*/
    // TODO FIXME: create a real copy!
    var newValues = params.defaults;

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
            result.push(entry);
        } else if (start=="!") {
            throw new Error('Special entries not supported in this Version of ConfigTransfer!');
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
            } else {
                // TODO handling of invalid parameters!
                throw new Error('Unknown Parameter: '+ paramKey + ' ("'+entry+'")');
            }
        } else {
            // TODO error-handling; this is not a param=value pair
            throw new Error('Invalid Entry: '+ entry);
        }
    }

    return newValues;
}

function uctWriteParams(device, module, channel, params, newValues, result) {
    for (var i = 0; i < params.names.length; i++) {
        var paramNameDef = params.names[i].split(":");
        var paramName = paramNameDef[0];
        var paramRefIdSuffix = (paramNameDef.length>1) ? parseInt(paramNameDef[1]) : 1;

        var paramFullNameTempl = module + "_" + paramName;
        var paramFullName      = module + "_" + paramName.replace('~', channel);

        var paramKey = i;
        var paramValue = newValues[i];

        try {
            /* TODO set paramValue to channel-specific value */
            if (paramValue !=null) {
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
            result.push("[ERR@"+paramKey + ";" + paramFullNameTempl + "=" + paramValue + "]=" + e + ";" + e.message);
        }
    }
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
        throw new Error('Source and target of copy must NOT be the same!');
    }
    /* TODO copy without serialize/deserialize */
    var exportStr = uctExportModuleChannelToString(device, module, channelSource, "", false, true);
    uctImportModuleChannelFromString(device, module, channelTarget, exportStr, 7);
    return "[Copied Channel "+channelSource+" of Module "+module+" to Channel "+channelTarget+": OK]";
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
    return "[Channel "+channel+" of Module "+module+" Reset: OK]";
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

// -- OFM-ConfigTransfer //
