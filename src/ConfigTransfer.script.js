// OFM-ConfigTransfer --
// SPDX-License-Identifier: AGPL-3.0-only

// TODO update format to v1 when stable
var uctFormatVer = "ck-dev0";
var uctGenVer = "0.1.0";
var uctGen = "uct";
var uctAppId = version_information[0];
var uctAppVer = version_information[1];
var uctAppName = null;


function btnChannelExport(device, online, progress, context) {
    var module = module_order[device.getParameterByName(context.p_moduleSelection).value];
    var channelSource = device.getParameterByName(context.p_channelSource).value;

    var exportFormatSelection = device.getParameterByName(context.p_exportFormatSelection).value;
    var exportFormat = (exportFormatSelection==3) ? "" : "reduced";
    var separator = (exportFormatSelection==1) ? "\n" : "§";

    // TODO add p_messageOutput again?

    var param_exportOutput = device.getParameterByName(context.p_exportOutput);
    param_exportOutput.value = "";
    param_exportOutput.value = exportModuleChannelToString(device, module, channelSource, exportFormat, separator);
}

function btnChannelImport(device, online, progress, context) {
    // TODO remove module -> is part of export-string!
    // var module = module_order[device.getParameterByName(context.p_moduleSelection).value];
    var module = null;
    // TODO support auto-detection
    var channelTarget = device.getParameterByName(context.p_channelTarget).value;
    var importLine = device.getParameterByName(context.p_importLine).value;
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = importModuleChannelFromString(device, module, channelTarget, importLine);
}

function btnChannelCopy(device, online, progress, context) {
    var module = module_order[device.getParameterByName(context.p_moduleSelection).value];
    var channelSource = device.getParameterByName(context.p_channelSource).value;
    var channelTarget = device.getParameterByName(context.p_channelTarget).value;
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = copyModuleChannel(device, module, channelSource, channelTarget);
}

function btnChannelReset(device, online, progress, context) {
    var module = module_order[device.getParameterByName(context.p_moduleSelection).value];
    var channelTarget = device.getParameterByName(context.p_channelTarget).value;
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = resetModuleChannel(device, module, channelTarget);
}




function serializeParamValue(paramValue) {
    /* TODO check inclusion of ` ` and common characters without encoding */
    return encodeURIComponent(paramValue);
}

function unserializeParamValue(encodedParamValue) {
    return decodeURIComponent(encodedParamValue);
}

function serializeHeader(module, channel) {
    // OpenKNX,v1:0.1.0,0xAFA7:110:StateEngine/LOG:3.8.0/1

    var version = [uctFormatVer];
    /* TODO make optional */
    /*
    version.push(uctGen);
    version.push(uctGenVer);
    */

    var pathApp = [
        "0x"+uctAppId.toString(16).toUpperCase(), 
        "0x"+uctAppVer.toString(16).toUpperCase()
    ];
    if (uctAppName) {
        pathApp.push(uctAppName);
    }

    var pathModule = [
        module,
        channel_params[module].version != undefined ? channel_params[module].version : '-'
    ];

    var path =  [pathApp.join(":"), pathModule.join(":"), channel];

    var header = ["OpenKNX", version.join(":"), path.join("/")];
    return header.join(",");
}

function getModuleParamsDef(module, channel) {
    return channel_params[module][channel==0 ? "share" : "templ"];
}

/**
 * Transform configuration of one channel to single-line string representation.
 * @param {object} device - the device object provided by ETS
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string?} keyFormat - '','name','full','reduced'
 * @returns {string[]} - string representations of channel-configuration, different from default value each of format "{$index}={$value}"
 */
function exportModuleChannelToStrings(device, module, channel, keyFormat) {
    var params = getModuleParamsDef(module, channel);
    
    var result = [];
    for (var i = 0; i < params.names.length; i++) {
        var paramName = params.names[i];
        var paramFullName = module + "_" + paramName.replace('%C%', channel);
        
        /* compact or human readable output */
        var paramKey = i;
        if (keyFormat) {
            if (keyFormat=="full") {
                paramKey = paramName;
            } else if (keyFormat=="reduced") {
                paramKey = paramName.replace('%C%', "~");
            }
        }

        try { 
            var paramValue = device.getParameterByName(paramFullName).value; 
            if (paramValue != params.defaults[i]) { 
                /* non-default values only */
                result.push(paramKey + "=" +  serializeParamValue(paramValue));
            }
        } catch (e) { 
            throw new Error("[ERR@"+paramKey + "]=" + e + ";" + e.message);
        }
    }
    return result;
}

/**
 * Transform configuration of one channel to single-line string representation.
 * @param {object} device - the device object provided by ETS
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string?} keyFormat - '','name','full','reduced'
 * @param {string} separator - the separator between header and param-values
 * @returns {string} - a string representation of channel-configuration, different from default value "{$index}={$value}§..§{$index}={$value}"
 */
function exportModuleChannelToString(device, module, channel, keyFormat, separator) {
    var lines = exportModuleChannelToStrings(device, module, channel, keyFormat);
    lines.push(";OpenKNX");
    return serializeHeader(module, channel) + separator + lines.join(separator);
}

