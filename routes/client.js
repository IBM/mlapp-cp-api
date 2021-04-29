var express = require('express');
var router = express.Router();

var clientRouter = require('./client.route');

router.use('/', clientRouter);

module.exports = router;
