var express = require('express');
var router = express.Router();

const ctrl = require('./../controllers/users.controller');

router.get('/', ctrl.getAllUsers);
router.get('/:userId', ctrl.getUserById);
router.get('/:user', ctrl.getUserByUser);
router.post('/create', ctrl.createUser);
router.put('/update/:userId', ctrl.updateUser);
router.delete('/delete/:userId', ctrl.deleteUser);

module.exports = router;