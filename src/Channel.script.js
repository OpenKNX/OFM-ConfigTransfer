/* TODO FIXME: needs clean encoding/decoding to prevent issues from `§´,`\n´,`,´ */ 

/**
 * Transform configuration of one channel to single-line string representation.
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string?} keyFormat - '','name','full','reduced'
 * @returns {string} - a string representation of channel-configuration, different from default value "{$index}={$value}§..§{$index}={$value}"
 */
function exportModuleChannelToStrings(module, channel, keyFormat) {

    /* TODO generalize */
    var params = LOG_params;
    
    var result = [];
    for (var i = 0; i < params.names.length; i++) {
        var paramName = params.names[i];
        var paramFullName = module + "_" + paramName.replace('%C%', channel);
        
        /* TODO make configurable: i || paramName || params.names[i].replace('f%C%', "~") */
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
                result.push(paramKey + "=" + paramValue /*TODO FIXME*/);
            }
        } catch (e) { 
            result.push("[ERR@"+paramKey + "]=" + e + ";" + e.message); 
        }
    }
    return result;
}

/**
 * Transform configuration of one channel to single-line string representation.
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string?} keyFormat - '','name','full','reduced'
 * @returns {string} - a string representation of channel-configuration, different from default value "{$index}={$value}§..§{$index}={$value}"
 */
function exportModuleChannelToString(module, channel, keyFormat) {
    var lines = exportModuleChannelToStrings(module, channel, keyFormat);
    return "OpenKNX,v1,"+module+","+channel + "§" + lines.join("§");
}

/**
 * Restore a channel configuration from a single-line string representation.
 * @param {string} module - the module prefix e.g. 'LOG'
 * @param {number} channel - the channel number starting with 1; maximum range [1;99]
 * @param {string} exportStr - a previously exported configuration in the format "{$index}={$value}§..§{$index}={$value}"
 */
function importModuleChannelFromString(module, channel, exportStr) {

    /* TODO generalize */
    var params = LOG_params;
    
    var result = [];

    var importLines = exportStr.split("§");
    var importHeader = importLines[0].split(",");
    if (importHeader[0] != "OpenKNX") {
        result.push("[ERR@HeaderIntro]=" + importHeader[0]);
    } else if (importHeader[1] != "v1") {
        result.push("[ERR@HeaderVersion]=" + importHeader[1]);
    } else if (importHeader[2] != module) {
        result.push("[ERR@HeaderModule]=" + importHeader[2]);
    /* TODO check channel? */
    } else {
        /* use defaults for values not defined in import*/
        var newValues = params.defaults;

        /* use values from import */
        for (var i = 0; i < importLines.length; i++) {
            var line = importLines[i].split("=");
            var paramIndex = line[0];
            var paramValue = line.slice(1).join("=");

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
 * @param {string} module 
 * @param {number} channelSource 
 * @param {number} channelTarget 
 */
function copyModuleChannel(module, channelSource, channelTarget) {
    var exportStr = exportModuleChannelToString(module, channelSource);
    importModuleChannelFromString(module, channelTarget, exportStr);
}

/**
 * Set channel configuration to default values.
 * LIMITATION: Default values are independent of assignments.
 * @param {string} module 
 * @param {number} channel 
 */
function resetModuleChannel(module, channel) {
    importModuleChannelFromString(module, channel, "OpenKNX,v1,"+module+","+channel);
}
