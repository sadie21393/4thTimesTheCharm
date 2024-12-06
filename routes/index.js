// ==============================
/* 1. Import Required Modules */
// ==============================
require('dotenv').config();
const express = require('express');
const router = express.Router();
const knex = require('../models/database'); // Database connection
const cron = require('node-cron');
const { DateTime } = require('luxon');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash'); // Flash messages middleware
const nodemailer = require('nodemailer');
const { OpenAI } = require('openai');

// Flash and session middleware configuration (ensure session and flash work properly)
router.use(session({
    secret: 'your-secret-key', // Change this to a secure key
    resave: false,
    saveUninitialized: false,
}));

router.use(flash());

// Attach flash messages to response for easy access in views
router.use((req, res, next) => {
    res.locals.success_messages = req.flash('success');
    res.locals.error_messages = req.flash('error');
    next();
});


//configuration for OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Chatbot Route for handling user messages
router.post('/chatbot', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage || userMessage.trim() === "") {
        return res.status(400).json({ response: "Message cannot be empty" });
    }

    try {
        // Make a request to OpenAI's chat API
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
        });

        // Send the response back
        res.json({ response: response.choices[0].message.content });
    } catch (error) {
        console.error("Error in OpenAI API call:", error);
        res.status(500).send("Something went wrong!");
    }
});

// Login and Logout
// Combined '/login' GET and POST Routes

// Middleware to check if a user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        req.flash("error", "You must be logged in to access this page.");
        return res.redirect('/login');
    }
}

// GET route to render the login page
router.get('/login', (req, res) => {
    res.render('login', { success_messages: req.flash("success"), error_messages: req.flash("error") });
});

// POST route to handle login form submission
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await knex('users').where({ user_name: username }).first();

        if (user) {
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                req.session.user = { username: user.user_name, role: user.role };
                req.flash("success", "Login successful!");
                return res.redirect('/admin');
            } else {
                req.flash("error", "Invalid credentials");
            }
        } else {
            req.flash("error", "Invalid credentials");
        }
    } catch (error) {
        console.error("Error during login:", error);
        req.flash("error", "An error occurred. Please try again later.");
    }

    res.redirect('/login');
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// Example of protecting an admin route
router.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin-home', {
        admin_name: req.session.user.username,
        activePage: 'home' // Pass the activePage variable to the template
    });
});

// Landing page
router.get('/', (req, res) => res.render('index')); //This one worked v8

// Jen Story
router.get('/JenStory', (req, res) => { //This one worked v8
    res.render('JenStory'); 
});

// About Page
router.get('/about', (req, res) => {
    try {
        res.render('about');
    } catch (error) {
        console.error('Error loading the About Page:', error);
        res.status(500).send('Internal Server Error');
    }
});

//Volunteer form
 router.get('/volunteer', (req, res) => {
   res.render('volunteer'); 
 });

// Volunteer Form Route

