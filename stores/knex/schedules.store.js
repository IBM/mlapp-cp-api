const knex = require('knex')(require('../../knexfile'))

let store = {
    getAllSchedules () {
      return knex.select().from('schedules');
    },

    getScheduleById (id) {
      return knex.select().from('schedules').where('id', id);
    },
    
    createSchedule (conf) {
      return knex('schedules').insert(conf);
    },
    updateSchedule (conf) {
      return knex('schedules').where('id', conf.id).update(conf);
    },
    deleteSchedule (id) {
      return knex('schedules').where('id', id).del();
    }
}

module.exports = store;