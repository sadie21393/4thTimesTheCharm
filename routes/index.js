const express = require('express');
const router = express.Router();
const pool = require('../models/database');
const knex = require('../models/database.js')

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

router.get('/JenStory', (req, res) => {
    res.render('JenStory'); // This assumes 'JenStory.ejs' exists in the views folder
});

//send request
router.get('/sendRequest', (req, res) => {
    res.render('sendRequest'); // Ensure 'sendRequest.ejs' is in your views folder
});

// Admin dashboard
router.get('/dashboard', async (req, res) => {
    const events = await pool.query('SELECT * FROM Events');
    res.render('admin', { events: events.rows });
});

module.exports = router;

// Admin Home Route
router.get("/admin-home", async (req, res) => {
    try {
      const adminName = "Admin"; // Replace with dynamic admin name if necessary
      res.render("admin-home", { admin_name: adminName });
    } catch (error) {
      console.error("Error rendering admin home:", error);
      res.status(500).send("Internal Server Error");
    }
  });

// Event Requests Route with Tabs
router.get("/admin/admin-event-requests/:tab", (req, res) => {
    const tab = req.params.tab;
    let query = knex("requests as r")
    .join("requeststatus as rs", "r.req_id", "=", "rs.req_id")
      .select(
        'r.req_id',
        'r.req_location',
        'r.req_street_address',
        'r.req_city',
        'r.req_state',
        'r.req_event_date',
        'r.req_event_time',
        'r.req_event_duration',
        'r.num_no_sewing',
        'r.num_basic_sewing',
        'r.num_adv_sewing',
        'r.req_first_name',
        'r.req_last_name',
        'r.req_phone',
        'r.req_email',
        'rs.status'
      )
      .orderBy('r.req_event_date', 'asc'); // Order by event date ascending
  
    if (tab === 'pending') {
      query = query.where("rs.status", "pending");
    } else if (tab === 'all') {
      // No additional filter needed
    } else {
      // If the tab is not recognized, redirect to pending
      return res.redirect('/admin/admin-event-requests/pending');
    }
  
    query.then(eventRequests => {
      res.render("admin-event-requests", { eventRequests, activeTab: tab });
    })
    .catch(error => {
      console.error("Error fetching event requests:", error);
      res.status(500).send("Internal Server Error");
    });
  });
  
// Redirect /admin/admin-event-requests to /admin/admin-event-requests/pending
router.get("/admin/admin-event-requests", (req, res) => {
    res.redirect("/admin/admin-event-requests/pending");
  });

// Approve Event Request
router.post("/admin/admin-event-requests/approve/:id", (req, res) => {
    const id = req.params.id;
    knex("eventrequests")
      .where("reqid", id)
      .update({ status: "approved" })
      .then(() => res.redirect("/admin/admin-event-requests/pending"))
      .catch(error => {
        console.error("Error approving request:", error);
        res.status(500).send("Internal Server Error");
      });
  });
  
// Deny Event Request
router.post("/admin/admin-event-requests/deny/:id", (req, res) => {
    const id = req.params.id;
    knex("eventrequests")
      .where("reqid", id)
      .update({ status: "denied" })
      .then(() => res.redirect("/admin/admin-event-requests/pending"))
      .catch(error => {
        console.error("Error denying request:", error);
        res.status(500).send("Internal Server Error");
      });
  });
  
// Events Route
router.get("/admin/events/:status", (req, res) => {
    const status = req.params.status;
    let query = knex("events as e")
    .join("eventstatus as es", "e.event_id", "=", "es.event_id")
    .select(
        "e.event_id as id",
        "event_location",
        "event_date as date",
        "status"
      )
      .orderBy('event_date', 'asc');
  
    if (status !== 'all') {
      query = query.where("status", status);
    }
  
    query.then(events => {
      res.render("events", { events, activeTab: status });
    })
    .catch(error => {
      console.error("Error fetching events:", error);
      res.status(500).send("Internal Server Error");
    });
  });
  
// Redirect /admin/events to /admin/events/upcoming
router.get("/admin/events", (req, res) => {
    res.redirect("/admin/events/upcoming");
  });

// Team Members Route
router.get("/admin/team-members", (req, res) => {
    knex("users")
      .select(
        "user_name as user_name",
        "first_name as first_name",
        "last_name as last_name",
        "email as email",
        "role as role"
      )
      .then(teamMembers => {
        res.render("team-members", { teamMembers });
      })
      .catch(error => {
        console.error("Error fetching team members:", error);
        res.status(500).send("Internal Server Error");
      });
  });