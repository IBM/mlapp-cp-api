const knex = require('knex')(require('./../../knexfile'))

let store = {
    getAllModels () {
      return knex.select().from('models_history');
    },
    getSelectedAsBestModelByAssetName (asset_name) {
      return knex.select().from('models_history').where('asset_name', asset_name).orderBy('created_at', 'desc').limit(1);
    },
    getSelectedAsBestModelByAssetNameAndAssetLabel (asset_name, asset_label) {
      return knex.select().from('models_history').where('asset_name', asset_name).where('asset_label', asset_label).orderBy('created_at', 'desc').limit(1);
    },
    createModelHistory (model) {
      return knex('models_history').insert(model);
    }
}

module.exports = store;