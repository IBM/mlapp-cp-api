const global_config = require('./../config')
const message_queue = require('./../utilities/handlers/'+global_config["message_queue"].type+'-queue-handler');
const email_handler = require('./../utilities/handlers/'+global_config["email"].type+'-handler');

const jobs_store = require('./../stores/'+global_config["database"].type+'/jobs.store');
const schedules_store = require('./../stores/'+global_config["database"].type+'/schedules.store');
const models_store = require('./../stores/'+global_config["database"].type+'/models.store');
const uuid_generator = require('./../utilities/helpers/uuid-generator')
const response = require('../utilities/helpers/response-builder');

const toolchain_store = require('./../stores/'+global_config["database"].type+'/toolchain.store');
const environments_store = require('./../stores/'+global_config["database"].type+'/environments.store');

var queues_for_send = global_config.message_queue.send_analysis_topic;
var queue_for_logs = global_config.message_queue.analysis_logs;

var enumCondition = {
    "LESS THAN": "<",
    "GREATER THAN": ">",
    "EQUALS": "="
}

// const sgMail = require('@sendgrid/mail')
// if(global_config.mail_api_key){
//     sgMail.setApiKey(global_config.mail_api_key);
// }

var Q = require('q');

var jobs_callback = {}

var onLogMessageCallback = function(msg, ack){

    // console.log("Received message from: ", JSON.parse(msg).job_id);
    if (ack){
        ack();
    }

    //return;
    
    if (typeof msg !== 'object') { 
        msg = JSON.parse(msg); 
    }

    if (typeof msg !== 'object') { 
        msg = JSON.parse(msg); 
    }

    if(global_config["session"].type){
        let session = require('./../utilities/handlers/'+global_config["session"].type+'-handler');
        if (msg.state == "done"){
            if(session) session.remove(msg.job_id);
        }
        else{
            if (session){
                session.get(msg.job_id).then(function(response){
                    var arr;
                    
                    // new value
                    if (response == null){
                        arr = [msg.message];
                    }
                    // append to existing
                    else{
                        arr = JSON.parse(response);
                        arr.push(msg.message);
                    }
                    session.set(msg.job_id, JSON.stringify(arr), 3600);
                })
                .catch(function(err){
                    console.log('handle log error: ', err)
                });
            }
        }
    }   
}

var onMessageCallback = function(msg, ack){

    // console.log("Received message from: ", JSON.parse(msg).job_id);
    if (ack){
        ack();
    }

    //return;
    
    if (typeof msg !== 'object') { 
        msg = JSON.parse(msg); 
    }

    if (typeof msg !== 'object') { 
        msg = JSON.parse(msg); 
    }

    var job_id = msg.job_id;
    var model_id = msg.result && msg.result[0] || null;

    // update job id status
    jobs_store.getJobById(job_id).then(async function(response){
        if(response.length == 0){
            console.error("No job found. Job was probably created from outside the UI.");
            return;
        }
        var job_from_db = response[0];
        
        var updates_for_job = {
            status_code: msg.status_code, 
            status_msg: msg.status_msg, 
            updated_at: new Date()
        };
    
        if(model_id){
            if(job_from_db['data']){
                var temp = undefined;
                if(typeof job_from_db['data'] === 'string'){
                    temp = JSON.parse(job_from_db['data']);
                }
                else{
                    temp = job_from_db['data'];
                }
                temp[0]['model_id'] = model_id;
                updates_for_job['data'] = JSON.stringify(temp);
            }
            else{
                updates_for_job['data'] = JSON.stringify([{'model_id': model_id}]);
            }
        }
    
        if (msg.status_code == 100 && job_from_db.schedule_id){
            var schedule_obj = await schedules_store.getScheduleById(job_from_db.schedule_id);
            if (schedule_obj[0].schedule_conf.trigger){
                var trigger = JSON.parse(schedule_obj[0].schedule_conf.trigger);
                var model = await models_store.getModelById(model_id);
                for (var i=0;i<trigger.length;i++){
                    var conditions = trigger[i].conditions;
                    var condition_exists = true;
                    for (var j=0;j<conditions.list.length;j++){
                        var condition=conditions.list[j];
                        if(! eval(model[0].metadata.models.scores[condition.key]+enumCondition[condition.condition]+condition.value)){                            
                            condition_exists = false;
                            break;
                        }
                    }
                    if (condition_exists){
                        var triggers = trigger[i].triggers;
                        for (var j=0;j<triggers.length;j++){
                            var action = triggers[j];
                            if (action.type == "email"){
                                var str = JSON.stringify({
                                    name: schedule_obj[0].name,
                                    trigger: trigger[i]
                                })
                                email_handler.sendMail("Scheduler " + schedule_obj[0].name, str, str);
                            }
                        }
                    }
                }
            }            
        }

        jobs_store.updateJob(job_id, updates_for_job).then(function() {
            // console.log("Job updated for: ", msg.job_id);
        }).catch(function(err) {
            console.error("No job found. Job was probably created from outside the UI.");
        }) 
    }).catch(function(err) {
        console.error(err);
    }) 
    
    try{
        if (jobs_callback[msg.job_id]){            
            if (msg.status_code == 100){
                jobs_callback[msg.job_id].deferred.resolve(msg);
            }
        }
    }
    catch(error){
        console.log(error);
    }
}

