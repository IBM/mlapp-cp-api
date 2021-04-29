var global_config = require('../../config');
const snowflake = require('../../utilities/handlers/snowflake-handler')
var Q = require("q");

var MODELS_HISTORY_TABLE = '"' + global_config['database']['settings']['schema'] + '"' + '."RAD_ML_UI"."MODELS_HISTORY"';
var TARGET_TABLE = '"DEV_SND_GBL_GA"."RAD_ML_UI"."TARGET"';
var TARGET_COLUMNS = ['model_id', 'index', 'y_true', 'y_hat', 'type'];
var TARGET_JSON_COLUMNS = [];

let store = {
  getByAssetNameAndType(asset_name, sub_asset_name, type_id) {
    var deferred = Q.defer();
    var params = [];
    var query = '';

    if(sub_asset_name == "null"){
      query = 'select * from ' + MODELS_HISTORY_TABLE + ' where asset_name = ? and asset_label is null'
      params = [asset_name];
    }
    else{
      query = 'select * from ' + MODELS_HISTORY_TABLE + ' where asset_name = ? and asset_label = ?'
      params = [asset_name, sub_asset_name];
    }
    snowflake.execute(query, params).then(function(res){
      if(res && res.length > 0){
        snowflake.execute('select * from ' + TARGET_TABLE + ' where model_id = ? and type = ?', [res[0]['model_id'], type_id]).then(function(res){
          deferred.resolve(res);
        }).catch(function(err){
          deferred.reject(err);
        });
      }
      else{
        deferred.reject("No selected model for '" + asset_name + "'.");
      }
    }).catch(function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  }
}

module.exports = store;