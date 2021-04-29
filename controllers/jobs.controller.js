var global_config = require('../config');
const store = require('./../stores/'+global_config["database"].type+'/jobs.store');
const response = require('../utilities/helpers/response-builder');

let controller = {

    getAllJobs: function(req, res){
        
        store.getAllJobs({})
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    getJobById: function(req, res){
        
        let job_id = req.params.jobId;

        store.getJobById({ job_id })
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    lastJobOfSchedule: function(req, res){
        
        let schedule_id = req.params.scheduleId;

        store.getLastJobByscheduleId(schedule_id)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    createJob: function(req, res){
        
        let job = req.body;

        store.createJob({ job })
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    updateJob: function(req, res){
        
        let job = req.body;
        let job_id = req.params.jobId;

        store.updateJob({ job_id, job })
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    deleteJob: function(req, res){
        
        let user_id = req.params.jobId;

        store.deleteJob({ user_id })
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    cancelJob: function(req, res){        
        let job_id = req.params.jobId;
        // store.cancelJob({ user_id })
        // .then(response.successClbk(res))
        // .catch(response.errorClbk(res));
    },

    cancelRunningJobs: function(req, res){        
        store.cancelRunningJobs()
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    }
    
};

module.exports = controller;