message_queue.subscribeToQueue(onMessageCallback);
// message_queue.subscribeToQueue(queue_for_logs, onLogMessageCallback);

var _send_message_to_queue = async function(user_id, queue_name, message, msg_env, schedule_id){
    var deferred = Q.defer();

    // extracting job type
    var job_id = uuid_generator();

    var job_version = '-'
    if(msg_env != "default"){
        var version_object = await environments_store.getVersion(msg_env);
        job_version = version_object[0].version;
    }
    
    var data = message.pipelines_configs.map(function (item) {
        var data = item.job_settings;
        data.environment = msg_env;
        data.version = job_version;
        return data;
    });
    

    var job = {
        id: job_id,
        user: user_id,
        data: JSON.stringify(data),
        status_msg: "in queue",
        status_code: 0,
        created_at: new Date(),
        updated_at: null,
        schedule_id: schedule_id
    }

    // creating job
    jobs_store.createJob(job).then(function(){
        // updating job id in message
        //message.job_settings.id = job_id;
        message.job_id = job_id;

        // json stringify on message
        message_json = JSON.stringify(message);

        // sending process to queue
        message_queue.sendToQueue(msg_env, message_json);
        console.log("\nCreated job %s with message:\n\n %s \n\nMessage was sent to queue '%s' successfuly.\n", job_id, message_json, queue_name);
        deferred.resolve(job_id);
    })
    .catch(function(err){
        console.log(err);
        deferred.reject(err);
    });
    return deferred.promise;
}

var _store_in_config = function(config, key_path, value){
    // TODO: improve this to support arrays
    var path_splits = key_path.split('.')
    var config_context = config;
    for(var i = 0; i < path_splits.length - 1; i++){
        config_context = config_context[path_splits[i]];
    }
    config_context[path_splits[path_splits.length - 1]] = value;
}

var _sendMessage = function(req, res, sync, deferred){
    var message = req.body.config || req.body;
    var msg_env = req.body.env;

    var user_id = req.session && req.session.user && req.session.user.iui || 'api-endpoint';
    
    var schedule_id = req.id;
    _send_message_to_queue(user_id, queues_for_send[msg_env], message, msg_env, schedule_id).then(function(job_id){    
        if (sync){
            jobs_callback[job_id] = {
                deferred: deferred
            }
        }
        else{
            if (res){
                response.successClbk(res)(job_id);
            }
        }
    })
    .catch(function(err){
        console.log(err);
        if (sync){
            deferred.reject(err);
        }
        else{
            if (res){
                response.errorClbk(res)(err);
            }
        }
    });    
}

