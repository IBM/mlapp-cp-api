var Q = require("q");
var Kafka = require('node-rdkafka');
const jobs_store = require('./../../stores/'+global_config["database"].type+'/jobs.store');

// var producer = null;
var consumer = null;
var kafka_strings = ['Consumer', 'Producer'];

var kafka_config = {
  "group.id": global_config.message_queue.settings.group_id,
  "security.protocol": 'SASL_SSL',
  "sasl.mechanisms": "GSSAPI",
  "metadata.broker.list":  global_config.message_queue.settings.brokers,
  "ssl.ca.location":  global_config.message_queue.settings.ca_location,
  "sasl.kerberos.service.name": 'kafka',
  "sasl.kerberos.principal":  global_config.message_queue.settings.principal,
  "sasl.kerberos.keytab":  global_config.message_queue.settings.keytab,
  "auto.offset.reset": "beginning",
  "enable.auto.commit": true
}

var connect = function() {
  consumer = new Kafka.KafkaConsumer(kafka_config);

  consumer.on('ready', function (arg) {
    console.log(arg['name'] + " is ready!");
  });

  //logging debug messages, if debug is enabled
  consumer.on('event.log', function(log) {
    console.log(log);
  });

  //logging all errors
  consumer.on('event.error', function(err) {
    console.error('Error from ' + consumer);
    console.error(err);
  });
}

var subscribeToQueue = function(queue, callback) {  
  consumer.connect();
  consumer.on('ready', function(arg) {
    console.log('consumer ready.' + JSON.stringify(arg));
  
    consumer.subscribe([queue]);
    //start consuming messages
    consumer.consume();

    consumer.on('data', function(m) {
      console.log(JSON.stringify(m));
      callback(JSON.parse(m.value.toString()));
    });
  });
}

function sendToQueue(queue, msg) {
  var producer = new Kafka.HighLevelProducer(kafka_config);

  // Throw away the keys
  producer.setKeySerializer(function(v) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(null);
      }, 20);
    });
  });

  // Take the message field
  producer.setValueSerializer(function(v) {
    return Buffer.from(v.message);
  });

  try{ 
    producer.connect(null, function() {
      try {
        producer.produce(queue, null, {message: msg}, null, Date.now(), function(err, offset){
          console.log(err);
          setImmediate(function() {
            producer.disconnect();
          });
        });
      } catch (e) {
          console.log(e);
      }
    });
  }
  catch (e){
    console.log(e);
  }
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

module.exports = {
    connect: connect,
    subscribeToQueue:subscribeToQueue,
    sendToQueue:sendToQueue,
    getQueueStats:getQueueStats,
    purgeQueue: purgeQueue,
    getQueueMessagesNumber: getQueueMessagesNumber
}