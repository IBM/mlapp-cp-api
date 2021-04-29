var azure = require('azure-storage');
var Q = require('q');

var azureBlobClient = azure.createBlobService(global_config.filestore.settings.storageAccount, global_config.filestore.settings.storageAccessKey);

function downloadFile(fileName, container, path) {
    var deferred = Q.defer();
    try{
        innerDownloadFile(fileName, container, path).then(function(result) {
            deferred.resolve(result);
        }).catch(function(e){
            deferred.reject(e.message);
        });          
    }
    catch(e){
        console.log(e.message);
        deferred.reject(e.message);
    }
    return deferred.promise;
}

function innerDownloadFile(filename, container, path) {
    var deferred = Q.defer();
    var fullPath = __dirname + "/../.." + path;
    azureBlobClient.getBlobToLocalFile(container, filename, fullPath, function(err, etag) {  
        if (err) {
            deferred.reject(err);
            console.log(err)
        }
        else {
            deferred.resolve(fullPath);
            console.log('File downloaded successfully.')            
        }
    });
    return deferred.promise;
}

function uploadFile(container, file) {
    var deferred = Q.defer();
    try{
        azureBlobClient.createContainerIfNotExists(container, function(err) {
            if (err) return console.log(err)            
            console.log('createContainerIfNotExists success')
            innerUploadFile(container, file.filename, file.destination+file.filename).then(function(result) {
                deferred.resolve();
            }).catch(function(e){
                deferred.reject(e.message);
            });
        });  
    }
    catch(e){
        console.log(e.message);
        deferred.reject(e.message);
    }
    return deferred.promise;
}

function innerUploadFile(container, blobName, path) {
    var deferred = Q.defer();
    // Using fPutObject API upload your file to the bucket europetrip.
    azureBlobClient.createBlockBlobFromLocalFile(container, blobName, path, function(err, etag) {
        if (err) {
            deferred.reject(err);
            console.log(err)
        }
        else{
            deferred.resolve();
            console.log('File uploaded successfully.')            
        }
    });
    return deferred.promise;
}

function queryFileStorage(prefix){
    var deferred = Q.defer();
    azureBlobClient.listContainersSegmented(null, function(err, obj) {
        var containers = obj.entries;
        if (err) {
            deferred.reject(err);
        }
        
        var promises = [];
        var results = {};

        for(var i=0; i < containers.length; i++){            
            promises.push(new Promise((resolve, reject) => {
                var current_i = i;
                azureBlobClient.listBlobsSegmentedWithPrefix(containers[current_i].name, prefix, null, function(err, obj2) {
                    results[containers[current_i].name] = []
                    for (var j=0;j<obj2.entries.length;j++){
                        results[containers[current_i].name].push({
                            file_name: obj2.entries[j].name,
                            last_modified: obj2.entries[j].lastModified
                        });
                    }                    
                    resolve();

                });                
            }));
        }
        Promise.all(promises).then(function(){
            deferred.resolve(results);
        })
        .catch(function(err){
            deferred.reject(err);
        });
    });
    return deferred.promise;
}

module.exports = {
    downloadFile: downloadFile,
    uploadFile: uploadFile,
    queryFileStorage: queryFileStorage
};