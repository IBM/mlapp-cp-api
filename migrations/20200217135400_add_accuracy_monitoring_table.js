exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('asset_accuracy_monitoring', function (t) {
            t.uuid('model_id').notNullable()
            t.string('asset_name').notNullable()
            t.string('asset_label_name').notNullable()
            t.timestamps()            
            t.timestamp('timestamp').defaultTo(knex.fn.now())
            t.json('model_accuracy').notNullable()
        }),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('asset_accuracy_monitoring')
    ]);    
};