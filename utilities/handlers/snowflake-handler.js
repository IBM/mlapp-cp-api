var global_config = require('./../../config')
var snowflake = require('snowflake-sdk');
var Q = require('q');

var settings = global_config['database']['settings'];

// Try to connect to Snowflake, and check whether the connection was successful.
var execute = function(query, params){
  var deferred = Q.defer();

  if(!params){
    params = [];
  }

  var connection = snowflake.createConnection({
    account: settings.account,
    username: settings.user,
    password: settings.password
  });
  
  connection.connect( 
    function(err, conn) {
      if (err) {
          console.error('Unable to connect: ' + err.message);
      } 
      conn.execute({
        sqlText: query,
        binds: params,
        complete: function(err, stmt, rows) {
          conn.destroy(function(dis_err, dis_conn) {
            if (err) {
              deferred.reject(err);
            } else {
              var new_rows = [];
              for(var i=0; i < rows.length; i++){
                var key, keys = Object.keys(rows[i]);
                var n = keys.length;
                var newobj={}
                while (n--) {
                  key = keys[n];
                  newobj[key.toLowerCase()] = rows[i][key];
                }
                new_rows.push(newobj);
              }
              deferred.resolve(new_rows);
            }
          });
        }
      });
    }
  );
  return deferred.promise;
}

var insert = function(table_name, columns, objs){
  if(!Array.isArray(objs)){
    objs = [objs]
  }
  var all_objects = [];
  for(var i=0; i < objs.length; i++){
    var values = []
    for(var j=0; j < columns.length; j++){
      var current_value = objs[i][columns[j]];
      if (current_value !== undefined){
        values.push((current_value instanceof Date) ? current_value.toUTCString().replace(' GMT', '') : current_value)
      }
      else{
        values.push(null);
      }
    }
    all_objects.push(values);
  }
  return execute('insert into ' + table_name + '(' + columns.join(',') + ') values (' + Object.keys(columns).map(function(){return '?'}).join(',') + ')', all_objects);
}

var insert_with_json = function(table_name, columns, json_columns, obj){
  var insert_query = ' select ';
  var values = [];
  for(var i=0; i < columns.length; i++){
    if(i > 0){
      insert_query += ', ';
    }
    var current_value = obj[columns[i]];
    if (current_value !== undefined){
      values.push((current_value instanceof Date) ? current_value.toUTCString().replace(' GMT', '') : current_value)
    }
    else {
      values.push(null);
    }
    if(json_columns.indexOf(columns[i]) > -1){
      insert_query += 'parse_json(?) ';
    }
    else{
      insert_query += '? ';
    }
  }
  return execute('insert into ' + table_name + insert_query, values);
}

var update = function(table_name, columns, json_columns, conditions, obj){
  var values = [];

  var set_query = ' set '
  for(var j=0; j < columns.length; j++){
    var current_value = obj[columns[j]];
    if (current_value !== undefined){
      if(set_query != ' set '){
        set_query += ', ';
      }
      if(json_columns.indexOf(columns[j]) > -1){
        set_query += columns[j] + ' = parse_json(?)';
      }
      else {
        set_query += columns[j] + ' = ?';
      }
      values.push((current_value instanceof Date) ? current_value.toUTCString().replace(' GMT', '') : current_value)
    }
  }
  var condition_query = ' where ';
  if(conditions.length == 0){ 
    condition_query = '';
  }
  for(var i=0; i < conditions.length; i++){
    if(columns.indexOf(conditions[i]['key']) > -1){
      if(i > 0){
        condition_query += ' and ';
      }
      condition_query += conditions[i]['key'] + ' ' + conditions[i]['condition'] + ' ?';
      values.push((conditions[i]['value'] instanceof Date) ? conditions[i]['value'].toUTCString().replace(' GMT', '') : conditions[i]['value'])
    }
  }
  return execute('update ' + table_name + set_query + condition_query, values);
}

module.exports = {
  execute: execute,
  insert: insert,
  insert_with_json: insert_with_json,
  update: update
}