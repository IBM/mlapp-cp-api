var global_config = require('../../config');
const snowflake = require('../../utilities/handlers/snowflake-handler')
var Q = require('q');

var TEMPLATES_TABLE = '"' + global_config['database']['settings']['schema'] + '"' + '."RAD_ML_UI"."TEMPLATES"';
var TEMPLATES_COLUMNS = ['id', 'name', 'template', 'enabled'];
var TEMPLATES_JSON_COLUMNS = ['template'];

let store = {
    getAllTemplates () {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + TEMPLATES_TABLE).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    getTemplateByName(name) {
      var deferred = Q.defer();
      snowflake.execute('select * from ' + TEMPLATES_TABLE + ' where name = ?', [name]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    createTemplate (template) {
      var deferred = Q.defer();
      snowflake.insert_with_json(TEMPLATES_TABLE, TEMPLATES_COLUMNS, TEMPLATES_JSON_COLUMNS, template).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    updateTemplate (id, template) {
      var deferred = Q.defer();
      snowflake.update(TEMPLATES_TABLE, TEMPLATES_COLUMNS, TEMPLATES_JSON_COLUMNS, [{key: 'id', condition: '=', value: id}], template).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    deleteTemplate(id) {
      var deferred = Q.defer();
      snowflake.execute('delete from ' + TEMPLATES_TABLE + ' where id = ?', [id]).then(function(res){
        deferred.resolve(res);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    }
}

module.exports = store;