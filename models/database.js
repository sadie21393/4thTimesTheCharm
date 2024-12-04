require('dotenv').config();

const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD || '12345678',
        database: process.env.RDS_DB_NAME,
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
    }
});

// Test database connection
knex.raw('SELECT 1')
    .then(() => console.log('Database connected successfully!'))
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit the process if DB connection fails
    });

module.exports = knex;
