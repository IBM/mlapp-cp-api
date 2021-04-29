exports.up = function(knex) {
    return Promise.all([
        knex.schema
        .alterTable('tasks', (table) => {
            table.timestamp('updated_at').nullable().alter();
        }),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema
        .alterTable('tasks', (table) => {
            table.timestamp('updated_at').notNullable().alter();
        })
    ]);    
};