const express = require('express'); // Core
const bodyParser = require('body-parser'); // NPM
const session = require('express-session'); // NPM
const cookieParser = require('cookie-parser'); // NPM
const routes = require('./routes/index'); // Links to index.js
const path = require('path'); // Core
require('dotenv').config(); // Initialize dotenv once

// Import knex from database.js to access the database
const knex = require('./models/database'); // Connects to database.js

const app = express(); 

// Middleware
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); // Serving public folder for CSS, JS, etc.
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serving the new images folder

// Sessions and Cookies
app.use(cookieParser());
app.use(session({
    secret: 'yourSecretKey', // Replace with a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Secure cookies only in production
}));

// Routes
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
