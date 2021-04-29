var global_config = require('../config');
const store = require('./../stores/'+global_config["database"].type+'/permissions.store');
const response = require('../utilities/helpers/response-builder');

let controller = {

    getUserPermissions: function(req, res){
        if (req && req.session && req.session.user && req.session.user.role)
            store.getUserPermissions(req.session.user.role)
            .then(response.successClbk(res))
            .catch(response.errorClbk(res));
        else{
            response.errorClbk(res)("Error: user doesn't have a session or role.")
        }
    },
    
};

module.exports = controller;
