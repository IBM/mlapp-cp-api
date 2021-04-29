var express = require('express');
var router = express.Router();

const ctrl = require('./../controllers/permissions.controller');

router.get('/', ctrl.getUserPermissions);

module.exports = router;