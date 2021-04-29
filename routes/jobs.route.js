var express = require('express');
var router = express.Router();

const ctrl = require('./../controllers/jobs.controller');

router.get('/', ctrl.getAllJobs);
router.get('/:jobId', ctrl.getJobById);
router.post('/create', ctrl.createJob);
router.put('/update/:jobId', ctrl.updateJob);
router.delete('/delete/:jobId', ctrl.deleteJob);
router.get('/get/lastJobOfSchedule/:scheduleId', ctrl.lastJobOfSchedule);
// router.delete('/cancel/:jobId', ctrl.cancelJob);

module.exports = router;