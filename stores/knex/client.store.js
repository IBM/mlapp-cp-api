const knex = require('knex')(require('./../../knexfile'))

let store = {
//     get_predictions (job_id, model_id, type, order_codes) {
//         // var order_codes_arr_as_strings = order_codes.map(function (order) {
//         //     return "'"+order.toString()+"'"
//         // });
//         // var order_codes_string = '('+order_codes_arr_as_strings.join()+')'
//         return knex.select().from('target').where('job_id', job_id).where('model_id', model_id).where('type', type).whereIn('index', order_codes);
//     },
    get_predictions (forecast_id) {
        return knex.select().from('target').where('forecast_id', forecast_id);
    },
    get_metadata (model_id) {
        return knex.select('metadata').from('analysis_results').where('model_id', model_id);
    }
}

module.exports = store;