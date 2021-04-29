var express = require('express');
var router = express.Router();

const ctrl = require('./../controllers/target.controller');

router.get('/:assetName/:assetLabel/:typeId', ctrl.getByAssetNameAndType);

module.exports = router;