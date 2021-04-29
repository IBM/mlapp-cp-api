var global_config = require('../config');
var bcrypt = require('bcrypt');
const store = require('./../stores/'+global_config["database"].type+'/users.store');
const response = require('../utilities/helpers/response-builder');

const permission_handler = require('./../utilities/handlers/permissions-handler');

var _executeEncrypt = function(password) {
	var salt = bcrypt.genSaltSync(8);
	var hash = bcrypt.hashSync(password, salt);
	return hash;
}

let controller = {

    getAllUsers: function(req, res){
        store.getAllUsers({})
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    getUserById: function(req, res){
        
        let user_id = req.params.userId;

        store.getUserById(user_id)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    getUserByUser: function(req, res){
        
        let user = req.params.user;

        store.getUserByUser(user)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    createUser: async function(req, res) {
        var is_allowed = await permission_handler.checkPermission({resource:"Users", action:"Create", role: req.session.user.role, default: false});
        if (!is_allowed){
            res.sendStatus(401); 
            return;
        }

        let user = req.body;

        user.password = _executeEncrypt(user.password);

        store.createUser(user)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    updateUser: async function(req, res){
        var is_allowed = await permission_handler.checkPermission({resource:"Users", action:"Update", role: req.session.user.role, default: false});
        if (!is_allowed){
            res.sendStatus(401); 
            return;
        }

        let user = req.body;
        let user_id = req.params.userId;

        store.updateUser(user_id, user)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    },

    deleteUser: async function(req, res){
        var is_allowed = await permission_handler.checkPermission({resource:"Users", action:"Delete", role: req.session.user.role, default: false});
        if (!is_allowed){
            res.sendStatus(401); 
            return;
        }

        let user_id = req.params.userId;

        store.deleteUser(user_id)
        .then(response.successClbk(res))
        .catch(response.errorClbk(res));
    }
    
};

module.exports = controller;
