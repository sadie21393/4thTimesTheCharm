const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const routes = require('./routes/index');
const path = require('path');

require('dotenv').config();

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));  // Serving public folder for CSS, JS, etc.
app.use('/images', express.static(path.join(__dirname, 'images')));  // Serving the new images folder

// Session setup
app.use(session({ secret: 'turtle-secret', resave: false, saveUninitialized: true }));

// Routes
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
