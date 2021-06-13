var Minio = require('minio');
var Q = require('q');

var minioClient = new Minio.Client(global_config.filestore.settings);

function downloadFile(fileName, bucket, path) {
    bucket = global_config.filestore.settings.bucket; // hard code bucket from config
    var deferred = Q.defer();
    // Using fPutObject API upload your file to the bucket.
    try{
        minioClient.bucketExists(bucket, function(res) {
            if (res && res.code == "NotFound"){
                minioClient.makeBucket(bucket, global_config.filestore.settings.region, function(err) {
                    if (err) return console.log(err)            
                    console.log('Bucket created successfully.')
                    innerDownloadFile(fileName, bucket, path).then(function(result) {
                        deferred.resolve(result);
                    }).catch(function(e){
                        deferred.reject(e.message);
                    });
                });
            }  
            else{
                innerDownloadFile(fileName, bucket, path).then(function(result) {
                    deferred.resolve(result);
                }).catch(function(e){
                    deferred.reject(e.message);
                });
            }
        });             
    }
    catch(e){
        console.log(e.message);
        deferred.reject(e.message);
    }
    return deferred.promise;
}

function innerDownloadFile(filename, bucket, path) {
    var deferred = Q.defer();
    var fullPath = __dirname + "/../.." + path;
    // Using fPutObject API upload your file to the bucket europetrip.
    minioClient.fGetObject(bucket, filename, fullPath, function(err, etag) {  
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

function uploadFile(file, bucket) {
    bucket = global_config.filestore.settings.bucket; // hard code bucket from config
    var deferred = Q.defer();
    // Using fPutObject API upload your file to the bucket.
    try{
        minioClient.bucketExists(bucket, function(res) {
            if (res && res.code == "NotFound"){
                minioClient.makeBucket(bucket, global_config.filestore.settings.region, function(err) {
                    if (err) return console.log(err)            
                    console.log('Bucket created successfully.')
                    innerUploadFile(file.filename, file.destination+file.filename, bucket).then(function(result) {
                        deferred.resolve();
                    }).catch(function(e){
                        deferred.reject(e.message);
                    });
                });  
            }  
            else{
                innerUploadFile(file.filename, file.destination+"/"+file.filename, bucket).then(function(result) {
                    deferred.resolve();
                }).catch(function(e){
                    deferred.reject(e.message);
                });
            }
        });

             
    }
    catch(e){
        console.log(e.message);
        deferred.reject(e.message);
    }
    return deferred.promise;
}

function innerUploadFile(filename, path, bucket) {
    var deferred = Q.defer();
    // Using fPutObject API upload your file to the bucket europetrip.
    minioClient.fPutObject(bucket, filename, path, 'application/octet-stream', function(err, etag) {
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
    var stream = minioClient.listObjectsV2(global_config.filestore.settings.bucket, prefix, false, '');
    results = {}
    stream.on('data', function(file) {
        let file_type = file.name.split('.')[1];
        if (!(file_type in results)){
            results[file_type] = []
        }
        results[file_type].push({
            file_name: file.name,
            last_modified: file.lastModified
        })
    });
    stream.on('end', function(){
        deferred.resolve(results);
    });
    stream.on('error', function(){
        deferred.reject();
    });
    return deferred.promise;
}

function deleteFilesOfAsset(assetName) {
    var deferred = Q.defer();
    minioClient.removeObjects(bucket, filename, path, 'application/octet-stream', function(err, etag) {
        if (err) {
            deferred.reject(err);
            console.log(err)
        }
        else{
            deferred.resolve();
            console.log('File uploaded successfully.')            
        }
    });

    try{
                    
    }
    catch(e){
        console.log(e.message);
        deferred.reject(e.message);
    }
    return deferred.promise;
}

module.exports = {
    downloadFile: downloadFile,
    uploadFile: uploadFile,
    queryFileStorage: queryFileStorage,
    deleteFilesOfAsset: deleteFilesOfAsset
};