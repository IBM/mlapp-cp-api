var global_config = require('../config');

var express = require('express');
var router = express.Router();

const ctrl = require('../controllers/toolchain.controller');

router.use(function(req, res, next){
    var token = req.headers['x-secret-token'];
    if (!token) return res.status(401).send({ message: 'No token provided.' });    
    if (token != global_config.toolchain_secret) return res.status(500).send({ message: 'Failed to authenticate token.' });
    next();
})

router.post('/callback', ctrl.callback);
router.post('/update-dev-status', ctrl.updateDevStatus);

module.exports = router;