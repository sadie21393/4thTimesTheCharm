const express = require('express');
const router = express.Router();
const pool = require('../models/database');

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

module.exports = router;
