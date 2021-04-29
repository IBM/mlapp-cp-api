var global_config = require('../config');
const store = require('./../stores/'+global_config["database"].type+'/accuracy_monitoring.store');
const response = require('../utilities/helpers/response-builder');

download_path = '/public/download/';

let controller = {
    getAccuracyMonitoring: function(req, res){      
        store.getAccuracyMonitoring(req.params.offset_and_bulk_size)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    searchAccuracyMonitoring: function(req, res){      
        store.searchAccuracyMonitoring(req.params.search)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    getForecastAccuracyMonitoring: function(req, res){      
        store.getForecastAccuracyMonitoring(req.params.asset_name,req.params.asset_label)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
}

module.exports = controller;