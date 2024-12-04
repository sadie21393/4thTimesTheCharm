// This is just to make the Database and reference it

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.RDS_HOSTNAME || "awseb-e-pw8hnzdrxw-stack-awsebrdsdatabase-bn9yxkujhjib.cj6qkuuke3n0.us-east-1.rds.amazonaws.com",
        user: process.env.RDS_USERNAME || "intexgroup310",
        password: process.env.RDS_PASSWORD || '12345678',
        database: process.env.RDS_DB_NAME || "turtle_rds",
        port: process.env.RDS_PORT || 5432,
        ssl: false
    }
});

module.exports = knex;
