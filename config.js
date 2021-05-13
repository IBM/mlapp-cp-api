require('dotenv').config()
/*
Global application configuration file. This file should be modified at the beginning of a new project
*/

// Versioning
var build = "0.1.0";

// Basic information
var appName = "MLAPP Control Panel - API"; 
var appAbv = "mlapp-cp-api"
var domain = "";

// Do not modify information below unless you know what you are doing!
global_config = {
	"app": {
		"name": appName,
		"app_name": appName,
		"app_abbr": appAbv,
		"build": build, // build of this client instance of IBM MetroPulse
		"domain": domain,
	},
	"cors": process.env.CORS.split(','),
	"vue_app": process.env.CORS.split(',')[0],
	"profiles_api": {
		"key_path": process.env.PROFILE_KEY_PATH,
		"cert_path": process.env.PROFILE_CERT_PATH,		
		"client_id": process.env.PROFILE_CLIENT_ID,
		"client_secret": process.env.PROFILE_CLIENT_SECRET,
		"userExpirationSeconds": 24 * 60 * 60
	},
	"openid_config": {
		client_id: process.env.OIDC_CLIENT_ID,
		client_secret: process.env.OIDC_CLIENT_SECRET,
		authorization_url: process.env.OIDC_AUTHORIZATION_URL,
		token_url: process.env.OIDC_TOKEN_URL,
		issuer_id: process.env.OIDC_ISSUER_ID,
		callback_url: process.env.OIDC_CALLBACK_URL,
	},
	"database": {
		type: process.env.DB_TYPE,
		settings: (function(){			
			return {
				'knex': {
					"adapter": process.env.DB_ADAPTER,
					"host": process.env.DB_HOST,
					"user": process.env.DB_USER,
					"pass": process.env.DB_PASSWORD,
					"port": process.env.DB_PORT,
					"db": process.env.DB_NAME,
					"ssl": process.env.DB_SSL || false
				},
				'snowflake': {
					"account": process.env.DB_ACCOUNT,
					"user": process.env.DB_USER,
					"password": process.env.DB_PASSWORD,
					"schema": process.env.DB_SCHEMA
				}
			}[process.env.DB_TYPE];			
		})()
	},
	"filestore": {
		type: process.env.FS_TYPE,
		settings: (function(){			
			return {
				'minio': {
					endPoint: process.env.FS_ENDPOINT,
					accessKey: process.env.FS_ACCESSKEY,
					secretKey: process.env.FS_SECRETKEY,
					port: parseInt(process.env.FS_PORT),
					useSSL: false
				},
				'azure-blob': {
					storageAccount: process.env.FS_STORAGE_ACCOUNT,
					storageAccessKey: process.env.FS_ACCESSKEY
				},
				'aws': {
					endPoint: process.env.FS_ENDPOINT,
					accessKey: process.env.FS_ACCESSKEY,
					secretKey: process.env.FS_SECRETKEY,
					port: parseInt(process.env.FS_PORT)
				},
				'ibm-cos-sdk': {
					endpoint: process.env.BOTO_IBM_BOTO3_ENDPOINT,
					apiKeyId: process.env.BOTO_IBM_BOTO3_API_KEY_ID,
					ibmAuthEndpoint: 'https://iam.cloud.ibm.com/identity/token',
					serviceInstanceId: process.env.BOTO_IBM_BOTO3_SERVICE_INSTANCE_ID,
				}
			}[process.env.FS_TYPE];			
		})()
	},
	"message_queue": {
		"type": process.env.MQ_TYPE,
		"analysis_logs": process.env.LOGS_TOPIC || "analysis_logs",
		"send_analysis_topic": {
			"default": process.env.SEND_ANALYSIS_TOPIC || "analysis_general_listen",
			"dev": process.env.SEND_ANALYSIS_TOPIC_DEV || "analysis_general_listen_dev",
			"staging": process.env.SEND_ANALYSIS_TOPIC_STAGING || "analysis_general_listen_staging",
			"prod": process.env.SEND_ANALYSIS_TOPIC_PROD || "analysis_general_listen_prod"
		},
		"response_analysis_topic": process.env.RESPONSE_ANALYSIS_TOPIC || "analysis_respond",
		"custom_topics": process.env.MQ_CUSTOM_TOPICS,
		"settings": (function(){			
			return {
				'rabbitmq': {
					"uri": process.env.MQ_ENDPOINT,
					"cert_64": process.env.MQ_CERT_TEXT
				},
				'servicebus': {
					"endpoint": process.env.MQ_ENDPOINT,

				},
				'kafka': {
					"endpoint": process.env.MQ_ENDPOINT,

				}
			}[process.env.MQ_TYPE];			
		})()
	},
	"email": {
		"type": process.env.EMAIL_TYPE,
		"settings": (function(){			
			return {
				'sendgrid': {
					"mail_api_key": process.env.MAIL_API_KEY
				},
				'gmail': {
					"username": process.env.MAIL_USER,
					"password": process.env.MAIL_PASS
				}
			}[process.env.EMAIL_TYPE];			
		})()
	},
	"session":{
		"type": process.env.SESSION_TYPE,
		"settings": (function(){			
			return {
				'redis': {
					"host": process.env.REDIS_HOST,
					"port": process.env.REDIS_PORT,
					"cert_64": process.env.REDIS_CERT_TEXT,
					"password": process.env.REDIS_PASSWORD,
				}
			}[process.env.SESSION_TYPE];			
		})()
	},
	"client_api_settings": {
		"controller_file": "client.example.controller",
		"base": "/base",
		"clientApis": [
			{type: "get", path: "/endpoint/send-message-no-response/:env?", method: "send_message"},
			{type: "get", path: "/endpoint/send-message/:env?", method: "send_message_await_response"}
		]
	},
	"login_required": process.env.APP_LOGIN_REQUIRED ? (process.env.APP_LOGIN_REQUIRED == "true") : true,
	"is_https": process.env.APP_IS_HTTPS ? (process.env.APP_IS_HTTPS == "true") : false,
	"login_type": process.env.APP_LOGIN_TYPE || "basic",
	"api_call_timeout_ms": 1800000,
	"token": process.env.CLIENT_API_TOKEN,
	"toolchain_secret": process.env.TOOLCHAIN_SECRET,
	"toolchain_api_key": process.env.TOOLCHAIN_API_KEY,
	"staging_pipeline_id": process.env.STAGING_PIPELINE_ID,
	"staging_stage_id": process.env.STAGING_STAGE_ID,
	"production_pipeline_id": process.env.PRODUCTION_PIPELINE_ID,
	"production_stage_id": process.env.PRODUCTION_STAGE_ID
};

module.exports = global_config;