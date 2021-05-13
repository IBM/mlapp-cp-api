const global_config = require('../config')
var Q = require('q');

var cron = require('node-cron');
var request = require('request');
const user_store = require('../stores/'+global_config["database"].type+'/users.store');
const history_store = require('../stores/'+global_config["database"].type+'/models_history.store');


// every 12 hour we check for deleted iuis and remove these users from the database

cron.schedule('0 */12 * * *', () => {  

    var iuis = [];

    function iui_check_deleted_accounts(since){
        request({  
            url: 'https://w3-dev.api.ibm.com/profilemgmt/test/ibmidprofileait/v2/users/changes?since='+since+'&type=delete',
            method: 'GET',
            key: global_config.profiles_api.key_path,
            cert: global_config.profiles_api.cert_path,
            headers: {
                'x-ibm-client-id': global_config.profiles_api.client_id,
                'x-ibm-client-secret': global_config.profiles_api.client_secret,
                'isUserAuthenticated': 'true'
            }
        },function(err, res, body){
            try{
                var obj = JSON.parse(body);

                if (obj.bookmark){
                    if (obj.delete.size>0){
                        for (var i=0;i<obj.delete.IUIs.length;i++){
                            iuis.push(obj.delete.IUIs[i]);
                        }
                    }
                    iui_check_deleted_accounts(obj.bookmark);
                }
                else{
                    console.log("deleting "+iuis.length+" users")
                    user_store.deleteUsers(iuis).then(function(){
                    });
                }
            }
            catch(e){}
        })
    }

    var ts = Math.floor(+new Date() / 1000);
    var tsYesterday = ts - (24 * 3600);

    // add 000 to make the since in ms
    iui_check_deleted_accounts(tsYesterday + "000");

});



const response = require('../utilities/helpers/response-builder');

const store = require('./../stores/'+global_config["database"].type+'/schedules.store');
const uuid_generator = require('./../utilities/helpers/uuid-generator')
const queue_controller = require('./queue.controller');
        
var schedule_cron_tasks = {};

refreshCronJobs();

let controller = {
    
    getAllSchedules: function(req, res){
        
        store.getAllSchedules({})
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    createSchedule: function(req, res){
        var schedule_id = uuid_generator();
        var obj = {
            id: schedule_id,
            name: req.body.name,
            schedule_conf: req.body.schedule_conf,
            // intrval: req.body.intrval,
            // unit: req.body.unit,
            config: req.body.config
        };
        
        store.createSchedule(obj)
        .then(function(schedule_id){
            refreshCronJobs();
        })
        .catch(function(e){
            
        })
        res.sendStatus(200);
    },

    updateSchedule: function(req, res){
        var schedule_id = uuid_generator();
        var obj = {
            id: req.body.id,
            name: req.body.name,
            schedule_conf: req.body.schedule_conf,
            // intrval: req.body.intrval,
            // unit: req.body.unit,
            config: req.body.config
        };
        
        store.updateSchedule(obj)
        .then(function(schedule_id){
            refreshCronJobs();
        })
        .catch(function(e){
            
        })
        res.sendStatus(200);
    },

    deleteSchedule: function(req, res){       
        store.deleteSchedule(req.body.id)
        .then(function(){
            refreshCronJobs();
        })
        .catch(function(e){
            
        })
        res.sendStatus(200);
    },
}

function refreshCronJobs(){
    store.getAllSchedules()
    .then(function(all_schedules){
        var keys = Object.keys(schedule_cron_tasks);
        for (var i=0;i<keys.length;i++){
            var key = keys[i];
            schedule_cron_tasks[key].destroy();
        }    
        
        for (var i=0;i<all_schedules.length;i++){            
            setTimeout(function(x) { return function() { 
                all_schedules[x].config.env = "default";
                if (all_schedules[x].schedule_conf.command){
                    //command
                    try{
                        schedule_cron_tasks[all_schedules[x].id] = cron.schedule(all_schedules[x].schedule_conf.command, async () => {  
                            var obj = {body:all_schedules[x].config,id:all_schedules[x].id};

                            //remove this
                            queue_controller.sendMessage(obj, null)
                            return;

                            var asset_name = obj.body.pipelines_configs[0].job_settings.asset_name;
                            var asset_label = obj.body.pipelines_configs[0].job_settings.asset_label;
                
                            var getModelFunction = history_store.getSelectedAsBestModelByAssetName;
                            if(asset_label) getModelFunction = history_store.getSelectedAsBestModelByAssetNameAndAssetLabel;

                            var result = await getModelFunction(asset_name, asset_label);  

                            obj.body.pipelines_configs[0].job_settings.model_id = result[0].model_id;
                            obj.body.pipelines_configs[0].job_settings.data_id = result[0].model_id;            
                            queue_controller.sendMessage(obj, null)
                        });     
                    }
                    catch(e){
                        console.error(all_schedules[x].name);
                    }
                }
                else{
                    if (all_schedules[x].schedule_conf.unit == "Minutes"){
                        schedule_cron_tasks[all_schedules[x].id] = cron.schedule('*/'+all_schedules[x].schedule_conf.intrval+' * * * *', () => {  
                            queue_controller.sendMessage({body:all_schedules[x].config}, null)
                        });    
                    }
                    else if (all_schedules[x].schedule_conf.unit == "Hours"){
                        schedule_cron_tasks[all_schedules[x].id] = cron.schedule('0 */'+all_schedules[x].schedule_conf.intrval+' * * *', () => {  
                            queue_controller.sendMessage({body:all_schedules[x].config}, null)
                        });    
                    }
                    else if (all_schedules[x].schedule_conf.unit == "Days"){
                        schedule_cron_tasks[all_schedules[x].id] = cron.schedule('0 */'+(all_schedules[x].schedule_conf.intrval*24)+' * * *', () => {  
                            queue_controller.sendMessage({body:all_schedules[x].config}, null)
                        });    
                    }
                }                
            }}(i), i);
        }

    })
    .catch(function(e){        
    })

}

module.exports = controller;