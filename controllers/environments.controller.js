var global_config = require('../config');
const store = require('./../stores/'+global_config["database"].type+'/environments.store');
const model_store = require('./../stores/'+global_config["database"].type+'/models.store');
const response = require('../utilities/helpers/response-builder');
const toolchainstore = require('./../stores/'+global_config["database"].type+'/toolchain.store');

let controller = {

    getVersions: function(req, res){
        store.getVersions({})
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    changeStagingVersion: function(req, res){ 
        toolchainstore.request_toolchain_execution(req, res, "staging",req.body.pipeline_version);
        model_store.updateModel(req.body.model_id, {environment: "staging"});
    }

};

module.exports = controller;
