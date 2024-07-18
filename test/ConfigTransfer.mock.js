
// mock implementation for accessing parameters only
const device = {
    parameters: {
        /* structure:
        "parameter_name": {
            "value": the_value,
            "parameterRefId": the_id
            "name": the_name
        }
        */
    },
    byId: {},
    getParameterByName: function (name) {
        return this.parameters[name.split(":")[0]];
    },
    getParameterById: function (id) {
        return this.byId[id];
    },
    fillParameters: function (x, module, channel) {
        x.names.forEach((paramNameWithOptionalRef, index) => {

            var paramNameSplit = paramNameWithOptionalRef.split(":");

            var paramName = paramNameSplit[0];
            var name = module + "_" + paramName.replace('~', channel);

            // var paramNameIndex = paramNameSplit.length>1 ? parseInt(paramNameSplit[1]) : 1;
            var paramNameIndex = paramNameSplit.length>1 ? paramNameSplit[1] : 1;

            const refId = "REF_"+name+"99" + ((paramNameIndex<10?"0":0) + "" + paramNameIndex);
            const p = {
                'value': x.defaults[index],
                'parameterRefId': refId,
                'name': name,
            };
            if (!this.parameters[name]) {
                // use first definition as result for name
                this.parameters[name] = p;
            }
            this.byId[refId] = p;
        });
    }
};

function initWithDefaults() {
    uctModuleOrder.forEach((m) => { 
        // console.log(m, uctChannelParams[m].channels); 
    
        var params = uctChannelParams[m];
    
        device.fillParameters(params.share, m, 0);
    
        for (let i = 1; i <= params.channels; i++) {
            device.fillParameters(params.templ, m, i);
        }
    
    });
}

initWithDefaults();

