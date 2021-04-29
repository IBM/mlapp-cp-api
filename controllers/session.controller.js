const global_config = require('./../config')
const response = require('../utilities/helpers/response-builder');


let controller = {
    
    get: function(req, res){
        if(global_config["session"].type){
            let sessionHandler = require('./../utilities/handlers/'+global_config["session"].type+'-handler');
            sessionHandler.get(req.params.job_id)
                .then(response.successClbk(res))
                .catch(response.errorClbk(res));
        }
        else{
            return null;
        }
    },
}

module.exports = controller;