const knex = require('knex')(require('./../../knexfile'))

let store = {
    getAllTemplates () {
      return knex.select().from('templates');
    },
    getTemplateByName(name) {
      return knex.select().from('templates').where('name', name);
    },
    createTemplate (template) {
      return knex('templates').insert(template);
    },
    updateTemplate (id, template) {
      return knex('templates').where('id', id).update(template);
    },
    deleteTemplate(id) {
      console.log(id);
      return knex('templates').where('id', id).del();
    }
}

module.exports = store;