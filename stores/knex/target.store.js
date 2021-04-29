const knex = require('knex')(require('./../../knexfile'))
var q = require("q");

let store = {
  getByAssetNameAndType(asset_name, sub_asset_name, type_id) {
    var deferred = q.defer();
    if(sub_asset_name == "null"){
      sub_asset_name = null;
    }
    knex.select().from('models_history').where('asset_name', asset_name).where('asset_label', sub_asset_name)
    .then(function(res){
      if(res && res.length > 0){
        return knex.select().from('target').where('model_id', res[0]['model_id']).where('type', type_id).orderBy('index')
        .then(function(response){
          deferred.resolve(response);        
        })
        .catch(function(err){
          deferred.reject(err);
        })
        ;
      }
      else{
        deferred.reject("No selected model for '" + asset_name + "'.");
      }
    })
    .catch(function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  }
}

module.exports = store;