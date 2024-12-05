const express = require('express');
const router = express.Router();
const knex = require('../models/database');
const jwt = require('jsonwebtoken');

// Landing page
router.get('/', (req, res) => res.render('index')); //This one worked v8

// Volunteer form
// router.get('/volunteer', (req, res) => {
//     res.render('volunteer'); 
// });


// router.post('/volunteer', async (req, res) => {
//     const { name, email, level, hours } = req.body;
//     await pool.query('INSERT INTO Volunteers (name, email, level, hours) VALUES ($1, $2, $3, $4)', [name, email, level, hours]);
//     res.redirect('/');
// });

// Event request form
// router.get('/event-request', (req, res) => res.render('event-request'));
// router.post('/event-request', async (req, res) => {
//     const { contactName, email, date, type } = req.body;
//     await pool.query('INSERT INTO EventRequests (contact_name, email, event_date, event_type) VALUES ($1, $2, $3, $4)', [contactName, email, date, type]);
//     res.redirect('/');
// });
// // Donate Page Route
// router.get('/donate', (req, res) => {
//     res.render('donate'); // Ensure this matches the file name of your Donate Page (donate.ejs)
// });

// // One-Time Donation Route
// router.get('/donate/one-time', (req, res) => {
//     res.send('Thank you for your support!'); // Placeholder for one-time donation logic
// });

// // Monthly Donation Route
// router.get('/donate/monthly', (req, res) => {
//     res.send('Thank you for setting up a monthly donation!'); // Placeholder for monthly donation logic
// });

// // Admin login
// router.get('/admin', (req, res) => res.render('login'));

router.get('/JenStory', (req, res) => { //This one worked v8
    res.render('JenStory'); 
});

// //send request
// router.get('/sendRequest', (req, res) => {
//     res.render('sendRequest'); // Ensure 'sendRequest.ejs' is in your views folder
// });

// // Admin dashboard
// router.get('/dashboard', async (req, res) => {
//     const events = await pool.query('SELECT * FROM Events');
//     res.render('admin', { events: events.rows });
// });


// // router.get('/index/:id', (req, res) => {
// //     knex('users').select('first_name', 'last_name').where(req.params.id, 'id')
// //     .then(myuser => {
// //         res.render('userpage' {myuser})
// //     })

// // });



// router.post('/login', (req, res) => {
//     // Example authentication check
//     const { username, password } = req.body;
//     knex('users')
//     .where({ username: username, password: password })
//     .first()
//     .then(myuser => {
//         if (myuser) {
//             // User exists and credentials are correct
//             req.session.user = { username: myuser.username }; // Use `myuser` from the DB
//             res.redirect('/userpage');
//         } else {
//             // No matching user found
//             res.status(401).send('Invalid credentials');
//         }
//     })
//     .catch(err => {
//         console.error(err); // Log errors for debugging
//         res.status(500).send('An error occurred while processing your request.');
//     });
// });

// // router.get('/userpage', (req, res) => {
// //     if (req.session.user) {
// //         res.render('userpage', { user: req.session.user });
// //     } else {
// //         res.redirect('/login');
// //     }
// // });

// // router.post('/login', (req, res) => {
// //     const { username, password } = req.body;
// //     if (username === 'user' && password === 'pass') { // Replace with actual auth
// //         const token = jwt.sign({ username }, 'yourSecretKey', { expiresIn: '1h' });
// //         res.cookie('authToken', token, { 
// //             httpOnly: true, 
// //             secure: true, 
// //             sameSite: 'Strict' 
// //         }); // Store in a cookie
// //         res.redirect('/userpage');
// //     } else {
// //         res.status(401).send('Invalid credentials');
// //     }
// // });



// // router.get('/userpage', (req, res) => {
// //     const token = req.cookies.authToken;

// //     if (!token) return res.redirect('/login');

// //     try {
// //         const user = jwt.verify(token, 'yourSecretKey');
// //         res.render('userpage', { user });
// //     } catch (err) {
// //         res.clearCookie('authToken');
// //         res.redirect('/login');
// //     }
// // });

// // Admin Home Route
// router.get("/admin-home", async (req, res) => {
//     try {
//         const user = jwt.verify(token, 'yourSecretKey');
//         res.render('userpage', { user });
//     } catch (err) {
//         res.clearCookie('authToken');
//         res.redirect('/login');
//     }
// });



