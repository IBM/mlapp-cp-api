var Q = require("q");
var kafka = require('kafka-node'),
Producer = kafka.Producer;
Consumer = kafka.Consumer; 
const jobs_store = require('./../../stores/'+global_config["database"].type+'/jobs.store');

var producer = null;
var consumer = null;
var worker_listen_topics_consumer = null;
var _instance = null;
var client = null;
var client2 = null;

var connect = function() {
    _instance = new kafka.KafkaClient({kafkaHost: global_config.message_queue.settings.endpoint}),    

    producer = new kafka.HighLevelProducer(_instance);  
    // The 'ready' event is emitted when the Producer is ready to send messages
    producer.on('ready', function (arg) {
      // Log Metadata once Producer connects to Kafka Cluster
      console.log("ready");
    });

    // Connecting the producer to the Kafka Cluster
    producer.connect({}, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Connected to broker');
    });    

}

var subscribeToQueue = function(queue, callback) {    
    if (queue == "analysis_respond"){
      client = _instance;
      client.on('ready', function() {
      
        client.createTopics(
          [
            {
              topic: queue,
              partitions: 1,
              replicationFactor: 1    
            }
          ], (error, result) => {

          consumer = new Consumer(client, [{ topic: queue, partition: 0 }]);
          
          consumer.on("message", function(message) {
            // var obj = JSON.parse(message.value);          
            // console.log("delete message:"+obj.job_id);  
            callback(message.value);
          });             
        });
      });

      client2 = new kafka.KafkaClient({kafkaHost: global_config.message_queue.settings.endpoint}),    

      client2.on('ready', function() {
        
        client2.topicExists(['analysis_general_listen','analysis_forecast_listen'],function(err){
          if (!err){
            init_topics();
          }
        })
        
        client2.createTopics(
          [
            {
              topic: "analysis_general_listen"
            }
          ], (error, result) => {
            init_topics();
        });
      });

    }
    else{
      worker_listen_topics_consumer.resume();
      setTimeout(function(){
        worker_listen_topics_consumer.pause();
      },500);
    }
}

function init_topics(){
  worker_listen_topics_consumer = new Consumer(client2, [{ topic: "analysis_general_listen", partition: 0 },{ topic: "analysis_forecast_listen", partition: 0 }], {groupId: 'my_group', autoCommit: true});
 
  // worker_listen_topics_consumer.fetchOffset(worker_listen_topics_consumer.payloads,function(err,res){      
  //   worker_listen_topics_consumer.setOffset("analysis_general_listen", 0, 2087);

  // })

  worker_listen_topics_consumer.on("message", function(message) {
    try{
      console.log("offset",message.offset);
      var obj = JSON.parse(message.value);
      console.log("delete message:"+obj.job_id);            
      //callback(message.value);
    }
    catch(e){
    }            
  });   
  worker_listen_topics_consumer.pause();
}

function sendToQueue(queue, msg) {
  var payloads = [
    { topic: queue, messages: msg },
  ];

  producer.send(payloads, function (err, data) {
    // console.log(data); 
  });
}

var purgeQueue = function(queue){
  var defer = Q.defer();
  worker_listen_topics_consumer.resume();
  setTimeout(function(){
    worker_listen_topics_consumer.pause();
    defer.resolve();
  },500);
  return defer.promise;
}

var getQueueStats = function(q){
  var defer = Q.defer();
  //if the user has tried to do something before he instantiated the class. We are going to sliently ignore it.
  if (_instance==null) return defer.promise;
  return _instance.getQueueStats(q);
}

var getQueueMessagesNumber = function(q){
  var defer = Q.defer();
  var is_forecast = (q == "analysis_forecast_listen") ? true : false;
  jobs_store.getPendingJobs().then(function(response){
    var total = 0;
    for (var i=0;i<response.length;i++){
      if (is_forecast){
        if (response[i].data[0].pipeline == "forecast"){
          total++;
        }  
      }
      else if (!is_forecast){
        if (response[i].data[0].pipeline != "forecast"){
          total++;
        } 
      }
    }
    // console.log(is_forecast?"Forecast":"General",total);
    defer.resolve(total);
  });
  return defer.promise;
}

var closeConnection = function(callback) {    
  // keep only analasis response queue
  var deferred = Q.defer(); 
  deferred.resolve();
  return deferred.promise; 
}

module.exports = {
    connect: connect,
    subscribeToQueue:subscribeToQueue,
    sendToQueue:sendToQueue,
    getQueueStats:getQueueStats,
    purgeQueue: purgeQueue,
    getQueueMessagesNumber: getQueueMessagesNumber,
    closeConnection: closeConnection
}