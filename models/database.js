const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_PASSWORD || "admin",
        database: process.env.RDS_DB_NAME || "admin testing",
        port: process.env.RDS_PORT || 5432,
        // ssl: {
        //     require: true,
        //     rejectUnauthorized: false
        // }
    },
    pool: { min: 0, max: 7 },
});


module.exports = knex;
