var express = require('express');
var router = express.Router();

var toolchainRouter = require('./toolchain.route');

router.use('/', toolchainRouter);

module.exports = router;