// Admin Home Route
// router.get("/admin-home", async (req, res) => {
//     try {
//       const adminName = "Admin"; // Replace with dynamic admin name if necessary
//       res.render("admin-home", { admin_name: adminName });
//     } catch (error) {
//       console.error("Error rendering admin home:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   });

// Event Requests Route with Tabs
// router.get("/admin/admin-event-requests/:tab", (req, res) => {
//     const tab = req.params.tab;
//     let query = knex("requests as r")
//     .join("requeststatus as rs", "r.req_id", "=", "rs.req_id")
//       .select(
//         'r.req_id',
//         'r.req_location',
//         'r.req_street_address',
//         'r.req_city',
//         'r.req_state',
//         'r.req_event_date',
//         'r.req_event_time',
//         'r.req_event_duration',
//         'r.num_no_sewing',
//         'r.num_basic_sewing',
//         'r.num_adv_sewing',
//         'r.req_first_name',
//         'r.req_last_name',
//         'r.req_phone',
//         'r.req_email',
//         'rs.status'
//       )
//       .orderBy('r.req_event_date', 'asc'); // Order by event date ascending
  
//     if (tab === 'pending') {
//       query = query.where("rs.status", "pending");
//     } else if (tab === 'all') {
//       // No additional filter needed
//     } else {
//       // If the tab is not recognized, redirect to pending
//       return res.redirect('/admin/admin-event-requests/pending');
//     }
  
//     query.then(eventRequests => {
//       res.render("admin-event-requests", { eventRequests, activeTab: tab });
//     })
//     .catch(error => {
//       console.error("Error fetching event requests:", error);
//       res.status(500).send("Internal Server Error");
//     });
//   });
  
// // Redirect /admin/admin-event-requests to /admin/admin-event-requests/pending
// router.get("/admin/admin-event-requests", (req, res) => {
//     res.redirect("/admin/admin-event-requests/pending");
//   });

// // Approve Event Request
// router.post("/admin/admin-event-requests/approve/:id", (req, res) => {
//     const id = req.params.id;
//     knex("eventrequests")
//       .where("reqid", id)
//       .update({ status: "approved" })
//       .then(() => res.redirect("/admin/admin-event-requests/pending"))
//       .catch(error => {
//         console.error("Error approving request:", error);
//         res.status(500).send("Internal Server Error");
//       });
//   });
  
// // Deny Event Request
// router.post("/admin/admin-event-requests/deny/:id", (req, res) => {
//     const id = req.params.id;
//     knex("eventrequests")
//       .where("reqid", id)
//       .update({ status: "denied" })
//       .then(() => res.redirect("/admin/admin-event-requests/pending"))
//       .catch(error => {
//         console.error("Error denying request:", error);
//         res.status(500).send("Internal Server Error");
//       });
//   });
  
// // Events Route
// router.get("/admin/events/:status", (req, res) => {
//     const status = req.params.status;
//     let query = knex("events as e")
//     .join("eventstatus as es", "e.event_id", "=", "es.event_id")
//     .select(
//         "e.event_id as id",
//         "event_location",
//         "event_date as date",
//         "status"
//       )
//       .orderBy('event_date', 'asc');
  
//     if (status !== 'all') {
//       query = query.where("status", status);
//     }
  
//     query.then(events => {
//       res.render("events", { events, activeTab: status });
//     })
//     .catch(error => {
//       console.error("Error fetching events:", error);
//       res.status(500).send("Internal Server Error");
//     });
//   });
  
// // Redirect /admin/events to /admin/events/upcoming
// router.get("/admin/events", (req, res) => {
//     res.redirect("/admin/events/upcoming");
//   });

// // Team Members Route
// router.get("/admin/team-members", (req, res) => {
//     knex("users")
//       .select(
//         "user_name as user_name",
//         "first_name as first_name",
//         "last_name as last_name",
//         "email as email",
//         "role as role"
//       )
//       .then(teamMembers => {
//         res.render("team-members", { teamMembers });
//       })
//       .catch(error => {
//         console.error("Error fetching team members:", error);
//         res.status(500).send("Internal Server Error");
//       });
//   });




//   THIS NEEDS TO BE AT THE BOTTOM 
module.exports = router;