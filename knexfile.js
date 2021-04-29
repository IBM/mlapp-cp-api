var global_config = require('./config')

module.exports = {
    client: global_config['database']['settings']['adapter'],
    connection: { 
        host: global_config['database']['settings']['host'],
        port: global_config['database']['settings']['port'],
        user: global_config['database']['settings']['user'], 
        password: global_config['database']['settings']['pass'], 
        database: global_config['database']['settings']['db'],
        ssl: global_config['database']['settings']['ssl'],
        keepAlive: false,
        connectionTimeoutMillis: 60000,
        keepAliveInitialDelayMillis: 60000,
    },
    // debug: true,
    pool: {
        min: 0,
        max: 50
    },
    useNullAsDefault: true
};

/*
    Migrations:
    - create new migration: `knex migrate:make {{migration_name}`
    - migrate your database schemas to the latest version: `knex migrate:latest`
    - rollback the last batch: `knex migrate:rollback`
    - rollkback all: `knex migrate:rollback --all`
    - migrate up the next migration that hos not yet been run: `knex migrate:up`
    - undo the last migration: `knex migrate:down`

    Seed:
    - run seed file: `knex seed:run`
*/ 