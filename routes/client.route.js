var global_config = require('../config');

var express = require('express');
var router = express.Router();

const ctrl = require('./../controllers/'+global_config.client_api_settings.controller_file);

router.use(function(req, res, next){
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ message: 'No token provided.' });    
    if (token != global_config.token) return res.status(500).send({ message: 'Failed to authenticate token.' });
    next();
})

for (var i=0;i<global_config.client_api_settings.clientApis.length;i++){
    var curr_api = global_config.client_api_settings.clientApis[i];
    router[curr_api.type](curr_api.path, ctrl[curr_api.method]);
}


module.exports = router;