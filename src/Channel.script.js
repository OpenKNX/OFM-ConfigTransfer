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
    return exportModuleChannelToStrings(module, channel, keyFormat).join("§");
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

    /* use defaults for values not defined in import*/
    var newValues = params.defaults;

    /* use values from import */
    var importLines = exportStr.split("§"); 
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

   return result.join("§");
}
