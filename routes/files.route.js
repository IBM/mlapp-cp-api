var express = require('express');
var router = express.Router();

const ctrl = require('./../controllers/files.controller');

router.get('/query/:q', ctrl.queryFileStorage);
router.get('/download/:bucket/:key', ctrl.downloadFile);
router.delete('/delete/:assetName', ctrl.deleteFilesOfAsset);

module.exports = router;