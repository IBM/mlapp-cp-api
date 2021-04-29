var global_config = require('../config');
const response = require('../utilities/helpers/response-builder');
var request = require('request');
const store = require('./../stores/'+global_config["database"].type+'/toolchain.store');
const queue_controller = require('./queue.controller');
const jobs_controller = require('./jobs.controller');

let controller = {    
    callback: function(req, res){ 
        queue_controller.purge();
        jobs_controller.cancelRunningJobs();
        store.resolve_toolchain_callback(req, res, req.body.pipeline_env, req.body.pipeline_version);
    },
    updateDevStatus: function(req, res){ 
        store.updateStatus(req, res, "dev",req.body.pipeline_version);
    },    
}

module.exports = controller;