const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const routes = require('./routes/index');
const path = require('path');

// Import knex from database.js to access the database
const knex = require('./models/database');

require('dotenv').config();

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'turtle-secret', resave: false, saveUninitialized: true }));

// Example usage of knex to check if the database is connected
knex.raw('SELECT 1+1 AS result')
    .then(() => console.log("Database connected successfully"))
    .catch(err => console.error("Error connecting to the database: ", err));

// Routes
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
