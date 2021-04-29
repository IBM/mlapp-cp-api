var express = require('express');
var router = express.Router();

const ctrl = require('./../controllers/templates.controller');

router.get('/', ctrl.getAllTemplates);
router.get('/:name', ctrl.getTemplateByName);
router.post('/create', ctrl.createTemplate);
router.put('/update/:name', ctrl.updateTemplate);
router.delete('/delete/:name', ctrl.deleteTemplate);

module.exports = router;