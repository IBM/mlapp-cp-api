const knex = require('knex')(require('../../knexfile'))

var Q = require('q');
var _ = require('underscore');
var request = require('request');
const response = require('./../../utilities/helpers/response-builder');
const environments_store = require('./../../stores/'+global_config["database"].type+'/environments.store');

PIPELINE_IDS = {
  'staging': {
    "pipeline_id": global_config['staging_pipeline_id'],
    "stage_id": global_config['staging_stage_id']
  },
  'prod': {
    "pipeline_id": global_config['production_pipeline_id'],
    "stage_id": global_config["production_stage_id"]
  }
}

var toolchain_deferred = {
  'dev': null,
  'staging': null,
  'prod': null
}

let store = {
    async resolve_toolchain_callback(req, res, pipeline_env, pipeline_version){
      
      await environments_store.setVersion(pipeline_env, pipeline_version);

      if (pipeline_env == "dev"){
        res.sendStatus(200);
      }
      else{
        toolchain_deferred[pipeline_env].resolve();  
      }
    },
    async areSameVersions(from, to){
        if(from == to){
          return true;
        }
        
        var versions_dict = {};
        var versions = await environments_store.getVersions();
        for (var i=0;i<versions.length;i++){
            var env = versions[i].env;
            versions_dict[env] = versions[i]; 
        }
        return versions_dict[from].version == versions_dict[to].version
    },
    isToolchainRunning(env){
      return toolchain_deferred[env] != null;
    },
    async updateVersion(req, res, from, to, from_version){
      var are_same_versions = await this.areSameVersions(from, to)
      if (!are_same_versions){
        console.log("awaiting request_toolchain_execution");
        var timedOut = false;
        await Promise.race([
          this.request_toolchain_execution(req, res, to, from_version),
          new Promise(function(r) {
              setTimeout(function() {
                  console.log('awaiting request_toolchain_execution timed out');
                  timedOut = true;
                  toolchain_deferred[to] = null;
              }, 900000); // 15 minutes
          }),
        ]);
        if(!timedOut){
          console.log("request_toolchain_execution done");
          // toolchain done, so update version of target to be same as source
//          await environments_store.setVersion(to, from_version);
          toolchain_deferred[to] = null;
        }
      }
      return true;   
    },    
    request_toolchain_execution: function(req, res, pipeline_env, pipeline_version){
        toolchain_deferred[pipeline_env] = Q.defer();
        // IAM API KEY token request
        request({
          url: "https://iam.cloud.ibm.com/identity/token",
          method: 'POST',
          form: {'grant_type': 'urn:ibm:params:oauth:grant-type:apikey', 'apikey': global_config['toolchain_api_key']},
          headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'}
        }, async function(err, httpResponse, body) {
            if(err){
                console.error(err);
                response.errorClbk(res);
            }
            var access_token = JSON.parse(body).access_token;
            
            // Pipeline execution request

            await environments_store.setStatus(pipeline_env,pipeline_version);

            request({
                url: "https://api.us-south.devops.cloud.ibm.com/v1/pipeline/pipelines/" + PIPELINE_IDS[pipeline_env]["pipeline_id"] + "/stages/" + PIPELINE_IDS[pipeline_env]["stage_id"] + "/executions",
                method: 'POST',
                json: {'properties': [{'type': 'TEXT', 'name': 'PIPELINE_VERSION','value': pipeline_version}]},
                headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + access_token }
            }, function(err, httpResponse, body) {
                if(err){
                    console.error(err);
                    response.errorClbk(res);
                }
                response.successClbk(res)
            })
        });
        return toolchain_deferred[pipeline_env].promise;
    },
    async updateStatus(req, res, env, pipeline_version){
      await environments_store.setStatus(env, pipeline_version);
      res.sendStatus(200);
    },
}



module.exports = store;