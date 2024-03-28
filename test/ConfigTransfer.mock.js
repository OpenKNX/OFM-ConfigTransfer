
// mock implementation for accessing parameters only
const device = {
    parameters: {
        /* structure:
        "parameter_name": {
            "value": the_value
        }
        */
    },
    getParameterByName: function (name) {
        return this.parameters[name];
    },
    fillParameters: function (x, module, channel) {
        x.names.forEach((paramName, index) => {

            var name = module + "_" + paramName.replace('%C%', channel);

            if (!this.parameters[name]) {
                this.parameters[name] = {};
            }
            this.parameters[name].value = x.defaults[index];
        });
    }
};

function initWithDefaults() {
    module_order.forEach((m) => { 
        console.log(m, channel_params[m].channels); 
    
        var params = channel_params[m];
    
        device.fillParameters(params.share, m, 0);
    
        for (let i = 1; i <= params.channels; i++) {
            device.fillParameters(params.templ, m, i);
        }
    
    });
}

initWithDefaults();

