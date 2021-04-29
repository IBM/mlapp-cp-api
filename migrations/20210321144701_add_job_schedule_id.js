
exports.up = function(knex) {
    return new Promise((resolve, reject) => {
        knex.schema.table('jobs', function (table) {
            table.string('schedule_id');
        }).then(function(){ resolve()})
    })
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table('jobs', function (table) {
            table.dropColumn('schedule_id');
        })
    ]); 
};
