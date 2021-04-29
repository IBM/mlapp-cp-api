var global_config = require('../../config');
const snowflake = require('../../utilities/handlers/snowflake-handler')
var Q = require('q');

var PREDICTIONS_TABLE = '"' + global_config['database']['settings']['schema'] + '"' + '."RAD_ML_UI"."TARGET"';
var ANALYSIS_RESULTS_TABLE = '"DEV_SND_GBL_GA"."RAD_ML_UI"."ANALYSIS_RESULTS"';

let store = {
  get_predictions (job_id, model_id, type, order_codes) {
    var deferred = Q.defer();

    var order_codes_arr_as_strings = order_codes.map(function (order) {
      return "'"+order.toString()+"'"
    });
    var order_codes_string = '('+order_codes_arr_as_strings.join()+')'
    snowflake.execute('SELECT * FROM ' + PREDICTIONS_TABLE + ' WHERE TASK_ID=\''+job_id+'\' and MODEL_ID=\''+model_id+'\' and TYPE='+type+' and INDEX in '+ order_codes_string).then(function(res){
      deferred.resolve(res);
    }).catch(function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  },

  get_metadata (model_id) {
    var deferred = Q.defer();
    snowflake.execute('SELECT METADATA FROM ' + ANALYSIS_RESULTS_TABLE + ' WHERE MODEL_ID=\''+model_id+'\'').then(function(res){
      deferred.resolve(res);
    }).catch(function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  },
  
}

module.exports = store;