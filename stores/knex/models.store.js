const knex = require('knex')(require('./../../knexfile'))
var Q = require('q');

let store = {
    getAllModels () {
      return knex.select().from('analysis_results');
    },
    getAllAssetNames () {
      return knex('analysis_results').distinct('asset_name');
    },
    getAssetLabel (asset_name) {
      var deferred = Q.defer();
      knex.distinct('asset_label').from('analysis_results').where('asset_name', asset_name).then(function(res){
        res = res.map(function (item) {
          return item.asset_label || ""
        });
        deferred.resolve(res);
      }); 
      return deferred.promise;   
    },
    getModelStats (asset_name, asset_label) {
      var deferred = Q.defer();
      var obj = {};
      var promises = [];
      promises.push(knex('jobs').select('data').select('created_at').select('updated_at'));
      promises.push(knex('analysis_results').where('asset_name', asset_name).where('asset_label', asset_label));
      
      Promise.all(promises).then(function(res){
        var total_number = 0;
        var total_time = 0;
        var jobs_res = res[0];
        var analysis_results_res = res[1];
        for (var i=0;i<jobs_res.length;i++){          
            if (jobs_res[i].updated_at && jobs_res[i].created_at){
                total_number++;
                total_time += new Date(jobs_res[i].updated_at)-new Date(jobs_res[i].created_at);
            }
        }
        obj.average_run_time = total_time/total_number;

        obj.number_of_trained_models = analysis_results_res.length;
        
        deferred.resolve(obj);
      });

      return deferred.promise;  
    },
    getModelById(model_id) {
      return knex.select().from('analysis_results').where('model_id', model_id);
    },
    getModelsByPipeline(pipeline) {
      return knex.select().from('analysis_results').where('pipeline', pipeline);
    },
    createModel (model) {
      return knex('analysis_results').insert(model);
    },
    updateModel (model_id, model) {
      return knex('analysis_results').where('model_id', model_id).update(model);
    },
    updateModels (asset_name, asset_label, model, env) {
      if (env){
        if (asset_label){
          return knex('analysis_results').where('asset_name', asset_name).where('asset_label', asset_label).where('environment', env).update(model);
        }
        else{
          return knex('analysis_results').where('asset_name', asset_name).where('environment', env).update(model);
        }
      }
      else{
        if (asset_label){
          return knex('analysis_results').where('asset_name', asset_name).where('asset_label', asset_label).update(model);
        }
        else{
          return knex('analysis_results').where('asset_name', asset_name).update(model);
        }
      }
    },
    getModelsByAssetName (asset_name) {
      return knex('analysis_results').where('asset_name', asset_name);
    },
    deleteModel(model_id) {
      console.log(model_id);
      return knex('analysis_results').where('model_id', model_id).del();
    }
}

module.exports = store;