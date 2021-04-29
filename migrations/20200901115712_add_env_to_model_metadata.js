
exports.up = function(knex) {
    return new Promise((resolve, reject) => {
        knex.select('*').from('analysis_results').limit(1).then(function(exists) {
            if (!exists.length) {
                knex.schema.dropTableIfExists('analysis_results').then(function(){
                    knex.schema.createTable('analysis_results', function (t) {
                        t.uuid('model_id').notNullable()
                        t.string('asset_name').notNullable()
                        t.string('asset_label')
                        t.string('pipeline').notNullable()
                        t.json('properties').notNullable()
                        t.json('metadata').notNullable()
                        t.string('environment')
                        t.timestamp('created_at');
                        t.primary(['model_id'])
                    }).then(function(){ resolve()});
                })
            }
            else{
                knex.schema.table('analysis_results', function (table) {
                    table.string('environment');
                }).then(function(){ resolve()})
            }
        })
    })
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table('analysis_results', function (table) {
            table.dropColumn('environment');
        })
    ]); 
};
