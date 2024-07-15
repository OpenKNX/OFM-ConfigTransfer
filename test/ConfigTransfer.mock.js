
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
        return this.parameters[name];
    },
    getParameterById: function (id) {
        return this.byId[id];
    },
    fillParameters: function (x, module, channel) {
        x.names.forEach((paramName, index) => {

            var name = module + "_" + paramName.replace('~', channel);

            if (!this.parameters[name]) {
                this.parameters[name] = {};
            }
            const refId = "REF_"+name+"9901";
            this.parameters[name].value = x.defaults[index];
            this.parameters[name].parameterRefId = refId;
            this.parameters[name].name = name;
            this.byId[refId] = this.parameters[name];
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

