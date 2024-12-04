const knex = require("knex")({
    client: "pg",
    connection: {
        host: "localhost",
        user: "postgres",
        password: "Mmw100701!",
        database: "PHOTOPROJECT",
        port: 5433
    }
});

module.exports = knex;