let controller = {
    sendMessageSync: function(req, res){
        var deferred = Q.defer();
        _sendMessage(req, res, true, deferred);
        return deferred.promise;
    },

    sendMessage: function(req, res){
        _sendMessage(req, res, false);
    },

    toolchainSendMessage: async function(req, res){
        let from_env = req.body.toolchain.from;
        let to_env = req.body.toolchain.to;
        let deploy_version = req.body.deploy_version;

        if(toolchain_store.isToolchainRunning(to_env)){
            res.status(400);
            res.end("Request for re-training in staging has already been made! Try again later");
        }
        else{
            let areSameVersions = await toolchain_store.areSameVersions(from_env, to_env);
            if(areSameVersions){
                _sendMessage(req, res, false);
            }
            else{
                res.status(200);
                res.end("Request for re-training in staging was sent successfully!")
                let response = await toolchain_store.updateVersion(req, res, from_env, to_env, deploy_version);
                if(response) {
                    _sendMessage(req, res, false);
                }
            }
        }
    },

    upload: function(req, res){
        if (req.files.file.length!=null){
            for (var i=0;i<req.files.file.length;i++){
                var data = req.files.file[i].data;
                var string = data.toString();  
                var message = JSON.parse(string);
                _sendMessage({body:message}, null, false);
            }    
        }
        else{
            var data = Buffer.from(req.files.file.data);          
            var string = data.toString();  
            var message = JSON.parse(string);
            _sendMessage({body:message}, null, false);
        }

        // response.successClbk(res)(job_id);
        response.successClbk(res)();
    },
        
    sendMessagesBatch: function(req, res){
        // Loop through messages and use sendMessage
    },
    configGenerator: function(req, res){
        var input = req.body;
        var user_id = req.session && req.session.user && req.session.user.iui || 1;
        
        var configurations_to_send = [];
        var configurations_indexes = []
        var configurations_lengths = []
        var number_of_configurations = 1;
        for(var key in input['generator']) {
            var conf_length = input['generator'][key].length;
            configurations_indexes.push(0);
            configurations_lengths.push(conf_length - 1);
            number_of_configurations = number_of_configurations * conf_length
        }
        for(var i=0; i < number_of_configurations; i++){
            // creating a config with a permutation from the generator
            var curr_config = JSON.parse(JSON.stringify(input['config']));
            var key_path_index = 0;
            for(var key_path in input['generator']){
                var key_value = input['generator'][key_path][configurations_indexes[key_path_index]];
                _store_in_config(curr_config['pipelines_configs'][0], key_path, key_value);
                key_path_index = key_path_index + 1;
            }
            configurations_to_send.push(curr_config);

            // change to next available permutation
            var last_index = configurations_lengths.length;
            while(true){
                last_index = last_index - 1;
                // another permutation available in key
                if(configurations_indexes[last_index] < configurations_lengths[last_index]){
                    configurations_indexes[last_index] = configurations_indexes[last_index] + 1;
                    break;
                }
                // change to another permutation in the next key
                else{
                    configurations_indexes[last_index] = 0;
                }
                // no more permutations available
                if(last_index < 0){
                    break;
                }
            }
        }
        var promises = [];
        for(var i=0; i < configurations_to_send.length; i++){
            promises.push(_send_message_to_queue(user_id, queue_for_general_send + "_" + req.body.config.environment, configurations_to_send[i]));
        }
        Promise.all(promises).then(function(){
            response.successClbk(res)("Done");
        })
        .catch(function(err){
            response.errorClbk(res)(err);
        });
    },
    getStats: function(req, res){
        response.successClbk(res)({})
        // response.successClbk(res)(message_queue.getQueueStats(queue_for_general_send));
    },
    purge: async function(req, res, next){
        message_queue.purgeQueue(next).then(function(){
            jobs_store.manualPurge().then(function(){
                response.successClbk(res)("Purged queue successfully");
            })
            .catch(function(err){          
                response.errorClbk(res)(err);
            });
        })
        .catch(function(err){
            response.errorClbk(res)(err);
        });
    }
}


module.exports = controller;