function parseHeader(module, channel, headerStr) {
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
        throw new Error('Format Prefix does NOT match! "' + headerParts[0] + '" != "OpenKNX"');
    }
    header.prefix = headerParts[0];

    /* 2. check format version */
    if (headerParts.length < 2) {
        throw new Error("Format Version NOT defined !");
    }
    var versionParts = headerParts[1].split(":");
    if (versionParts[0] != uctFormatVer) {
        throw new Error('Format Version does NOT match! "' + versionParts[0] + '" != "'+uctFormatVer+'"');
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
        throw new Error("Path-Length is expected to have 3 parts (separated by '/') but has only " + path.length);
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
        throw new Error("Invalidi Channel-Definition! Allowed Formar 0|1-99|*, but found " + headerChannel);
    }
    header.channel = headerChannel;

    return header;
}

function findIndexByParamName(params, paramKey) {
    var paramName = paramKey.replace("~", '%C%');

    // TODO FIXME: replace with a implementation of better runtime!
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
function importModuleChannelFromString(device, module, channel, exportStr) {
    var result = [];
    var importLines = exportStr.split("§");

    /*
     OpenKNX,cv0:uct:0.1.0,0xHHHH:6.15:StateEngine/LOG:x.y.z/1
     [0]     [1] [2]       [3]                     [4]       [5]
     */
    var header = parseHeader(module, channel, importLines[0]);

    /* check for completeness */
    var importEnd = importLines[importLines.length-1];
    if (importEnd != ";OpenKNX") {
        throw new Error('Incomplete Import, NO Suffix ";OpenKNX"');
    }

    /* check app */
    if (header.app.id != '*' && header.app.id != uctAppId) {
        throw new Error('Exported from Application "'+header.app.id+'", different from current "'+uctAppId+'"');
    }
    /* TODO check version */

    /* check module */
    if (module != null && header.modul.key != module) {
        throw new Error('Module "'+module+'" expected, but found "'+header.modul.key+'"');
    }
    if (!channel_params[header.modul.key]) {
        throw new Error('Module "'+header.modul.key+'" NOT part of application!');
    }
    module = header.modul.key;

    /* TODO check version */
    /* TODO check channel */


    var params = getModuleParamsDef(module, channel);
    if (!params) {
        throw new Error('No Params defined for Module "'+module+'" and channel "'+channel+'"!');
    }
   
    /* use defaults for values not defined in import*/
    var newValues = params.defaults;

    /* use values from import */
    var importContent = importLines.slice(1, -1);
    for (var i = 0; i < importContent.length; i++) {
        var line = importContent[i].split("=");
        if (line.length >= 2) {
            var paramKey = line[0];
            var paramValue = unserializeParamValue(line.slice(1).join("="));
            var paramIndex = -1;

            if (isNaN(paramKey)) {
                // param is given by name
                paramIndex = findIndexByParamName(params, paramKey);
            } else if (paramKey < newValues.length) {
                // valid index
                paramIndex = paramKey;
            } else {
                // TODO error-handling
            }

            if (paramIndex >=0) {
                newValues[paramIndex] = paramValue;
            } else {
                // TODO handling of invalid parameters!
                throw new Error('Unknown Parameter: '+ paramIndex + ' (line "'+line+'")');
            }
        } else {
            // TODO error-handling; this is not a param=value pair
            throw new Error('Invalid Entry: '+ line);
        }
    }

    /* write new values */
    var regexExcludeValue = /^\%K\d+\%$/;
    for (var i = 0; i < params.names.length; i++) {
        var paramName = params.names[i];
        var paramFullNameTempl = module + "_" + paramName;
        var paramFullName      = module + "_" + paramName.replace('%C%', channel);

        /* TODO make configurable: i || paramName || params.names[i].replace('f%C%', "~") */
        var paramKey = i;
        var paramValue = newValues[i];

        try {
            /* TODO set paramValue to channel-specific value */
            if ((paramValue !=null) && !regexExcludeValue.test(paramValue)) {
                device.getParameterByName(paramFullName).value = paramValue;
            }

        } catch (e) {
            result.push("[ERR@"+paramKey + ";" + paramFullNameTempl + "=" + paramValue + "]=" + e + ";" + e.message);
        }
    }
    /* TODO check need of validation, or repeated writing to compensate values updated by ETS, e.g. by calc */    

    return result.length>0 ? result.join("§") : "[Import OK]";
}

/**
 * Copy the configuration from one channel to an other.
 * @param {object} device - the device object provided by ETS
 * @param {string} module
 * @param {number} channelSource 
 * @param {number} channelTarget 
 */
function copyModuleChannel(device, module, channelSource, channelTarget) {
    /* TODO copy without serialize/deserialize */
    var exportStr = exportModuleChannelToString(device, module, channelSource, "", "§");
    importModuleChannelFromString(device, module, channelTarget, exportStr);
}

/**
 * Set channel configuration to default values.
 * LIMITATION: Default values are independent of assignments.
 * @param {object} device - the device object provided by ETS
 * @param {string} module 
 * @param {number} channel 
 */
function resetModuleChannel(device, module, channel) {
    importModuleChannelFromString(device, module, channel, serializeHeader(module, channel) + '§' + ";OpenKNX");
}

// -- OFM-ConfigTransfer //