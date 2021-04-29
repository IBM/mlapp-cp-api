const myCOS = require('ibm-cos-sdk');
var Q = require('q');

var cosClient = new myCOS.S3(global_config.filestore.settings);

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

function innerDownloadFile(filename, bucket, path) {
    var deferred = Q.defer();
    var fullPath = __dirname + "/../.." + path;
    
    var options = {
        Bucket    : bucket,
        Key    : filename,
    };

    cosClient.getObject(options, function(err, data) {  
        if (err) {
            deferred.reject(err);
            console.log(err)
        }
        else {
            fs.writeFileSync(fullPath, data.Body);
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
        innerUploadFile(file.filename, file.destination+"/"+file.filename, bucket).then(function(result) {
            deferred.resolve();
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

function innerUploadFile(filename, filecontent, bucket) {
    var deferred = Q.defer();
    cosClient.putObject({
        Bucket: bucket, 
        Key: filename, 
        Body: filecontent
    }).promise()
    .then(() => {
        console.log(`Item: ${itemName} created!`);
        deferred.resolve();
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
        deferred.reject();
    });
    return deferred.promise;
}

function queryFileStorage(prefix){
    var deferred = Q.defer();
    cosClient.listBuckets(function(err, res) {
        if (err || res == null) {
            deferred.reject(err);
            return deferred.promise
        }
        var buckets = res.Buckets;
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
                cosClient.listObjectsV2 (s3params, (err, stream) => {
                    if (err) {
                        reject (err);
                        return
                    }
                    if (stream != null && stream.Contents != null){
                        for (var j=0;j<stream.Contents.length;j++){
                            results[buckets[current_i].Name].push({
                                file_name: stream.Contents[j].Key,
                                last_modified: stream.Contents[j].LastModified
                            });
                        }
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

function deleteFilesOfAsset(assetName) {
    var deferred = Q.defer();
    cosClient.deleteObjects(bucket, filename, path, 'application/octet-stream', function(err, etag) {
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