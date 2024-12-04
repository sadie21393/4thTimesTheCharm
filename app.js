const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const routes = require('./routes/index');
const path = require('path');

// Import knex from database.js to access the database
// const knex = require('./models/database');
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : process.env.RDS_HOSTNAME || "awseb-e-pw8hnzdrxw-stack-awsebrdsdatabase-bn9yxkujhjib.cj6qkuuke3n0.us-east-1.rds.amazonaws.com",
      user : process.env.RDS_USERNAME || "intexgroup310",
      password : process.env.RDS_PASSWORD || '12345678', 
      database : process.env.RDS_DB_NAME || "turtle_rds", // Ensure this matches your database name
      port : process.env.RDS_PORT || 5432,
    //   ssl : process.env.DB_SSL ? { rejectUnauthorized : false } : false
      ssl : false
    }
})

module.exports = knex;

require('dotenv').config();

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));


// Serve static files

app.use(express.static(path.join(__dirname, 'public')));  // Serving public folder for CSS, JS, etc.
app.use('/images', express.static(path.join(__dirname, 'images')));  // Serving the new images folder

// Session setup
app.use(session({ secret: 'turtle-secret', resave: false, saveUninitialized: true }));
app.set("views", path.join(__dirname, "views"));

// Example usage of knex to check if the database is connected
// knex.raw('SELECT 1+1 AS result')
//     .then(() => console.log("Database connected successfully"))
//     .catch(err => console.error("Error connecting to the database: ", err));

// Routes
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
