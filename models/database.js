const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_PASSWORD || "goEFYbyu#1",
        database: process.env.RDS_DB_NAME || "turtle",
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
    }
});

// Export knex to be used in other parts of the application
module.exports = knex;
