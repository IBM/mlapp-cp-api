var global_config = require('../../config');

var _ = require('underscore');  
var Q = require('q');
const store = require('./../../stores/'+global_config["database"].type+'/permissions.store');

var getUserPermissions = async function(role) {
    var permissions = await store.getUserPermissions(role);
    return permissions;
}

var checkPermission = async function(obj) {
    var permissions = await store.getPermissionDefaults();
    var resource = obj.resource;
    var action = obj.action;
    var role = obj.role;
    if (!resource || !action || !role) { return false; };

    var allow = obj.default;
    for (var i=0;i<permissions.length;i++){
        // look for permission rule
        if (permissions[i].role == role && permissions[i].resource == resource && permissions[i].action == action){
            allow = permissions[i].allow;
            break;
        }
    }
    
    return allow;
}

module.exports = {
    checkPermission: checkPermission,
    getUserPermissions: getUserPermissions
};