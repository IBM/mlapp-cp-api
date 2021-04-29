const AWS = require('aws-sdk');
var Q = require('q');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: global_config.filestore.settings.accessKey,
    secretAccessKey: global_config.filestore.settings.secretKey
});

function downloadFile(fileName, bucket, path) {
    var deferred = Q.defer();
    // Using fPutObject API upload your file to the bucket.
    try{
        innerDownloadFile(fileName, bucket, path).then(function(result) {
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

function innerDownloadFile(filename, bucket_name, path) {
    var deferred = Q.defer();
    var fullPath = __dirname + "/../.." + path;
    
    var options = {
        Bucket    : bucket_name,
        Key    : filename,
    };


    s3.getObject(options, function(err, data) {  
        if (err) {
            deferred.reject(err);
            console.log(err)
        }
        else {
            fs.writeFileSync(fullPath, data.Body.toString());
            deferred.resolve(fullPath);
            console.log('File downloaded successfully.')            
        }
    });
    return deferred.promise;
}

function uploadFile(file, bucket) {
    var deferred = Q.defer();
    // Using fPutObject API upload your file to the bucket.
    try{
        s3.bucketExists(bucket, function(res) {
            if (res && res.code == "NotFound"){
                s3.makeBucket(bucket, 'us-east-2', function(err) {
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
    s3.fPutObject(bucket, filename, path, 'application/octet-stream', function(err, etag) {
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
    s3.listBuckets(function(err, res) {
        var buckets = res.Buckets;
        if (err) {
            deferred.reject(err);
        }
        
        var promises = [];
        var results = {};

        for(var i=0; i < buckets.length; i++){
            promises.push(new Promise((resolve, reject) => {
                var current_i = i;

                const s3params = {
                    Bucket: buckets[current_i].Name,
                    Prefix: prefix,
                };
                
                results[buckets[current_i].Name] = []
                s3.listObjectsV2 (s3params, (err, stream) => {
                    if (err) {
                        reject (err);
                    }

                    for (var j=0;j<stream.Contents.length;j++){
                        results[buckets[current_i].Name].push({
                            file_name: stream.Contents[j].Key,
                            last_modified: stream.Contents[j].LastModified
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