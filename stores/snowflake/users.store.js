var global_config = require('../../config');
const snowflake = require('../../utilities/handlers/snowflake-handler')
var Q = require('q');

var USERS_TABLE = '"' + global_config['database']['settings']['schema'] + '"' + '."RAD_ML_UI"."USERS"';
var USERS_COLUMNS = ['iui', 'email', 'password', 'status', 'created_at', 'updated_at'];
var USERS_JSON_COLUMNS = [];

let store = {
    getAllUsers ({}) {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + USERS_TABLE).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    getUserById(user_id) {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + USERS_TABLE + ' where iui = ?', [user_id]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    getUserByUser(user) {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + USERS_TABLE + ' where email = ?', [user]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    createUser(user) {
      var deferred = Q.defer();
      snowflake.insert(USERS_TABLE, USERS_COLUMNS, user).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    updateUser (user_id, user) {
      var deferred = Q.defer();
      snowflake.update(USERS_TABLE, USERS_COLUMNS, USERS_JSON_COLUMNS, [{key: 'iui', condition: '=', value: user_id}], user).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    deleteUser(user_id) {
      var deferred = Q.defer();
      snowflake.execute('delete from ' + USERS_TABLE + ' where iui = ?', [user_id]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    }
}

module.exports = store;