router.get('/volunteerForm', (req, res) => {
    try {
        res.render('volunteerForm'); // Ensure 'volunteerForm.ejs' exists in the views folder
    } catch (error) {
        console.error('Error loading the Volunteer Form page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Contact Us Route
router.get('/contact', (req, res) => {
    try {
        res.render('contact'); // Ensure 'contact.ejs' exists in the views folder
    } catch (error) {
        console.error('Error loading the Contact Us page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle Contact Form Submission
router.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // You can add logic here to handle the form submission, like sending an email or storing the message
    console.log('Contact Form Submitted:', { name, email, message });

    // Send a response back to the user
    res.send(`<script>alert('Thank you for your message, ${name}! We will get back to you soon.'); window.location.href='/contact';</script>`);
});




// router.get('/show-events-by-month', (req, res) => {
//     try {
//         res.render('show-events-by-month'); // Ensure '/show-events-by-month' exists in the views folder
//     } catch (error) {
//         console.error('Error loading the Volunteer Form page:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// Contact Us Route
router.get('/contact', (req, res) => {
    try {
        res.render('contact'); // Ensure 'contact.ejs' exists in the views folder
    } catch (error) {
        console.error('Error loading the Contact Us page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle Contact Form Submission
router.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com', // Replace with your Gmail
            pass: 'your-email-password'  // Replace with your Gmail password or app-specific password
        }
    });

    // Email options
    const mailOptions = {
        from: email,
        to: 'turtleshelterproject@gmail.com',
        subject: `New message from ${name}`,
        text: message,
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');

        // Send success response
        res.send(`<script>alert('Thank you for your message, ${name}! We will get back to you soon.'); window.location.href='/contact';</script>`);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send(`<script>alert('There was an error sending your message. Please try again later.'); window.location.href='/contact';</script>`);
    }
});

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

// Donate Page Route
router.get('/donate', (req, res) => {
    res.render('donate'); // Ensure this matches the file name of your Donate Page (donate.ejs)
});

// // One-Time Donation Route
router.get('/donate/one-time', (req, res) => {
    res.send('Thank you for your support!'); // Placeholder for one-time donation logic
});

// // Monthly Donation Route
router.get('/donate/monthly', (req, res) => {
    res.send('Thank you for setting up a monthly donation!'); // Placeholder for monthly donation logic
});

// --- Admin Routes ---
// 7.1. Redirect Root URL to /admin
router.get("/", (req, res) => {
    res.redirect("/admin");
  });
// 7.2. Admin Home Route
router.get("/admin", isAuthenticated, (req, res) => {
    try {
      const adminName = "Admin"; // Replace with dynamic admin name if necessary
      res.render("admin-home", { admin_name: adminName, activePage: "home" });
    } catch (error) {
      console.error("Error rendering admin home:", error);
      req.flash("error", "Failed to load admin home.");
      res.status(500).send("Internal Server Error");
    }
  });
// ==============================
/* 7.19. Add Team Member Routes */
// ==============================
// 7.19.1. GET Route to Render Add Team Member Form
router.get("/admin/team-members/add", isAuthenticated, (req, res) => {
    res.render("add-team-member", { activePage: "team-members" });
  });
// 7.19.2. POST Route to Handle Add Team Member Form Submission
router.post("/admin/team-members/add", isAuthenticated, async (req, res) => {
    const {
      user_name,
      first_name,
      last_name,
      email,
      role,
      phone,
      street_address,
      city,
      state,
      zip
    } = req.body;
  
    try {
      // Basic validation to ensure all fields are filled
      if (!user_name || !first_name || !last_name || !email || !role || !phone || !street_address || !city || !state || !zip) {
        req.flash("error", "All fields are required.");
        return res.redirect("/admin/team-members/add");
      }
  
      // Check if the username already exists
      const existingUser = await knex("users")
        .where("user_name", user_name)
        .first();
  
      if (existingUser) {
        req.flash("error", "Username already exists. Please choose another one.");
        return res.redirect("/admin/team-members/add");
      }
  
      // Insert the new team member into the database
      await knex("users").insert({
        user_name,
        first_name,
        last_name,
        email,
        role,
        phone,
        street_address,
        city,
        state,
        zip
      });
  
      req.flash("success", "Team member added successfully.");
      res.redirect("/admin/team-members");
    } catch (error) {
      console.error("Error adding team member:", error);
      req.flash("error", "Failed to add team member. Please try again.");
      res.redirect("/admin/team-members/add");
    }
  });
  
  // 7.3. Event Requests Route with Tabs
  router.get("/admin/event-requests/:tab", isAuthenticated, async (req, res) => {
    const tab = req.params.tab.toLowerCase(); // Ensure case consistency
    let query = knex("requests as r")
      .join("requeststatus as rs", "r.req_id", "=", "rs.req_id")
      .select(
        "r.req_id",
        "r.req_location",
        "r.req_street_address",
        "r.req_city",
        "r.req_state",
        "r.req_zip",
        "r.req_event_date",
        "r.req_event_time",
        "r.req_event_duration",
        "r.num_no_sewing",
        "r.num_basic_sewing",
        "r.num_adv_sewing",
        "r.req_first_name",
        "r.req_last_name",
        "r.req_phone",
        "r.req_email",
        "rs.status"
      )
      .orderBy("r.req_event_date", "asc");
  
    if (tab === "pending") {
      query = query.where("rs.status", "Pending"); // Ensure this matches your database
    } else if (tab === "all") {
      // No additional filter needed
    } else {
      // Send 404 if tab is unrecognized to prevent infinite redirects
      res.status(404).send("Not Found");
      return;
    }
  
    try {
      const eventRequests = await query;
      res.render("event-requests", { eventRequests, activeTab: tab, activePage: "event-requests" });
    } catch (error) {
      console.error("Error fetching event requests:", error);
      req.flash("error", "Failed to fetch event requests.");
      res.status(500).send("Internal Server Error");
    }
  });
  
  // 7.4. Redirect /admin/event-requests to /admin/event-requests/pending
  router.get("/admin/event-requests", isAuthenticated, (req, res) => {
    res.redirect("/admin/event-requests/pending");
  });
  
  // 7.5. Route to Display the Create Event Page from an Event Request
  router.get("/admin/event-requests/create-event/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      // Fetch the event request data by ID
      const eventRequest = await knex("requests as r")
        .join("requeststatus as rs", "r.req_id", "=", "rs.req_id")
        .select(
          "r.req_id",
          "r.req_location",
          "r.req_street_address",
          "r.req_city",
          "r.req_state",
          "r.req_zip",
          "r.req_event_date",
          "r.req_event_time",
          "r.req_event_duration",
          "r.num_no_sewing",
          "r.num_basic_sewing",
          "r.num_adv_sewing",
          "r.req_first_name",
          "r.req_last_name",
          "r.req_phone",
          "r.req_email",
          "rs.status"
        )
        .where("r.req_id", id)
        .first();
  
      if (!eventRequest) {
        req.flash("error", "Event Request not found.");
        return res.redirect("/admin/event-requests/pending");
      }
  
      res.render("create-event", { eventRequest, activePage: "create-event" });
    } catch (error) {
      console.error("Error fetching event request:", error);
      req.flash("error", "Failed to fetch the event request.");
      res.redirect("/admin/event-requests/pending");
    }
  });
  
  // 7.6. Route to Display the Create Event Page from Scratch
  router.get("/admin/events/create", isAuthenticated, (req, res) => {
    // Render the create-event.ejs template with an empty eventRequest object
    res.render("create-event", { eventRequest: null, activePage: "create-event" });
  });
  
  // 7.7. Route to Handle Event Creation
  router.post("/admin/events/create", isAuthenticated, async (req, res) => {
    try {
      let {
        req_id,
        event_location,
        street_address,
        city,
        state,
        zip,
        event_date,
        event_time,
        event_duration,
        num_exp_pockets,
        num_exp_collars,
        num_exp_envelopes,
        num_exp_vests,
        num_expected_completed_products,
        num_teammembers_scheduled,
      } = req.body;
  
      // Log the request body for debugging
      console.log("Request body:", req.body);
  
      // Convert empty strings to null or default values
      const convertToIntOrNull = (value) => {
        if (value === undefined || value === null || value === "") {
          return null; // or 0 if appropriate
        }
        return parseInt(value, 10);
      };
  
      // Convert numeric fields
      num_exp_pockets = convertToIntOrNull(num_exp_pockets);
      num_exp_collars = convertToIntOrNull(num_exp_collars);
      num_exp_envelopes = convertToIntOrNull(num_exp_envelopes);
      num_exp_vests = convertToIntOrNull(num_exp_vests);
      num_expected_completed_products = convertToIntOrNull(num_expected_completed_products);
      num_teammembers_scheduled = convertToIntOrNull(num_teammembers_scheduled);
      event_duration = convertToIntOrNull(event_duration);
  
      // Parse req_id if provided
      req_id = convertToIntOrNull(req_id);
  
      // **Do NOT convert event_date to a Date object**
      const eventDate = event_date || null; // Keep as string
      const eventTime = event_time || null;
  
      // Prepare the event data object
      const eventData = {
        event_location,
        street_address,
        city,
        state,
        zip,
        event_date: eventDate, // Store as string
        event_time: eventTime,
        event_duration,
        num_exp_pockets,
        num_exp_collars,
        num_exp_envelopes,
        num_exp_vests,
        num_expected_completed_products,
        num_teammembers_scheduled,
        // Include req_id only if it's not null
        ...(req_id && { req_id }),
      };
  
      // Insert the new event into the events table
      const insertedEvents = await knex("events")
        .insert(eventData)
        .returning("event_id");
  
      // Log the insertedEvents for debugging
      console.log("Inserted Events:", insertedEvents);
  
      // Extract event_id correctly
      let event_id;
      if (
        Array.isArray(insertedEvents) &&
        insertedEvents.length > 0 &&
        typeof insertedEvents[0] === "object" &&
        "event_id" in insertedEvents[0]
      ) {
        event_id = insertedEvents[0].event_id;
      } else if (
        Array.isArray(insertedEvents) &&
        insertedEvents.length > 0 &&
        typeof insertedEvents[0] === "number"
      ) {
        event_id = insertedEvents[0];
      } else {
        throw new Error("Unexpected format for insertedEvents");
      }
  
      // Log the extracted event_id for debugging
      console.log("Extracted event_id:", event_id);
  
      // Insert the status into eventstatus table
      await knex("eventstatus").insert({
        event_id,
        status: "Upcoming", // Set the default status to 'Upcoming'
      });
  
      // Update the status of the event request to 'Approved' if req_id exists
      if (req_id) {
        await knex("requeststatus")
          .where("req_id", req_id)
          .update({ status: "Approved" });
      }
  
      // Set success flash message
      req.flash("success", "Event created successfully!");
  
      // Redirect to the upcoming events page
      res.redirect("/admin/events/upcoming");
    } catch (error) {
      console.error("Error creating event:", error);
  
      // Set error flash message
      req.flash("error", "Failed to create event. Please try again.");
  
      // Redirect back to the create event form
      res.redirect("/admin/events/create");
    }
  });
  
  // 7.8. Route to Display the Edit Event Page
  router.get("/admin/events/edit/:id", isAuthenticated, async (req, res) => {
    const eventId = req.params.id;
  
    try {
      // Fetch the event data along with its status
      const event = await knex("events as e")
        .join("eventstatus as es", "e.event_id", "=", "es.event_id")
        .select(
          "e.event_id",
          "e.event_location",
          "e.street_address",
          "e.city",
          "e.state",
          "e.zip",
          "e.event_date",
          "e.event_time",
          "e.event_duration",
          "e.num_exp_pockets",
          "e.num_exp_collars",
          "e.num_exp_envelopes",
          "e.num_exp_vests",
          "e.num_expected_completed_products",
          "e.num_teammembers_scheduled",
          "es.status"
        )
        .where("e.event_id", eventId)
        .first();
  
      if (!event) {
        req.flash("error", "Event not found.");
        return res.redirect("/admin/events/upcoming");
      }
  
      res.render("edit-event", { event, activePage: "edit-event" });
    } catch (error) {
      console.error("Error fetching event for editing:", error);
      req.flash("error", "Failed to fetch event details.");
      res.redirect("/admin/events/upcoming");
    }
  });
  
  // 7.9. Route to Handle Event Editing
  router.post("/admin/events/edit/:id", isAuthenticated, async (req, res) => {
    const eventId = req.params.id;
  
    try {
      let {
        event_location,
        street_address,
        city,
        state,
        zip,
        event_date,
        event_time,
        event_duration,
        num_exp_pockets,
        num_exp_collars,
        num_exp_envelopes,
        num_exp_vests,
        num_expected_completed_products,
        num_teammembers_scheduled,
        status, // New field for event status
      } = req.body;
  
      // Log the request body for debugging
      console.log("Edit Request body:", req.body);
  
      // Convert empty strings to null or default values
      const convertToIntOrNull = (value) => {
        if (value === undefined || value === null || value === "") {
          return null; // or 0 if appropriate
        }
        return parseInt(value, 10);
      };
  
      // Convert numeric fields
      num_exp_pockets = convertToIntOrNull(num_exp_pockets);
      num_exp_collars = convertToIntOrNull(num_exp_collars);
      num_exp_envelopes = convertToIntOrNull(num_exp_envelopes);
      num_exp_vests = convertToIntOrNull(num_exp_vests);
      num_expected_completed_products = convertToIntOrNull(num_expected_completed_products);
      num_teammembers_scheduled = convertToIntOrNull(num_teammembers_scheduled);
      event_duration = convertToIntOrNull(event_duration);
  
      // **Do NOT convert event_date to a Date object**
      const eventDate = event_date || null; // Keep as string
      const eventTime = event_time || null;
  
      // Prepare the updated event data object
      const updatedEventData = {
        event_location,
        street_address,
        city,
        state,
        zip,
        event_date: eventDate, // Store as string
        event_time: eventTime,
        event_duration,
        num_exp_pockets,
        num_exp_collars,
        num_exp_envelopes,
        num_exp_vests,
        num_expected_completed_products,
        num_teammembers_scheduled,
      };
  
      // Update the event in the events table
      await knex("events")
        .where("event_id", eventId)
        .update(updatedEventData);
  
      // Update the event status in eventstatus table
      // Validate the status to be one of the allowed values
      const allowedStatuses = ["Upcoming", "Completed", "Cancelled"];
      let newStatus = "Upcoming"; // Default status
  
      if (status && allowedStatuses.includes(status)) {
        newStatus = status;
      } else {
        // If status is not provided or invalid, determine based on date
        const now = DateTime.local().setZone("America/Denver"); // Current time in MST/MDT
        const selectedDate = DateTime.fromISO(eventDate, { zone: "America/Denver" }).startOf('day');
  
        if (selectedDate >= now.startOf('day')) {
          newStatus = "Upcoming";
        } else {
          newStatus = "Cancelled";
        }
      }
  
      await knex("eventstatus")
        .where("event_id", eventId)
        .update({ status: newStatus });
  
      // Set success flash message
      req.flash("success", "Event updated successfully!");
  
      // Redirect to the events page (same tab as before)
      res.redirect("/admin/events/upcoming");
    } catch (error) {
      console.error("Error editing event:", error);
      req.flash("error", "Failed to update event. Please try again.");
      res.redirect(`/admin/events/edit/${eventId}`);
    }
  });
  
  // 7.10. Deny Event Request
  router.post("/admin/event-requests/deny/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
      await knex("requeststatus")
        .where("req_id", id)
        .update({ status: "Denied" });
  
      req.flash("success", "Event request denied successfully.");
      res.redirect("/admin/event-requests/pending");
    } catch (error) {
      console.error("Error denying request:", error);
      req.flash("error", "Failed to deny the event request.");
      res.redirect("/admin/event-requests/pending");
    }
  });
  
  // 7.11. Events Route with Status Tabs
  router.get("/admin/events/:status", isAuthenticated, async (req, res) => {
    const status = req.params.status.toLowerCase();
  
    let query = knex("events as e")
      .join("eventstatus as es", "e.event_id", "=", "es.event_id")
      .leftJoin("requests as r", "e.req_id", "=", "r.req_id") // Join requests table for additional fields
      .select(
        "e.event_id",
        "e.event_location",
        "e.city as city",
        "e.state as state",
        "r.req_phone",
        "e.event_date",
        "e.event_time",
        "e.event_duration",
        "r.num_no_sewing",
        "r.num_basic_sewing",
        "r.num_adv_sewing",
        "r.req_first_name",
        "r.req_last_name",
        "es.status"
      )
      .orderBy("e.event_date", "asc");
  
    if (status !== "all") {
      let dbStatus;
      if (status === "upcoming") {
        dbStatus = "Upcoming";
      } else if (status === "completed") {
        dbStatus = "Completed";
      } else if (status === "cancelled") {
        dbStatus = "Cancelled";
      } else {
        res.status(404).send("Not Found");
        return;
      }
      query = query.whereRaw("LOWER(es.status) = ?", [dbStatus.toLowerCase()]);
    }
  
    try {
      const events = await query;
  
      const formattedEvents = events.map(event => {
        const eventDate = DateTime.fromJSDate(event.event_date, { zone: "America/Denver" });
        const totalVolunteers = (event.num_no_sewing || 0) + (event.num_basic_sewing || 0) + (event.num_adv_sewing || 0);
  
        return {
          ...event,
          formatted_date: eventDate.isValid ? eventDate.toLocaleString(DateTime.DATE_MED) : "",
          total_volunteers: totalVolunteers,
          req_first_name: event.req_first_name || "Admin", // Default to Admin if no request record
          req_last_name: event.req_last_name || "",
          req_phone: event.req_phone || "N/A" // Default to N/A if no phone number is available
        };
      });
  
      res.render("events", { events: formattedEvents, activeTab: status, activePage: "events" });
    } catch (error) {
      console.error("Error fetching events:", error);
      req.flash("error", "Failed to fetch events.");
      res.redirect("/admin/events");
    }
  });
  
  // 7.12. Mark Event as Completed and Redirect to Create Event Results
  router.get("/admin/events/complete/:id", isAuthenticated, async (req, res) => {
    const eventId = req.params.id;
  
    try {
      // Update the event's status to "Completed"
      await knex("eventstatus")
        .where("event_id", eventId)
        .update({ status: "Completed" });
  
      // Fetch the event details for the provided event ID
      const event = await knex("events")
        .select(
          "event_id",
          "event_location",
          "event_date",
          "event_time",
          "event_duration"
        )
        .where("event_id", eventId)
        .first();
  
      if (!event) {
        req.flash("error", "Event not found.");
        return res.redirect("/admin/events/upcoming");
      }
  
      // Redirect to the create-eventResults.ejs page with the event details
      res.render("create-eventResults", { event, activePage: "events" });
    } catch (error) {
      console.error("Error completing event:", error);
      req.flash("error", "Failed to complete the event.");
      res.redirect("/admin/events/upcoming");
    }
  });
  
  // 7.13. Cancel Event
  router.post("/admin/events/cancel/:id", isAuthenticated, async (req, res) => {
    const eventId = req.params.id;
    try {
      // Update the event's status to "Cancelled"
      await knex("eventstatus")
        .where("event_id", eventId)
        .update({ status: "Cancelled" });
  
      req.flash("success", "Event cancelled successfully.");
      res.redirect("/admin/events/upcoming");
    } catch (error) {
      console.error("Error cancelling event:", error);
      req.flash("error", "Failed to cancel the event.");
      res.redirect("/admin/events/upcoming");
    }
  });
  
  // Route to Display Event Details
  router.get("/admin/events/details/:id", isAuthenticated, async (req, res) => {
    const eventId = req.params.id;
  
    try {
      // Fetch event details using the event ID
      const event = await knex("events")
        .select(
          "event_id",
          "req_id",
          "event_location",
          "street_address",
          "city",
          "state",
          "zip",
          "event_date",
          "event_time",
          "event_duration",
          "num_exp_pockets",
          "num_exp_collars",
          "num_exp_envelopes",
          "num_exp_vests",
          "num_expected_completed_products",
          "num_teammembers_scheduled"
        )
        .where("event_id", eventId)
        .first();
  
      if (!event) {
        req.flash("error", "Event not found.");
        return res.redirect("/admin/events/upcoming");
      }
  
      res.render("event-details", { event, activePage: "events", activeTab: req.query.tab || "upcoming" });
    } catch (error) {
      console.error("Error fetching event details:", error);
      req.flash("error", "Failed to load event details.");
      res.redirect("/admin/events/upcoming");
    }
  });
  
  // 7.14. Handle Event Results Submission
  router.post("/admin/events/complete/:id", isAuthenticated, async (req, res) => {
    const eventId = req.params.id;
    const {
      num_volunteers,
      num_team_members,
      event_duration,
      pockets_produced,
      collars_produced,
      envelopes_produced,
      vests_produced,
      completed_products
    } = req.body;
  
    try {
      // Insert the event results into the `eventresults` table
      await knex("eventresults").insert({
        event_id: eventId,
        num_volunteers: parseInt(num_volunteers, 10),
        num_team_members: parseInt(num_team_members, 10),
        event_duration: parseInt(event_duration, 10),
        pockets_produced: parseInt(pockets_produced, 10),
        collars_produced: parseInt(collars_produced, 10),
        envelopes_produced: parseInt(envelopes_produced, 10),
        vests_produced: parseInt(vests_produced, 10),
        completed_products: parseInt(completed_products, 10)
      });
  
      // Redirect to the event-results page for the completed event
      res.redirect(`/admin/event-results/${eventId}`);
    } catch (error) {
      console.error("Error submitting event results:", error);
      req.flash("error", "Failed to submit event results. Please try again.");
      res.redirect(`/admin/events/complete/${eventId}`);
    }
  });
  
  // 7.16. Display All Event Results
  router.get("/admin/event-results", isAuthenticated, async (req, res) => {
    try {
      const completedEvents = await knex("events as e")
        .join("eventresults as er", "e.event_id", "=", "er.event_id") // Join with eventresults
        .leftJoin("requests as r", "e.req_id", "=", "r.req_id") // Join with requests for requester info
        .select(
          "e.event_id",         // Event ID for links
          "e.event_location",   // Event name
          "e.event_date",       // Event date
          "r.req_first_name",   // Requester first name
          "r.req_last_name"     // Requester last name
        )
        .orderBy("e.event_date", "asc"); // Order by date ascending
  
      res.render("all-event-results", { completedEvents, activePage: "event-results" });
    } catch (error) {
      console.error("Error fetching all event results:", error.message);
      req.flash("error", "Failed to fetch event results.");
      res.redirect("/admin/events");
    }
  });
  
  // 7.12. Redirect /admin/events to /admin/events/upcoming
  router.get("/admin/events", isAuthenticated, (req, res) => {
    res.redirect("/admin/events/upcoming");
  });

router.get('/admin/team-members', isAuthenticated, async (req, res) => {
    try {
        const teamMembers = await knex('users')
            .select('user_name', 'first_name', 'last_name', 'email', 'role', 'phone', 'street_address', 'city', 'state', 'zip')
            .whereIn('role', ['Admin', 'Team Member']) // Select only Admins and Team Members
            .orderBy('role', 'asc');

        res.render('team-members', {
            users: teamMembers, // Use 'users' to make this page dynamic for both roles
            activeTab: 'team-members',
            activePage: 'team-members',
            success_messages: [],
            error_messages: []
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        req.flash('error', 'Failed to fetch team members.');
        res.redirect('/admin');
    }
});

router.get('/admin/volunteers',isAuthenticated,  async (req, res) => {
    try {
        const volunteers = await knex('users')
            .select('user_name', 'first_name', 'last_name', 'email', 'role', 'phone', 'street_address', 'city', 'state', 'zip')
            .where('role', 'Volunteer') // Select only Volunteers
            .orderBy('first_name', 'asc');

        res.render('team-members', {
            users: volunteers, // Use 'users' to make this page dynamic for both roles
            activeTab: 'volunteers',
            activePage: 'team-members',
            success_messages: [],
            error_messages: []
        });
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        req.flash('error', 'Failed to fetch volunteers.');
        res.redirect('/admin');
    }
});
  
  // 7.14. Route to Display Individual Team Member Details
  router.get("/admin/team-members/:user_name", isAuthenticated, async (req, res) => {
    const userName = req.params.user_name;
  
    try {
      // Fetch the team member's details based on user_name
      const member = await knex("users") // Changed 'Users' to 'users'
        .select("user_name", "first_name", "last_name", "email", "role", "phone", "street_address", "city", "state", "zip")
        .where("user_name", userName)
        .first();
  
      if (!member) {
        req.flash("error", "Team member not found.");
        return res.redirect("/admin/team-members");
      }
  
      res.render("team-member-details", { member, activePage: "team-members" });
    } catch (error) {
      console.error("Error fetching team member details:", error);
      req.flash("error", "Failed to fetch team member details.");
      res.redirect("/admin/team-members");
    }
  });


// ==============================
/* 7.15. Edit Team Member Routes */
// ==============================

// 7.15.1. GET Route to Render Edit Team Member Form
router.get("/admin/team-members/:user_name/edit", isAuthenticated, async (req, res) => {
  const userName = req.params.user_name;

  try {
    // Fetch the team member's details based on user_name
    const member = await knex("users")
      .select("user_name", "first_name", "last_name", "email", "role", "phone", "street_address", "city", "state", "zip")
      .where("user_name", userName)
      .first();

    if (!member) {
      req.flash("error", "Team member not found.");
      return res.redirect("/admin/team-members");
    }

    res.render("edit-team-member", { member, activePage: "team-members" });
  } catch (error) {
    console.error("Error fetching team member for editing:", error);
    req.flash("error", "Failed to fetch team member details.");
    res.redirect("/admin/team-members");
  }
});

// 7.15.2. POST Route to Handle Edit Team Member Form Submission
router.post("/admin/team-members/:user_name/edit", isAuthenticated, async (req, res) => {
  const userName = req.params.user_name;
  const {
    first_name,
    last_name,
    email,
    role,
    phone,
    street_address,
    city,
    state,
    zip
  } = req.body;

  try {
    // Validate required fields (basic validation)
    if (!first_name || !last_name || !email || !role || !phone || !street_address || !city || !state || !zip) {
      req.flash("error", "All fields are required.");
      return res.redirect(`/admin/team-members/${userName}/edit`);
    }

    // Update the team member's details in the database
    await knex("users")
      .where("user_name", userName)
      .update({
        first_name,
        last_name,
        email,
        role,
        phone,
        street_address,
        city,
        state,
        zip
      });

    req.flash("success", "Team member updated successfully.");
    res.redirect("/admin/team-members");
  } catch (error) {
    console.error("Error updating team member:", error);
    req.flash("error", "Failed to update team member. Please try again.");
    res.redirect(`/admin/team-members/${userName}/edit`);
  }
});

// ==============================
/* 7.16. Delete Team Member Route */
// ==============================

// 7.16.1. POST Route to Handle Deletion of a Team Member
router.post("/admin/team-members/:user_name/delete", isAuthenticated,  async (req, res) => {
  const userName = req.params.user_name;

  try {
    // Delete the team member from the database
    const deletedRows = await knex("users")
      .where("user_name", userName)
      .del();

    if (deletedRows === 0) {
      req.flash("error", "Team member not found.");
      return res.redirect("/admin/team-members");
    }

    req.flash("success", "Team member deleted successfully.");
    res.redirect("/admin/team-members");
  } catch (error) {
    console.error("Error deleting team member:", error);
    req.flash("error", "Failed to delete team member.");
    res.redirect("/admin/team-members");
  }
});

// ==============================
/* 7.17. Automated Status Updates Using node-cron */
// ==============================

cron.schedule(
  "0 23 * * *", // Runs every day at 11:00 PM
  async () => {
    // This cron job runs daily at 11 PM MST
    console.log("Running daily status update cron job...");

    try {
      // Get today's date in MST
      const today = DateTime.local().setZone("America/Denver").startOf('day');

      // Fetch all events with status 'Upcoming' and event_date equals today
      const eventsToCancel = await knex("events as e")
        .join("eventstatus as es", "e.event_id", "=", "es.event_id")
        .select("e.event_id", "e.event_date", "es.status")
        .where("es.status", "Upcoming")
        .andWhere("e.event_date", today.toISODate()); // 'YYYY-MM-DD'

      for (const event of eventsToCancel) {
        // Update the event status to 'Cancelled'
        await knex("eventstatus")
          .where("event_id", event.event_id)
          .update({ status: "Cancelled" });
        console.log(`Event ID ${event.event_id} status updated to Cancelled.`);
      }

      console.log("Daily status update cron job completed.");
    } catch (error) {
      console.error("Error during automated status updates:", error);
    }
  },
  {
    timezone: "America/Denver", // Set timezone to MST/MDT
  }
);

// ==============================
/* 7.18. Route to Display Event Results */
// ==============================

// 7.18.1. GET Route to Display Event Results for a Specific Event
router.get("/admin/event-results/:id", isAuthenticated, async (req, res) => {
  const eventId = req.params.id;

  try {
    // Fetch event details
    const event = await knex("events as e")
      .join("eventstatus as es", "e.event_id", "=", "es.event_id")
      .select(
        "e.event_id",
        "e.event_location",
        "e.street_address",
        "e.city",
        "e.state",
        "e.zip",
        "e.event_date",
        "e.event_time",
        "es.status"
      )
      .where("e.event_id", eventId)
      .first();

    if (!event) {
      req.flash("error", "Event not found.");
      return res.redirect("/admin/events/upcoming");
    }

    // Fetch event results
    const eventResults = await knex("eventresults")
      .where("event_id", eventId)
      .first();

    if (!eventResults) {
      req.flash("error", "Event results not found.");
      return res.redirect("/admin/events/upcoming");
    }

    res.render("event-results", { event, eventResults, activePage: "event-results" });
  } catch (error) {
    console.error("Error fetching event results:", error);
    req.flash("error", "Failed to fetch event results.");
    res.redirect("/admin/events/upcoming");
  }
});

// 7.18.2. GET Route to Display All Completed Event Results
router.get("/admin/event-results", isAuthenticated, async (req, res) => {
  try {
    // Fetch all events with status 'Completed' along with their requesters (if any)
    const completedEvents = await knex("events as e")
      .join("eventstatus as es", "e.event_id", "=", "es.event_id")
      .leftJoin("requests as r", "e.req_id", "=", "r.req_id") // Left join to include events without a request
      .select(
        "e.event_id",
        "e.event_location",
        "e.event_date",
        "e.event_time",
        "r.req_first_name",
        "r.req_last_name"
      )
      .where("es.status", "Completed")
      .orderBy("e.event_date", "desc");

    res.render("all-event-results", { completedEvents, activePage: "event-results" });
  } catch (error) {
    console.error("Error fetching all completed events:", error);
    req.flash("error", "Failed to fetch completed events.");
    res.redirect("/admin/events");
  }
});

// ==============================
/* 7.19. Event Request Details Route */
// ==============================
router.get("/admin/event-requests/details/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { tab } = req.query || 'pending'; // Default to 'pending' if no tab is provided
  
    try {
      const eventRequest = await knex("requests as r")
        .join("requeststatus as rs", "r.req_id", "=", "rs.req_id")
        .select(
          "r.req_id",
          "r.req_location",
          "r.req_street_address",
          "r.req_city",
          "r.req_state",
          "r.req_zip",
          "r.req_event_date",
          "r.req_event_time",
          "r.req_event_duration",
          "r.num_no_sewing",
          "r.num_basic_sewing",
          "r.num_adv_sewing",
          "r.num_sewing_machines",
          "r.num_sergers",
          "r.req_first_name",
          "r.req_last_name",
          "r.req_phone",
          "r.req_email",
          "r.share_jens_story",  // Add this field
          "r.sewing_event",      // Add this field
          "rs.status"
        )
        .where("r.req_id", id)
        .first();
  
      if (!eventRequest) {
        req.flash("error", "Event Request not found.");
        return res.redirect(`/admin/event-requests/${tab}`);
      }
  
      res.render("event-request-details", {
        eventRequest, // Pass eventRequest to the template
        activeTab: tab,
        activePage: "event-requests", // Pass activePage for the navbar
      });
    } catch (error) {
      console.error("Error fetching event request details:", error);
      req.flash("error", "Failed to load event request details.");
      res.redirect(`/admin/event-requests/${tab}`);
    }
  });  

//sendRequest
router.get('/sendRequest', (req, res) => {
    try {
        res.render('sendRequest'); // Ensure 'sendRequest.ejs' is in your views folder
    } catch (error) {
        console.error('Error loading the Send Request Page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add POST route to handle event request submission
router.post('/sendRequest', async (req, res) => {
    const {
        req_location,
        req_street_address,
        req_city,
        req_state,
        req_zip,
        req_event_date,
        event_time,
        req_event_duration,
        share_jens_story,
        sewing_event,
        num_no_sewing,
        num_basic_sewing,
        num_adv_sewing,
        num_sewing_machines,
        num_sergers,
        req_first_name,
        req_last_name,
        req_phone,
        req_email
    } = req.body;

    try {
        // Insert request data into the 'requests' table
        const insertedRequest = await knex('requests').insert({
            req_location,
            req_street_address,
            req_city,
            req_state,
            req_zip,
            req_event_date,
            req_event_time: event_time,
            req_event_duration: Math.round(req_event_duration),
            share_jens_story: share_jens_story === 'true',
            sewing_event: sewing_event === 'true',
            num_no_sewing,
            num_basic_sewing,
            num_adv_sewing,
            num_sewing_machines,
            num_sergers,
            req_first_name,
            req_last_name,
            req_phone,
            req_email
        }).returning('req_id');

        const newRequestId = insertedRequest[0].req_id || insertedRequest[0];

        // Insert a new request status with the status set to 'Pending'
        await knex('requeststatus').insert({
            req_id: newRequestId, // Use the ID from the inserted request
            status: 'Pending' // Set the default status to 'Pending'
        });

        // Set a success flash message and redirect to a confirmation page
        req.flash('success', 'Your event request has been submitted successfully!');
        res.redirect('/sendRequest'); // Create a confirmation page if needed
    } catch (error) {
        console.error('Error submitting event request:', error);
        req.flash('error', 'There was an error submitting your request. Please try again later.');
        res.redirect('/sendRequest'); // Redirect back to form with error message
    }
});

// Admin dashboard
router.get('/dashboard', async (req, res) => {
    const events = await pool.query('SELECT * FROM Events');
    res.render('admin', { events: events.rows });
});

// Route for Take Action Page
router.get('/takeAction', (req, res) => {
    try {
        res.render('takeAction'); // Ensure the 'takeAction.ejs' file is in your 'views' folder
    } catch (error) {
        console.error('Error loading the Take Action page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Updated route to show all upcoming events without filtering
router.get('/show-events-by-month', async (req, res) => {
    try {
        // Base query to get all upcoming events with their associated request details
        const events = await knex('events as e')
            .join('eventstatus as es', 'e.event_id', 'es.event_id') // Join with eventstatus table
            .select(
                'e.event_id',
                'e.event_location',
                'e.street_address',
                'e.city',
                'e.state',
                'e.zip',
                'e.event_date',
                'e.event_time'
            )
            .where('es.status', 'Upcoming') // Filter for upcoming events
            .orderBy('e.event_date', 'asc'); // Order events by date

        // Render the template with the events
        res.render('show-events-by-month', {
            events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to show volunteer sign-up form for a specific event
router.get('/events/:eventId/signup', async (req, res) => {
    const eventId = req.params.eventId;
    
    try {
        // Fetch event details to show on sign-up page
        const event = await knex('events')
            .where('event_id', eventId)
            .first();
        
        if (!event) {
            return res.status(404).send('Event not found');
        }

        res.render('volunteerSignup', { event });
    } catch (error) {
        console.error('Error loading volunteer sign-up:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to process volunteer sign-up
router.post('/events/:eventId/signup', async (req, res) => {
    const eventId = req.params.eventId;
    const { firstName, lastName, phone, email } = req.body;

    try {
        // Check if a user with the provided email or phone already exists
        let user = await knex('users')
            .where('email', email)
            .orWhere('phone', phone)
            .first();

        // If no user exists, create a new user
        const timestamp = Date.now();
        if (!user) {
            const [newUserId] = await knex('users').insert({
                user_name: `${firstName.toLowerCase()}${lastName.toLowerCase()}${timestamp}`.slice(0, 30), // Ensure it is 30 characters max,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                email: email,
                role: 'Volunteer',
                street_address: null,
                city: null,
                state: null,
                zip: null,
                password: null,
                sewing_level: sewing_level,
                hours_willing_to_work: hours_willing_to_work,
                heard_of_tsp: heard_of_tsp
            }).returning('user_name'); // Get the user_name of the newly created user

            user = { user_name: newUserId };
        }

        // Insert a new record into the attendance table with the event ID and user ID
        await knex('attendance').insert({
            event_id: eventId,
            user_name: user.user_name
        });

        // Render thank you page
        res.render('volunteerThankYou');
    } catch (error) {
        console.error('Error processing volunteer sign-up:', error);
        res.status(500).send('Internal Server Error');
    }
});

//   THIS NEEDS TO BE AT THE BOTTOM 
module.exports = router;