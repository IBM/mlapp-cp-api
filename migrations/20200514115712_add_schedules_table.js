exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('schedules', function (t) {
            t.uuid('id').primary()
            t.string('name').notNullable()
            t.json('schedule_conf').notNullable()
            // t.integer('intrval').notNullable()
            // t.string('unit').notNullable()
            t.json('config').notNullable()
            // t.timestamps().defaultTo(knex.fn.now())            
        }),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('schedules')
    ]);    
};