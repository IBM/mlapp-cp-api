var express = require('express');
var router = express.Router();

const ctrl = require('../controllers/environments.controller');

router.get('/', ctrl.getVersions);
router.post('/change-staging-version', ctrl.changeStagingVersion);

module.exports = router;