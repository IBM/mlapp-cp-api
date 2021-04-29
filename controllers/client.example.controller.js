var global_config = require('../config');
const queue_controller = require('./queue.controller');
const history_store = require('./../stores/'+global_config["database"].type+'/models_history.store');
const client_store = require('./../stores/'+global_config["database"].type+'/client.store');
const environments_store = require('./../stores/'+global_config["database"].type+'/environments.store');
const models_store = require('./../stores/'+global_config["database"].type+'/models.store');
const response = require('../utilities/helpers/response-builder');

let controller = {
    send_message: async function(req, res){ 
        req.body.env = req.params.env || "default";

        // control all promises
        var promises = [];
        for(var i=0; i < req.body.pipelines_configs.length; i++){
            // fetch asset name and label from config
            var asset_name = req.body.pipelines_configs[i].job_settings.asset_name;
            var asset_label = req.body.pipelines_configs[i].job_settings.asset_label;

            var getModelFunction = null;
            var current_env = req.body.env
            if (current_env == "staging" || current_env == "dev"){
                var model_id = req.body.pipelines_configs[i].job_settings.model_id;
                var model_object = null;
                try{
                    model_object = await models_store.getModelById(model_id);  
                }
                catch(e){
                }

                if ( !(model_object && model_object.length > 0 && model_object[0].environment == current_env) ){
                    res.status(500).send("Model Id " + model_id + " is not in " + current_env + " enviornment");
                    return;
                }

                var version_object = await environments_store.getVersion(current_env);    
                var current_env_version = version_object[0].version;
                if (model_object[0].properties.deploy_version != current_env_version){
                    res.status(500).send("Model version isn’t compatible with current " + current_env + " version");
                    return;
                }

            }

            if (current_env == "staging" || current_env == "dev"){
                getModelFunction = models_store.getModelById;
                promises.push(getModelFunction(model_id));
            }
            else if (current_env == "prod"){
                // fetch selected model
                getModelFunction = history_store.getSelectedAsBestModelByAssetName;
                if(asset_label) getModelFunction = history_store.getSelectedAsBestModelByAssetNameAndAssetLabel;

                // push to promises
                promises.push(getModelFunction(asset_name, asset_label));            
            }

        }

        Promise.all(promises).then(async function(results){
            // populate correct ids
            for(var i=0; i < results.length; i++){
                req.body.pipelines_configs[i].job_settings.model_id = results[i][0].model_id;
                req.body.pipelines_configs[i].job_settings.data_id = results[i][0].model_id;
            }
            // send message
            queue_controller.sendMessage(req, res)
        })
        .catch(function(err){
            response.errorClbk(res)(err);
        });
    },  

    send_message_await_response: async function(req, res){ 
        req.body.env = req.params.env || "default";

        var model_id_missing = false;
        var current_env = req.body.env

        if (current_env == "staging" || current_env == "dev"){
            for(var i=0; i < req.body.pipelines_configs.length; i++){
                if (!req.body.pipelines_configs[i].job_settings.model_id){
                    model_id_missing = true;   
                    break;
                }
            }
        }

        if (model_id_missing){
            res.status(500).send("No model id given");
            return;
        }

        // control all promises
        var promises = [];
        for(var i=0; i < req.body.pipelines_configs.length; i++){
            // fetch asset name and label from config
            var asset_name = req.body.pipelines_configs[i].job_settings.asset_name;
            var asset_label = req.body.pipelines_configs[i].job_settings.asset_label;
            
            var getModelFunction = null;

            if (current_env == "staging" || current_env == "dev"){
                var model_id = req.body.pipelines_configs[i].job_settings.model_id;
                var model_object = null;
                try{
                    model_object = await models_store.getModelById(model_id);  
                }
                catch(e){
                }

                if ( !(model_object && model_object.length > 0 && model_object[0].environment == current_env) ){
                    res.status(500).send("Model Id " + model_id + " is not in " + current_env + " enviornment");
                    return;
                }

                var version_object = await environments_store.getVersion(current_env);    
                var current_env_version = version_object[0].version;
                if (model_object[0].properties.deploy_version != current_env_version){
                    res.status(500).send("Model version isn’t compatible with current " + current_env + " version");
                    return;
                }

            }

            if (current_env == "staging" || current_env == "dev"){
                getModelFunction = models_store.getModelById;
                promises.push(getModelFunction(model_id));
            }
            else if (current_env == "prod" || current_env == "default"){
                // fetch selected model
                getModelFunction = history_store.getSelectedAsBestModelByAssetName;
                if(asset_label) getModelFunction = history_store.getSelectedAsBestModelByAssetNameAndAssetLabel;
                // push to promises
                promises.push(getModelFunction(asset_name, asset_label));
            }

        }

        Promise.all(promises).then(async function(results){
            // populate correct ids
            for(var i=0; i < results.length; i++){
                req.body.pipelines_configs[i].job_settings.model_id = results[i][0].model_id;
                req.body.pipelines_configs[i].job_settings.data_id = results[i][0].model_id;
            }

             // wait for an incoming message associated to the job you send
            var response = await queue_controller.sendMessageSync(req, res);
            var forecast_id = response.result[0];

            // get predictions of forecast
            client_store.get_predictions(forecast_id).then(function(predictions_results){
                var predictions = predictions_results.map(function (prediction) {
                    return {
                        index: prediction.index,
                        result: prediction.y_hat
                    }
                });
                res.json(predictions);
            })
            .catch(function(err){
                response.errorClbk(res)("" + err);
            });   
        })
        .catch(function(err){
            response.errorClbk(res)("" + err);
        });
    }
}

module.exports = controller;