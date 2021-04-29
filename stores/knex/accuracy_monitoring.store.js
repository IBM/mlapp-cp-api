const knex = require('knex')(require('./../../knexfile'))
var q = require("q");
// var stringSimilarity = require('string-similarity');

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = d.getHours().toString(),
      minute = d.getMinutes().toString(),
      second = d.getSeconds().toString();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;
  if (hour.length < 2) 
      hour = '0' + hour;
  if (minute.length < 2) 
      minute = '0' + minute;
  if (second.length < 2) 
      second = '0' + second;

  return [day, month, year].join('/') + " " + [hour, minute, second].join(':');
}

let store = {
  getForecastAccuracyMonitoring(asset_name, asset_label) { 
    asset_label = asset_label?asset_label:"";   
    var deferred = q.defer();
    knex.select().from('asset_accuracy_monitoring').where('asset_name', asset_name).orderBy('created_at', 'asc').then(function(res){
      var dict = {};
      for (var i=0;i<res.length;i++){
        var model_accuracy = typeof res[i].model_accuracy == "object" ? res[i].model_accuracy : JSON.parse(res[i].model_accuracy);
        if (res[i].asset_label_name == asset_label){
          var keys = Object.keys(model_accuracy);
          for (var j=0;j<keys.length;j++){
            var key = keys[j];
            if (!dict[key]){
              dict[key] = [];
            }

            dict[key].push({
              value: model_accuracy[key],
              timestamp: formatDate(res[i].timestamp)
            });
          }
        }
      }
      deferred.resolve(dict);
    });
    return deferred.promise;
  },
  searchAccuracyMonitoring(search) {       
    var deferred = q.defer();
    
    return deferred.promise;
  }
}

module.exports = store;