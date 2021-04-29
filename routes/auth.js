var express = require('express');
var router = express.Router();

var authRouter = require('./auth.route');

router.use('/', authRouter);

module.exports = router;
