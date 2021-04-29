const knex = require('knex')(require('../../knexfile'))

let store = {
  getPermissionDefaults () {
      return knex.select().from('permission_defaults');
  },
  getUserPermissions (role) {
    return knex.select('resource','action','allow').from('permission_defaults').where("role",role);
  }
}

module.exports = store;