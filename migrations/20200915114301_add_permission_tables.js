
exports.up = function(knex) {
    return Promise.all([

        knex.schema.dropTableIfExists('permission_defaults'),
        knex.schema.createTable('permission_defaults', function (t) {
            t.increments('id')
            t.string('role')
            t.string('resource')
            t.string('action')
            t.boolean('allow').notNullable()
        }),

        knex('permission_defaults').insert(
            [
                {"role": "user", "resource": "Users", "action": "View", "allow": 1},
                {"role": "user", "resource": "Users", "action": "Create", "allow": 0},
                {"role": "user", "resource": "Users", "action": "Update", "allow": 0},
                {"role": "user", "resource": "Users", "action": "Delete", "allow": 0},
                {"role": "admin", "resource": "Users", "action": "View", "allow": 1},
                {"role": "admin", "resource": "Users", "action": "Create", "allow": 1},
                {"role": "admin", "resource": "Users", "action": "Update", "allow": 1},
                {"role": "admin", "resource": "Users", "action": "Delete", "allow": 1},
            ]
        ),

        // knex.schema.dropTableIfExists('permission_values'),
        // knex.schema.createTable('permission_values', function (t) {
        //     t.increments('id')
        //     t.integer('user_id')
        //     t.integer('resource')
        //     t.integer('action')
        //     t.boolean('is_allowed').notNullable()
        //     t.timestamps()
        // }),

        knex.schema.table('users', function (table) {
            table.string('role').default("user");
        }).then(() => {
            return knex('users').where('iui', '1').update({
                role: 'admin',
            });
        })
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTableIfExists('permission_defaults'),
        // knex.schema.dropTableIfExists('permission_values'),    
        knex.schema.table('users', function (table) {
            table.dropColumn('role');
        })
    ]);
};
