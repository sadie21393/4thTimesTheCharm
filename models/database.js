const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        database: process.env.RDS_DB_NAME,
        port: process.env.RDS_PORT || 5432,
        ssl: {
            require: true,
            rejectUnauthorized: false
          }
    }
});

module.exports = knex;
