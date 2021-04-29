var express = require('express');
var router = express.Router();


const ctrl = require('./../controllers/models.controller');

router.get('/', ctrl.getAllModels);
router.get('/names', ctrl.getAllAssetNames);
router.get('/labels/:assetName', ctrl.getAssetLabel);
router.get('/stats/:assetName/:assetLabel', ctrl.getModelStats);
// router.get('/:modelId', ctrl.getModelById);
router.get('/models/:pipeline', ctrl.getModelsByPipeline);
router.post('/create', ctrl.createModel);
router.put('/update/:modelId', ctrl.updateModel);
router.delete('/delete/:modelId', ctrl.deleteModel);
//models history
router.post('/select_model', ctrl.selectModel);
router.get('/models_history', ctrl.getAllModelsHistory);
router.get('/models/asset/:assetName', ctrl.getModelsByAssetName);
router.get('/models/selected/:assetName', ctrl.getSelectedModelByAssetName);

module.exports = router;