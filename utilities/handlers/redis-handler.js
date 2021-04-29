
var global_config = require('./../../config');
var Q = require('q');
redis = require("redis");
fs = require("fs");

const ca = global_config.session.settings.cert_64 ? Buffer.from(global_config.session.settings.cert_64, 'base64').toString('utf-8') : undefined;
const tls = { ca };
const password = global_config.session.settings.password;

const redisClient = redis.createClient({
    port: global_config.session.settings.port,
    host: global_config.session.settings.host,
    tls: global_config.session.settings.cert_64 ? tls : undefined,
    password: password,
    retry_strategy:function(options) {
        if (options.error && options.error.code === "ECONNREFUSED") {
          // End reconnecting on a specific error and flush all commands with
          // a individual error
          return new Error("The server refused the connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          // End reconnecting after a specific timeout and flush all commands
          // with a individual error
          return new Error("Retry time exhausted");
        }
        if (options.attempt > 10) {
          // End reconnecting with built in error
          return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
      }
});

redisClient.on('connect', function(msg) {
    console.log("Redis: connected");
});

redisClient.on('error', function(err) {
    console.error("Error: redis connection failed!");
    console.error(err);
});

function set(key, value, expireAfterSeconds) {
    var deferred = Q.defer();

    redisClient.set(key, value, function(error, result) {
        if(!error) {
            if (expireAfterSeconds) {
                redisClient.expireat(key, parseInt((+new Date)/1000) + expireAfterSeconds);
            }
            deferred.resolve(result);
        }
        else {
            deferred.reject(err);
        }
    });

    return deferred.promise;
}

function get(key) {
    var deferred = Q.defer();

    redisClient.get(key, function(error, result) {
        if (error){
            deferred.reject(error);
        }
        deferred.resolve(result);
    });

    return deferred.promise;
}

function remove(key) {
    var deferred = Q.defer();

    redisClient.del(key, function(error, result) {
        if (error){
            deferred.reject(error);
        }
        deferred.resolve({result:result});
    });

    return deferred.promise;
}

module.exports = {
    set: set,
    get: get,
    remove: remove
};