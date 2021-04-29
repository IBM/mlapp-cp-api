var global_config = require('../../config');
const snowflake = require('../../utilities/handlers/snowflake-handler')
var Q = require('q');

var MODELS_TABLE = '"' + global_config['database']['settings']['schema'] + '"' + '."RAD_ML_UI"."ANALYSIS_RESULTS"';
var MODELS_COLUMNS = ['model_id', 'asset_name', 'model_properties', 'filestore_container', 'filestore_filename', 'metadata', 'created_at', 'updated_at'];
var MODELS_JSON_COLUMNS = [];

let store = {
    getAllModels () {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + MODELS_TABLE).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    getModelById(model_id) {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + MODELS_TABLE + ' where model_id = ?', [model_id]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    createModel (model) {
      var deferred = Q.defer();
      snowflake.insert_with_json(MODELS_TABLE, MODELS_COLUMNS, MODELS_JSON_COLUMNS, model).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    updateModel (model_id, model) {
      var deferred = Q.defer();
      snowflake.update(MODELS_TABLE, MODELS_COLUMNS, MODELS_JSON_COLUMNS, [{key: 'model_id', condition: '=', value: model_id}], model).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    deleteModel(model_id) {
      console.log(model_id);
      var deferred = Q.defer();
      snowflake.execute('delete from ' + MODELS_TABLE + ' where model_id = ?', [model_id]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    }
}

module.exports = store;