var global_config = require('../../config');
const snowflake = require('../../utilities/handlers/snowflake-handler')
var Q = require('q');

var TASKS_TABLE = '"' + global_config['database']['settings']['schema'] + '"' + '."RAD_ML_UI"."TASKS"';
var TASKS_COLUMNS = ['id', 'user', 'pipeline', 'data', 'status_code', 'status_msg', 'created_at', 'updated_at'];
var TASKS_JSON_COLUMNS = ['data'];

let store = {
    getAllJobs ({}) {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + TASKS_TABLE).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    getJobById(job_id) {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + TASKS_TABLE + ' where id = ?', [job_id]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    createJob (job) {
      var deferred = Q.defer();
      snowflake.insert_with_json(TASKS_TABLE, TASKS_COLUMNS, TASKS_JSON_COLUMNS, job).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    updateJob (job_id, job) {
      var deferred = Q.defer();
      snowflake.update(TASKS_TABLE, TASKS_COLUMNS, TASKS_JSON_COLUMNS, [{key: 'id', condition: '=', value: job_id}], job).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    deleteJob(job_id) {
      var deferred = Q.defer();
      snowflake.execute('delete from ' + TASKS_TABLE + ' where id = ?', [job_id]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    manualPurge(){
      var deferred = Q.defer();
      snowflake.execute("update jobs set status_code = -1, status_msg = 'manually stopped' where status_code = 0;", []).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    getPendingJobs(){
      var deferred = Q.defer();
      snowflake.execute('select * from ' + TASKS_TABLE + ' where status_code = 0').then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    }
}

module.exports = store;