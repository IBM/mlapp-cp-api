const { DateTime } = require('mssql');

const knex = require('knex')(require('./../../knexfile'))

let store = {
    getAllJobs ({}) {
      return knex.select().from('jobs');
    },
    getJobById(job_id) {
      return knex.select().from('jobs').where('id', job_id);
    },
    getLastJobByscheduleId(schedule_id) {
      return knex.select().from('jobs').where('schedule_id', schedule_id).whereNot('updated_at', null).orderBy('updated_at', 'desc').first();
    },
    createJob (job) {
      return knex('jobs').insert(job);
    },
    updateJob (job_id, job) {
      return knex('jobs').where('id', job_id).update(job);
    },
    deleteJob(job_id) {
      return knex('jobs').where('id', job_id).del();
    },
    manualPurge(){
      return knex('jobs').where('status_code', 0).update({
        status_code: -1,
        status_msg: 'manually stopped',
        updated_at: new Date()
      });
    },
    getPendingJobs(){
      return knex('jobs').where('status_code', '0');
    },
    cancelRunningJobs() {
      return knex('jobs').where('status_code', 1).update({
        status_code: -1,
        status_msg: 'manually stopped',
        updated_at: new Date()
      });
    },
}

module.exports = store;