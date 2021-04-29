var filestore_handler = require('./../utilities/handlers/'+global_config["filestore"].type+'-handler');
const response = require('../utilities/helpers/response-builder');
const fs = require('fs');

var download_path = '/public/download/';

let controller = {
    queryFileStorage: function(req, res){
        
        filestore_handler.queryFileStorage(req.params.q)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },
    downloadFile: function(req, res){
        
        filestore_handler.downloadFile(req.params.key, req.params.bucket, download_path + req.params.key)
        .then((file_path) => res.download(file_path))
        .catch(response.errorClbk(res));
    },
    deleteFilesOfAsset: function(req, res){
        
        filestore_handler.deleteFilesOfAsset(req.params.assetName)
        .then((file_path) => res.download(file_path))
        .catch(response.errorClbk(res));
    }
}

module.exports = controller;