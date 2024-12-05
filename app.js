// ==============================
/* 1. Import Required Modules */
// ==============================
const express = require('express'); 
const bodyParser = require('body-parser'); 
const session = require('express-session'); 
const routes = require('./routes/index'); 
const path = require('path'); // Core
const flash = require("connect-flash");

const dotenv = require("dotenv");
// Import knex from database.js to access the database
const knex = require('./models/database'); // Connects to database.js
const cron = require("node-cron");
const { DateTime } = require("luxon");

// ==============================
/* 2. Load Environment Variables */
// ==============================
dotenv.config();

// ==============================
/* 4. Initialize Express App */
// ==============================

const app = express(); 
const PORT = process.env.PORT || 3000;

// ==============================
/* 5. Middleware Setup */
// ==============================

// Set the view engine to EJS
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse JSON and form data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); // Serving public folder for CSS, JS, etc.
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serving the new images folder

// Configure Express-Session Middleware
app.use(
    session({
      secret: process.env.SESSION_SECRET || "your_default_secret", // Use a secure secret in production
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production", // Set to true in production (requires HTTPS)
        httpOnly: true, // Mitigate XSS attacks
        sameSite: "lax", // CSRF protection
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
);

// Initialize Connect-Flash Middleware
app.use(flash());

// Middleware to Make Flash Messages Available in All Templates
app.use((req, res, next) => {
    res.locals.success_messages = req.flash("success");
    res.locals.error_messages = req.flash("error");
    next();
});

// Middleware to Make Luxon's DateTime Available in EJS Templates
app.use((req, res, next) => {
    res.locals.DateTime = DateTime;
    next();
});

// Authentication Middleware
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

// ==============================
/* 6. Routes */
// ==============================

// Routes (use '/' for general and admin routes)
app.use('/', routes);

// Example of Protecting Routes with `isAuthenticated`
app.use('/admin', isAuthenticated, routes); // This makes sure any routes under `/admin` are protected.

// Error Handling Middleware
app.use((req, res) => res.status(404).render('404', { message: 'Page Not Found' }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Internal Server Error' });
});

// ==============================
/* 7. Start Server */
// ==============================

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
