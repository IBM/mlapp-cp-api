
exports.up = function(knex) {
    return new Promise((resolve, reject) => {
        knex.select('*').from('target').limit(1).then(function(exists) {
            if (!exists.length) {
                knex.schema.dropTableIfExists('target').then(function(){
                    knex.schema.createTable('target', function(t) {
                        t.timestamp('timestamp').notNullable()
                        t.uuid('model_id').notNullable()
                        t.uuid('forecast_id').nullable()
                        t.string('index').notNullable()
                        t.float('y_true').nullable()
                        t.float('y_hat').nullable()
                        t.integer('type').notNullable()
                        t.primary(['model_id', 'forecast_id', 'index', 'type'])
                    }).then(function(){ resolve()});
                })
            }
            else{
                knex.schema.table('target', function (table) {
                    table.timestamp('timestamp');
                    table.uuid('forecast_id');
                }).then(function(){ resolve()})
            }
        })
    })
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table('target', function (table) {
            table.dropColumn('timestamp');
            table.dropColumn('forecast_id');
        })
    ]); 
};
