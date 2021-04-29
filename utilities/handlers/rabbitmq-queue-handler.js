var rascal = require('rascal')
var broker_for_purge = null;

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

var cert_64 = (global_config.message_queue.settings.cert_64) ? 
    new DataView(toArrayBuffer(Buffer.from(global_config.message_queue.settings.cert_64, 'base64'))) : 
    undefined  

const rascal_config = 
{
    "vhosts": {
        "/": {
            "connection": {
                "url": global_config.message_queue.settings.uri,
                "socketOptions": {
                    "ca": cert_64
                },
                "retry": {
                    "min": 1000,
                    "max": 60000,
                    "factor": 2,
                    "strategy": "exponential"
                }
            },
            exchanges: {
                "amq.topic": {
                    "assert": true,
                    "options": {
                        "durable": true,
                        "persistent": true
                    }
                }
            },
            queues: {
                [global_config.message_queue.send_analysis_topic['default']]: {
                    "assert": true,
                    "options": {
                        "durable": true,
                        "exclusive": false,
                        "persistent": true
                    }
                },
                [global_config.message_queue.send_analysis_topic['dev']]: {
                    "assert": true,
                    "options": {
                        "durable": true,
                        "exclusive": false,
                        "persistent": true
                    }
                },
                [global_config.message_queue.send_analysis_topic['staging']]: {
                    "assert": true,
                    "options": {
                        "durable": true,
                        "exclusive": false,
                        "persistent": true
                    }
                },
                [global_config.message_queue.send_analysis_topic['prod']]: {
                    "assert": true,
                    "options": {
                        "durable": true,
                        "exclusive": false,
                        "persistent": true
                    }
                },
                [global_config.message_queue.response_analysis_topic]: {
                    "assert": true,
                    "options": {
                        "durable": true,
                        "exclusive": false,
                        "persistent": true
                    }
                }
            },
            bindings: {
                "create_jobs_default": {
                    "source": "amq.topic",
                    "destination": global_config.message_queue.send_analysis_topic['default'],
                    "destinationType": "queue",
                    "bindingKey": global_config.message_queue.send_analysis_topic['default']
                },
                "create_jobs_dev": {
                    "source": "amq.topic",
                    "destination": global_config.message_queue.send_analysis_topic['dev'],
                    "destinationType": "queue",
                    "bindingKey": global_config.message_queue.send_analysis_topic['dev']
                },
                "create_jobs_staging": {
                    "source": "amq.topic",
                    "destination": global_config.message_queue.send_analysis_topic['staging'],
                    "destinationType": "queue",
                    "bindingKey": global_config.message_queue.send_analysis_topic['staging']
                },
                "create_jobs_prod": {
                    "source": "amq.topic",
                    "destination": global_config.message_queue.send_analysis_topic['prod'],
                    "destinationType": "queue",
                    "bindingKey": global_config.message_queue.send_analysis_topic['prod']
                },
                "job_run_finished": {
                    "source": "amq.topic",
                    "destination": global_config.message_queue.response_analysis_topic,
                    "destinationType": "queue",
                    "bindingKey": global_config.message_queue.response_analysis_topic
                }
            },
            publications: {
                "create_jobs_default": {
                    vhost: "/",
                    exchange: "amq.topic",
                    routingKey: global_config.message_queue.send_analysis_topic['default'],
                    confirm: false,
                    options: {
                        persistent: true,
                        retry: { delay: 1000 }
                    }
                },
                "create_jobs_dev": {
                    vhost: "/",
                    exchange: "amq.topic",
                    routingKey: global_config.message_queue.send_analysis_topic['dev'],
                    confirm: false,
                    options: {
                        persistent: true,
                        retry: { delay: 1000 }
                    }
                },
                "create_jobs_staging": {
                    vhost: "/",
                    exchange: "amq.topic",
                    routingKey: global_config.message_queue.send_analysis_topic['staging'],
                    confirm: false,
                    options: {
                        persistent: true,
                        retry: { delay: 1000 }
                    }
                },
                "create_jobs_prod": {
                    vhost: "/",
                    exchange: "amq.topic",
                    routingKey: global_config.message_queue.send_analysis_topic['prod'],
                    confirm: false,
                    options: {
                        persistent: true,
                        retry: { delay: 1000 }
                    }
                }
            },
            subscriptions: {
                "get_finished_jobs": {
                    vhost: "/",
                    queue: global_config.message_queue.response_analysis_topic,
                    contentType: "application/json",
                    prefetch: 1,
                    retry: { delay: 1000 }
                }
            }
        }
    }
}

async function rascal_produce(env, msg){
    // creating connection
    rascal.Broker.create(rascal_config, (err, broker) => {
        if (err) {
            console.error(err);
            return;
        }
        broker_for_purge = broker;
        broker.on('error', console.error);

        // Publish a message
        broker.publish('create_jobs_' + env, msg, (err, publication) => {
            if (err) return console.log(err)
            publication
                .on('success', function(){
                    // success
                    console.log("Published message to RabbitMQ");
                })
                .on('error', console.error)
        })
    })
}

var sendToQueue = function(env, msg){
    rascal_produce(env, msg).catch(console.error);
}

async function rascal_consume(_on_callback){
    // creating connection
    rascal.Broker.create(rascal_config, (err, broker) => {
        if (err) {
            console.error(err);
            return;
        }
      
        broker.on('error', console.error);
        
        // Consume a message
        broker.subscribe('get_finished_jobs', (err, subscription) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log("Started consuming messages from RabbitMQ...");
            subscription
                .on('message', (message, content, ackOrNack) => {
                    console.log(content);
                    _on_callback(content);
                    ackOrNack();
                })
                .on('error', (err) => {
                    console.error('RabbitMQ subscriber error: ' + err)
                })
        })
    })
}

var subscribeToQueue = function(_on_callback){
    rascal_consume(_on_callback).catch(console.error);
}

async function rascal_purge(next) {
    if (broker_for_purge){
        await broker_for_purge.purge(next)
    }
}

var purgeQueue = function(next){
    return rascal_purge(next)
}

module.exports = {
    subscribeToQueue:subscribeToQueue,
    sendToQueue:sendToQueue,
    purgeQueue: purgeQueue
}