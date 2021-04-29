var express = require('express');
var router = express.Router();

const ctrl = require('./../controllers/accuracyMonitoring.controller');

router.get('/search/:search', ctrl.searchAccuracyMonitoring);
router.get('/:asset_name/:asset_label?', ctrl.getForecastAccuracyMonitoring);

module.exports = router;