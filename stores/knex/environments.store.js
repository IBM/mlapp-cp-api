const knex = require('knex')(require('../../knexfile'))

var Q = require('q');
var _ = require('underscore');
var request = require('request');
const response = require('../../utilities/helpers/response-builder');

let store = {
    getVersions() {
      return knex.select().from('toolchains');
    },
    setVersion(env, version) {
      return knex('toolchains').where('env', env).update({version: version});
    },
    getVersion(env) {
      return knex.select("version").from('toolchains').where('env', env);
    },
    setStatus(env, version) {
      return knex('toolchains').where('env', env).update({updating_to: version});
    }
}


module.exports = store;