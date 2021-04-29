var Q = require("q");
var azure = require('azure-sb');

var connection_string = global_config.message_queue.settings.endpoint;

var _instance = null;

var connect = function() {
    _instance = azure.createServiceBusService(connection_string);   
}

var subscribeToQueue = function(queue, callback) {
  _instance.createQueueIfNotExists(queue, function (err) {
      if (err) {
          console.log('Failed to create queue: ', err);
      } 

      //isPeekLock=true - read the message and don't delete (lock)
      //isPeekLock=false - read the message and delete
      
      setInterval(function(){
        _instance.receiveQueueMessage(queue, { isPeekLock: true }, function (err, lockedMessage) {
          if (err) {
            if (err == 'No messages to receive') {
              
            } else {
              console.log(err);
            }
          } 
          else {
            console.log("message received", lockedMessage.location)
            callback(lockedMessage.body, function(){
              _instance.deleteMessage(lockedMessage, function (deleteError){
                    if(!deleteError){
                        // Message deleted
                    }
                })
            });
          }
        })
      }, 1000);    
  });
}

function sendToQueue(queue, msg) {
  _instance.sendQueueMessage(queue, msg, function (err) {
    if (err) {
      console.log('Failed Text: ', err);
    } else {
      console.log('Sent ' + msg);
    }
  });
}

var purgeQueue = function(queue){
    var defer = Q.defer();
    _instance.deleteQueue(queue, function (err) {  
      _instance.createQueue(queue, function (err) {
        if (err) {
            console.log('Failed to create queue: ', err);
            defer.reject(err);
        }
        defer.resolve();
      })
    })
    return defer.promise;
}

// var idx = 0;

// setTimeout(function(){
//   var msg = {
//     job_id: idx
//   }
//   console.log("Filling the queue!!!");
//   sendToQueue("analysis_respond", msg);
// },20000);

// setTimeout(function(){ 
//   console.log("Purging!!!");
//   purgeQueue("analysis_respond");
// },35000);


// setTimeout(function(){
//   var msg = {
//     job_id: idx
//   }
//   console.log("Filling the queue again!!!");
//   sendToQueue("analysis_respond", msg);
// },50000);


var getQueueStats = function(q){
  var defer = Q.defer();
  //if the user has tried to do something before he instantiated the class. We are going to sliently ignore it.
  if (_instance==null) return defer.promise;
  return _instance.getQueueStats(q);
}

var getQueueMessagesNumber = function(q){
  var defer = Q.defer();
  //if the user has tried to do something before he instantiated the class. We are going to sliently ignore it.
  if (_instance==null) return defer.promise;
  return _instance.getQueueSize(q);
}

module.exports = {
    connect: connect,
    subscribeToQueue:subscribeToQueue,
    sendToQueue:sendToQueue,
    getQueueStats:getQueueStats,
    purgeQueue: purgeQueue,
    getQueueMessagesNumber: getQueueMessagesNumber
}