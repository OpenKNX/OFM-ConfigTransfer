
// TODO update format to v1 when stable
var uctAidParts = "%AID%".split("-");
var uctFormatVer = "cv0";
var uctGenVer = "0.1.0";
var uctGen = "uct";
var uctAppId = "0xHHHH";
var uctAppVer = "6.15";
var uctAppName = "StateEngine";


// context { module: ..., channelSource: ..., channelTarget: ..., exportOutput: ..., exportFormat: , importLine:.. , messageOutput: ...}

var exportFormats = ["full","full","reduced",""];

function btnChannelExport(device, online, progress, context) {
    var module = module_order[device.getParameterByName(context.p_moduleSelection).value];
    var channelSource = device.getParameterByName(context.p_channelSource).value;
    var exportFormatSelection = device.getParameterByName(context.p_exportFormatSelection).value;
    var exportFormat = exportFormats[exportFormatSelection];
    var param_exportOutput = device.getParameterByName(context.p_exportOutput);
    // TODO add p_messageOutput
    var separator = (exportFormatSelection==1) ? "\n" : "§";
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

// function importModuleChannelFromString(device, module, channel, exportStr) {
// function copyModuleChannel(device, module, channelSource, channelTarget) {
// function resetModuleChannel(device, module, channel) {



function serializeParamValue(paramValue) {
    /* TODO check inclusion of ` ` and common characters without encoding */
    return encodeURIComponent(paramValue);
}

function unserializeParamValue(encodedParamValue) {
    return decodeURIComponent(encodedParamValue);
}

function serializeHeader(module, channel) {
    // OpenKNX,v1,0.1.0,0xAFA7:110:StateEngine,LOG:3.8.0,1

    var moduleKey = module;
    var moduleVer = "x.y.z";
    var header = [
        "OpenKNX", 
        uctFormatVer,
        uctGen + ":" + uctGenVer,
        uctAppId + ":" + uctAppVer + ":" + uctAppName,
        moduleKey + ":" + moduleVer,
        channel
    ];
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
            result.push("[ERR@"+paramKey + "]=" + e + ";" + e.message); 
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
    return serializeHeader(module, channel) + separator + lines.join(separator) + separator + ";OpenKNX";
}

/**
 * Restore a channel configuration from a single-line string representation.
 * @param {object} device - the device object provided by ETS
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string} exportStr - a previously exported configuration in the format "{$index}={$value}§..§{$index}={$value}"
 */
function importModuleChannelFromString(device, module, channel, exportStr) {
    var params = getModuleParamsDef(module, channel);
    
    var result = [];

    var importLines = exportStr.split("§");
    var importHeader = importLines[0].split(",");
    var importEnd = importLines[importLines.length-1];
    if (importHeader[0] != "OpenKNX") {
        result.push("[ERR@HeaderIntro]=" + importHeader[0]);
    } else if (importHeader[1] != "v1") {
        result.push("[ERR@HeaderVersion]=" + importHeader[1]);
    } else if (!channel_params[importHeader[2]] || (importHeader[2] != module && module != null)) {
        result.push("[ERR@HeaderModule]=" + importHeader[2]);
    /* TODO module version! */
    /* TODO check channel? */
    } else if (importEnd != ";OpenKNX") {
        result.push("[ERR@ImportEnd]=" + importEnd);
    } else {
        /* use defaults for values not defined in import*/
        var newValues = params.defaults;

        /* use values from import */
        for (var i = 0; i < importLines.length; i++) {
            var line = importLines[i].split("=");
            if (line.length >= 2) {
                var paramIndex = line[0];
                var paramValue = unserializeParamValue(line.slice(1).join("="));
    
                /* var paramName = module + "_" + params.names[paramIndex].replace('%C%', channel); */
                newValues[paramIndex] = paramValue;
            } else {
                // TODO ...
            }
        };

        /* write new values */
        for (var i = 0; i < params.names.length; i++) {
            var paramName = params.names[i];
            var paramFullName = module + "_" + paramName.replace('%C%', channel);

            /* TODO make configurable: i || paramName || params.names[i].replace('f%C%', "~") */
            var paramKey = i;
            var paramValue = newValues[i];

            try {
                var regex = /^\%K\d+\%$/;
                /* TODO set paramValue to channel-specific value */
                if (!regex.test(paramValue)) {
                    device.getParameterByName(paramFullName).value = paramValue;
                }

            } catch (e) {
                result.push("[ERR@"+paramKey + ";" + paramFullName + "=" + paramValue + "]=" + e + ";" + e.message);
            }
        }
        /* TODO check need of validation, or repeated writing to compensate values updated by ETS, e.g. by calc */
    }

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
    var exportStr = exportModuleChannelToString(device, module, channelSource);
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
