var express = require('express');
var router = express.Router();

const ctrl = require('../controllers/scheduler.controller');

router.get('/', ctrl.getAllSchedules);
router.post('/set', ctrl.createSchedule);
router.post('/update', ctrl.updateSchedule);
router.post('/delete', ctrl.deleteSchedule);

module.exports = router;