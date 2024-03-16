

// context { module: ..., channelSource: ..., channelTarget: ..., exportOutput: ..., exportFormat: , importLine:.. , messageOutput: ...}

function btnChannelExport(device, online, progress, context) {
    var module = device.getParameterByName(context.p_module).value;
    var channelSource = device.getParameterByName(context.p_channelSource).value;
    var exportFormat = device.getParameterByName(context.p_exportFormat).value;
    var param_exportOutput = device.getParameterByName(context.p_exportOutput);
    param_exportOutput.value = exportModuleChannelToString(device, module, channelSource, exportFormat);
}

function btnChannelImport(device, online, progress, context) {
    var module = device.getParameterByName(context.p_module).value;
    var channelTarget = device.getParameterByName(context.p_channelTarget).value;
    var importLine = device.getParameterByName(context.p_importLine).value;
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = importModuleChannelFromString(device, module, channelTarget, importLine);
}

function btnChannelCopy(device, online, progress, context) {
    var module = device.getParameterByName(context.p_module).value;
    var channelSource = device.getParameterByName(context.p_channelSource).value;
    var channelTarget = device.getParameterByName(context.p_channelTarget).value;
    var param_messageOutput = device.getParameterByName(context.p_messageOutput);
    param_messageOutput.value = copyModuleChannel(device, module, channelSource, channelTarget);
}

function btnChannelReset(device, online, progress, context) {
    var module = device.getParameterByName(context.p_module).value;
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

function unserializeParamValue(encodeParamValue) {
    return decodeURIComponent(encodeParamValue);
}

function serializeHeader(module, channel) {
    return "OpenKNX,v1,"+module+",x.y.z,"+channel;
}


/**
 * Transform configuration of one channel to single-line string representation.
 * @param {object} device - the device object provided by ETS
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string?} keyFormat - '','name','full','reduced'
 * @returns {string} - a string representation of channel-configuration, different from default value "{$index}={$value}§..§{$index}={$value}"
 */
function exportModuleChannelToStrings(device, module, channel, keyFormat) {
    var params = channel_params[module]; /* TODO generalize */
    
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
                paramKey = paramName.replace('f%C%', "~");
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
 * @returns {string} - a string representation of channel-configuration, different from default value "{$index}={$value}§..§{$index}={$value}"
 */
function exportModuleChannelToString(device, module, channel, keyFormat) {
    var lines = exportModuleChannelToStrings(device, module, channel, keyFormat);
    return serializeHeader(module, channel) + "§" + lines.join("§");
}

/**
 * Restore a channel configuration from a single-line string representation.
 * @param {object} device - the device object provided by ETS
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string} exportStr - a previously exported configuration in the format "{$index}={$value}§..§{$index}={$value}"
 */
function importModuleChannelFromString(device, module, channel, exportStr) {
    var params = channel_params[module]; /* TODO generalize */
    
    var result = [];

    var importLines = exportStr.split("§");
    var importHeader = importLines[0].split(",");
    if (importHeader[0] != "OpenKNX") {
        result.push("[ERR@HeaderIntro]=" + importHeader[0]);
    } else if (importHeader[1] != "v1") {
        result.push("[ERR@HeaderVersion]=" + importHeader[1]);
    } else if (importHeader[2] != module) {
        result.push("[ERR@HeaderModule]=" + importHeader[2]);
    /* TODO module version! */
    /* TODO check channel? */
    } else {
        /* use defaults for values not defined in import*/
        var newValues = params.defaults;

        /* use values from import */
        for (var i = 0; i < importLines.length; i++) {
            var line = importLines[i].split("=");
            var paramIndex = line[0];
            var paramValue = unserializeParamValue(line.slice(1).join("="));

            /* var paramName = module + "_" + params.names[paramIndex].replace('%C%', channel); */
            newValues[paramIndex] = paramValue;
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
 * Copy the configuration from one channel to on other.
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
    importModuleChannelFromString(device, module, channel, serializeHeader(module, channel));
}
