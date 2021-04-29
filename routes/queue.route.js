var express = require('express');
var router = express.Router();

const ctrl = require('./../controllers/queue.controller');

router.post('/send', ctrl.sendMessage);
router.post('/toolchain-send', ctrl.toolchainSendMessage);
router.post('/send-batch', ctrl.sendMessagesBatch);
router.post('/config-generator', ctrl.configGenerator);
router.get('/stats', ctrl.getStats);
router.post('/purge', ctrl.purge);
// router.get('/get-queue-messages-number', ctrl.getQueueMessagesNumber);
router.post('/upload', ctrl.upload);

module.exports = router;