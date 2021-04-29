var global_config = require('../config');
const store = require('./../stores/'+global_config["database"].type+'/models.store');
const history_store = require('./../stores/'+global_config["database"].type+'/models_history.store');
const response = require('../utilities/helpers/response-builder');
const toolchain_store = require('./../stores/'+global_config["database"].type+'/toolchain.store');
var selectModelLogic = async function(res, model, from_env, to_env){
    try{ 
        await history_store.createModelHistory(model);
        await store.updateModels(model.asset_name, model.asset_label, {environment: from_env}, to_env);
        await store.updateModel(model.model_id, {environment: to_env});
        response.successClbk(res)("Selected model successfully!");
    }
    catch (error) {
        response.errorClbk(res)(error)
    }
}
let controller = {
    getAllModels: function(req, res){
        store.getAllModels({})
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    getAllAssetNames: function(req, res){
        store.getAllAssetNames({})
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    getAssetLabel: function(req, res){
        let assetName = req.params.assetName;
        store.getAssetLabel(assetName)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    getModelStats: function(req, res){
        let assetName = req.params.assetName;
        let assetLabel = req.params.assetLabel;
        store.getModelStats(assetName, assetLabel)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    getModelById: function(req, res){
        let model_id = req.params.modelId;
        store.getModelById(model_id)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    getModelsByPipeline: function(req, res){
        let pipeline = req.params.pipeline;
        store.getModelsByPipeline(pipeline)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    createModel: function(req, res){
        let model = req.body;
        store.createModel(model)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    selectModel: async function(req, res){
        let from_env = req.body.toolchain.from;
        let to_env = req.body.toolchain.to;
        let deploy_version = req.body.deploy_version;
        let model = req.body.current_model;
        if(toolchain_store.isToolchainRunning(to_env)){
            res.status(400);
            res.end("Request for selecting model has already been made! Try again later");
        }
        else{
            let areSameVersions = await toolchain_store.areSameVersions(from_env, to_env);
            if(areSameVersions){
                selectModelLogic(res, model, from_env, to_env);
            }
            else{
                res.status(200);
                res.end("Request for selecting model was sent successfully!")       
                let version_updated = await toolchain_store.updateVersion(req, res, from_env, to_env, deploy_version);
                if(version_updated) {
                    selectModelLogic(res, model, from_env, to_env);
                }
            }
        }
    },
    getAllModelsHistory: function(req, res){
        history_store.getAllModels({})
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    updateModel: function(req, res){
        let model = req.body;
        let model_id = req.params.modelId;
        store.updateModel(model_id, model)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    deleteModel: function(req, res){
        let model_id = req.params.modelId;
        store.deleteModel(model_id)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    getModelsByAssetName: function(req, res){
        let assetName = req.params.assetName;
        store.getModelsByAssetName(assetName)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    getSelectedModelByAssetName: function(req, res){
        let assetName = req.params.assetName;
        history_store.getSelectedAsBestModelByAssetName(assetName)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    getSelectedModelByAssetNameAndAssetLabel: function(asset_name, asset_label, callback){
        history_store.getSelectedAsBestModelByAssetNameAndAssetLabel(asset_name, asset_label)
        .then(function(res){
            callback(res[0].model_id);
        })
        .catch(function(){
        })
    },
};

module.exports = controller;
