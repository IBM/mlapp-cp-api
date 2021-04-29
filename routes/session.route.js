var express = require('express');
var router = express.Router();

const ctrl = require('../controllers/session.controller');

router.get('/get/:job_id', ctrl.get);

module.exports = router;