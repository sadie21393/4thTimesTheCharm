const express = require('express');
const router = express.Router();
const pool = require('../models/database');
const jwt = require('jsonwebtoken');
const knex = require('../models/database');

// Landing page
router.get('/', (req, res) => res.render('index'));

// Volunteer form
router.get('/volunteer', (req, res) => res.render('volunteer'));
router.post('/volunteer', async (req, res) => {
    const { name, email, level, hours } = req.body;
    await pool.query('INSERT INTO Volunteers (name, email, level, hours) VALUES ($1, $2, $3, $4)', [name, email, level, hours]);
    res.redirect('/');
});

// Event request form
router.get('/event-request', (req, res) => res.render('event-request'));
router.post('/event-request', async (req, res) => {
    const { contactName, email, date, type } = req.body;
    await pool.query('INSERT INTO EventRequests (contact_name, email, event_date, event_type) VALUES ($1, $2, $3, $4)', [contactName, email, date, type]);
    res.redirect('/');
});

// Admin login
router.get('/admin', (req, res) => res.render('login'));

// Admin dashboard
router.get('/dashboard', async (req, res) => {
    const events = await pool.query('SELECT * FROM Events');
    res.render('admin', { events: events.rows });
});


// router.get('/index/:id', (req, res) => {
//     knex('users').select('first_name', 'last_name').where(req.params.id, 'id')
//     .then(myuser => {
//         res.render('userpage' {myuser})
//     })

// });



router.post('/login', (req, res) => {
    // Example authentication check
    const { username, password } = req.body;
    knex('users')
    .where({ username: username, password: password })
    .first()
    .then(myuser => {
        if (myuser) {
            // User exists and credentials are correct
            req.session.user = { username: myuser.username }; // Use `myuser` from the DB
            res.redirect('/userpage');
        } else {
            // No matching user found
            res.status(401).send('Invalid credentials');
        }
    })
    .catch(err => {
        console.error(err); // Log errors for debugging
        res.status(500).send('An error occurred while processing your request.');
    });
});

// router.get('/userpage', (req, res) => {
//     if (req.session.user) {
//         res.render('userpage', { user: req.session.user });
//     } else {
//         res.redirect('/login');
//     }
// });

// router.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     if (username === 'user' && password === 'pass') { // Replace with actual auth
//         const token = jwt.sign({ username }, 'yourSecretKey', { expiresIn: '1h' });
//         res.cookie('authToken', token, { 
//             httpOnly: true, 
//             secure: true, 
//             sameSite: 'Strict' 
//         }); // Store in a cookie
//         res.redirect('/userpage');
//     } else {
//         res.status(401).send('Invalid credentials');
//     }
// });



// router.get('/userpage', (req, res) => {
//     const token = req.cookies.authToken;

//     if (!token) return res.redirect('/login');

//     try {
//         const user = jwt.verify(token, 'yourSecretKey');
//         res.render('userpage', { user });
//     } catch (err) {
//         res.clearCookie('authToken');
//         res.redirect('/login');
//     }
// });

module.exports = router;