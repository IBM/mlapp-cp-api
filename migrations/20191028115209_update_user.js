exports.up = function(knex) {
    return Promise.all([
        knex.schema
        .alterTable('users', (table) => {
            table.string('email').nullable().alter();
            table.string('password').nullable().alter();
        }),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema
        .alterTable('users', (table) => {
            table.string('email').notNullable().alter();
            table.string('password').notNullable().alter();
        })
    ]);    
};