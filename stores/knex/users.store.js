const knex = require('knex')(require('./../../knexfile'))
var Q = require('q');
var _ = require('underscore');
var request = require('request');

let store = {
    getAllUsers ({}) {
      
      var defer = Q.defer();

      knex.select().from('users').then(function(data){
        if(!global_config.profiles_api.client_id){
          defer.resolve(data);
          return;
        }
        // build iui array from the data object
        var iui_arr = _.uniq(data.map(a => a["iui"]));
      
        // first look for users in the cache
        Q.all(_get_users_from_session_cache(iui_arr))
        .then(function(result) { 
            cache_results = [];

            for (var i=0;i<result.length;i++){
              if (result[i]){
                cache_results.push(JSON.parse(result[i]));
              }
            }
        
            // build array that holds all users that we didn't find in the cache
            // iui_of_users_not_in_cache, we will call the api with it.
            // (iui_of_users_not_in_cache = iui_arr - cache_users.all_cache_ids)
        
            var iui_of_users_not_in_cache = [];
            for (var i=0;i<iui_arr.length;i++){
              var iui = iui_arr[i];
              var cache_user = cache_results[i];
              if (!cache_user || cache_user["urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User"].identity.ibmUniqueID != iui){
                // user not in cache
                iui_of_users_not_in_cache.push(iui);
              }
            }
        
            // for the users we didn't find in redis cache, we wiil do batch queries to iui (ibmUniqueID) api 
            // batchs of maximum 10 iui at a time (limited by the api)
        
            var batchSize = 5;
            var promises = [];
            
            for (var i=0;i<iui_of_users_not_in_cache.length;i+=batchSize){
              var batchIds = iui_of_users_not_in_cache.slice(i, i + batchSize);
              var promise = _getUsersDetails( batchIds );
              promises.push(promise);
            }
        
            Q.all(promises)
            .then(function(result) { 
              var users = [];
              for (var i=0;i<result.length;i++) {
                if (result[i].length) {
                  var batchResults = result[i];
                }
                else {
                  batchResults = [result[i]];
                }
                for (var j=0;j<batchResults.length;j++) {		
                  users.push(batchResults[j]);
                  //sessionHandler.set("123456", JSON.stringify(batchResults[j]), global_config.profiles_api.userExpirationSeconds);
                  if (batchResults[j]["urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User"] && batchResults[j]["urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User"].identity){
                    if (global_config["session"].type){
                      let sessionHandler = require('./../../utilities/handlers/'+global_config["session"].type+'-handler');
                      sessionHandler.set(batchResults[j]["urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User"].identity.ibmUniqueID, JSON.stringify(batchResults[j]), global_config.profiles_api.userExpirationSeconds);
                    }
                  }
                }
              }
              var all_users = cache_results.concat(users);
        
              var finalUserData = [];
        
              data.forEach(function(dp) {
                //userInfo = _.find(all_users, function(user) { return "123456" === dp["iui"]; })
                userInfo = _.find(all_users, function(user) { 
                  if (user["urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User"] && user["urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User"].identity){
                    return user["urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User"].identity.ibmUniqueID === dp["iui"]; 
                  }
                  else{
                    return false
                  }
                  
                })
                var usrIdHolder = dp.id;
                var fullObj = Object.assign(dp, userInfo);
                fullObj.id = usrIdHolder;
                if (fullObj.emails == null) {
                  fullObj.emails = [{'value': fullObj.iui}]
                  fullObj.email = fullObj.iui
                }
                finalUserData.push(fullObj);
              })
        
              defer.resolve(finalUserData);
            })
            .catch(function(err) { 
              defer.reject(err);
            });
        }).catch(function(err){
          console.error(err);
          defer.reject("Error fetching users information from  IBM API.");
        })        
      }).catch(function(err){
        console.error(err);
        defer.reject("Error fetching users data from database.");
      });

      return defer.promise;  
    },
    getUserById(user_id) {
      return knex.select().from('users').where('iui', user_id);
    },
    getUserByUserAndPassword(user, password) {
      return knex.select().from('users').where('email', user).where('password', password);
    },
    getUserByUser(user) {
      return knex.select().from('users').where('email', user);
    },
    createUser (user) {
      return knex('users').insert(user);
    },
    updateUser (user_id, user) {
      return knex('users').where('iui', user_id).update(user);
    },
    deleteUser(user_id) {
      console.log(user_id);
      return knex('users').where('iui', user_id).del();
    },
    deleteUsers(user_ids) {
      console.log(user_ids);
      return knex('users').whereIn('iui', user_ids).del();
    }
}



var _get_users_from_session_cache  = function(iui_arr, req){
  var promises = [];

  // look in session cache for the users details
  if (global_config.session.type == "redis"){
    let sessionHandler = require('./../../utilities/handlers/'+global_config["session"].type+'-handler');
    for (var i=0;i<iui_arr.length;i++){
      var iui = iui_arr[i];
      var promise = sessionHandler.get(iui);
      promises.push(promise);
    }
  }
  return promises;   
}

var _getUsersDetails = function(batchIds){
  if(global_config.profiles_api.client_id){
    batchIds = batchIds.filter(function(e) { return e !== 'api-endpoint' })
    batchIds = batchIds.join();
    var options = {  
      url: 'https://connect.ibm.com:1443/mapi/profilemgmt/run/ibmidprofile/v2/users?ibmUniqueIDList='+batchIds+'&clienttype=admin&fields=name,emails,business',
      method: 'GET',
      key: global_config.profiles_api.key_path,
      cert: global_config.profiles_api.cert_path,
      headers: {
        'x-ibm-client-id': global_config.profiles_api.client_id,
        'x-ibm-client-secret': global_config.profiles_api.client_secret,
        'isUserAuthenticated': 'true'
      }
    };
    
    return new Promise(function (resolve, reject) {
        callback = function(err, res, body) {
          if (res){
            resolve(JSON.parse(res.body));  
          }     
          else{
            resolve([]);
          }           
        }		
        request(options, callback);
      });
  }
}



module.exports = store;