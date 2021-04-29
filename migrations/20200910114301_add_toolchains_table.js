
exports.up = function(knex) {
    return Promise.all([
        knex.schema.dropTableIfExists('toolchains'),

        knex.schema.createTable('toolchains', function (t) {
            t.string('env').notNullable()
            t.string('version').notNullable()
            t.string('updating_to');
            t.timestamp('latest_timestamp').defaultTo(knex.fn.now())
        }),
        
        knex('toolchains').insert(
            [
                {"env": "dev", "version": "1", "updating_to": "1"},
                {"env": "staging", "version": "0", "updating_to": "0"},
                {"env": "prod", "version": "0", "updating_to": "0"},
            ]
        )
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTableIfExists('toolchains')
    ]);
};
