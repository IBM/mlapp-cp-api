var global_config = require('../../config');
const snowflake = require('../../utilities/handlers/snowflake-handler')
var Q = require('q');

var MODELS_HISTORY_TABLE = '"' + global_config['database']['settings']['schema'] + '"' + '."RAD_ML_UI"."MODELS_HISTORY"';
var MODELS_HISTORY_COLUMNS = ['model_id', 'asset_name', 'asset_label', 'created_at'];
var MODELS_HISTORY_JSON_COLUMNS = [];

let store = {
    getAllModels () {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + MODELS_HISTORY_TABLE).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    getSelectedAsBestModelByAssetName (asset_name) {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + MODELS_HISTORY_TABLE + ' where asset_name = ? order by created_at desc limit 1', [asset_name]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    getSelectedAsBestModelByAssetNameAndAssetLabel (asset_name, asset_label) {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + MODELS_HISTORY_TABLE + ' where asset_name = ? and asset_label = ? order by created_at desc limit 1', [asset_name, asset_label]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    createModelHistory (model) {
      var deferred = Q.defer();
      model['created_at'] = new Date();
      snowflake.insert(MODELS_HISTORY_TABLE, MODELS_HISTORY_COLUMNS, model).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    }
}

module.exports = store;