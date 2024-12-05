require('dotenv').config();

const express = require('express');
const router = express.Router();
const knex = require('../models/database'); // Database connection
const cron = require('node-cron');

const nodemailer = require('nodemailer');

// // Middleware for admin authentication
// function isAdmin(req, res, next) {
//     if (req.session.user && req.session.user.role === 'admin') {
//         return next();
//     }
//     res.redirect('/login');
// }

// --- General Routes ---


const { OpenAI } = require('openai');

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
router.get("/admin", (req, res) => {
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
router.get("/admin/team-members/add", (req, res) => {
    res.render("add-team-member", { activePage: "team-members" });
  });
// 7.19.2. POST Route to Handle Add Team Member Form Submission
router.post("/admin/team-members/add", async (req, res) => {
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
  router.get("/admin/event-requests/:tab", async (req, res) => {
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
  router.get("/admin/event-requests", (req, res) => {
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
  router.get("/admin/events/create", (req, res) => {
    // Render the create-event.ejs template with an empty eventRequest object
    res.render("create-event", { eventRequest: null, activePage: "create-event" });
  });
  
  // 7.7. Route to Handle Event Creation
  router.post("/admin/events/create", async (req, res) => {
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
  router.get("/admin/events/edit/:id", async (req, res) => {
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
  router.post("/admin/events/edit/:id", async (req, res) => {
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
  router.post("/admin/event-requests/deny/:id", async (req, res) => {
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
  router.get("/admin/events/:status", async (req, res) => {
    const status = req.params.status.toLowerCase();
  
    let query = knex("events as e")
      .join("eventstatus as es", "e.event_id", "=", "es.event_id")
      .leftJoin("requests as r", "e.req_id", "=", "r.req_id") // Join requests table for additional fields
      .select(
        "e.event_id",
        "e.event_location",
        "r.req_city as city",
        "r.req_state as state",
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
  router.get("/admin/events/complete/:id", async (req, res) => {
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
  router.post("/admin/events/cancel/:id", async (req, res) => {
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
  router.get("/admin/events/details/:id", async (req, res) => {
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
  router.post("/admin/events/complete/:id", async (req, res) => {
    const eventId = req.params.id;
    const {
      num_volunteers,
      num_team_members,
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
  router.get("/admin/event-results", async (req, res) => {
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
  router.get("/admin/events", (req, res) => {
    res.redirect("/admin/events/upcoming");
  });
  
  // 7.13. Team Members Route (List)
  router.get("/admin/team-members", async (req, res) => {
    try {
      const teamMembers = await knex("users") // Changed 'Users' to 'users' to match PostgreSQL's default lowercase
        .select("user_name", "first_name", "last_name", "email", "role", "phone", "street_address", "city", "state", "zip")
        .orderBy("role", "asc");
  
      res.render("team-members", { teamMembers, activePage: "team-members" });
    } catch (error) {
      console.error("Error fetching team members:", error);
      req.flash("error", "Failed to fetch team members.");
      res.redirect("/admin");
    }
  });
  
  // 7.14. Route to Display Individual Team Member Details
  router.get("/admin/team-members/:user_name", async (req, res) => {
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
router.get("/admin/team-members/:user_name/edit", async (req, res) => {
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
router.post("/admin/team-members/:user_name/edit", async (req, res) => {
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
router.post("/admin/team-members/:user_name/delete", async (req, res) => {
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
router.get("/admin/event-results/:id", async (req, res) => {
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
router.get("/admin/event-results", async (req, res) => {
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
router.get("/admin/event-requests/details/:id", async (req, res) => {
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




// Login and Logout
router.get('/login', (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await knex('users').where({ username, password }).first();
    if (user) {
        req.session.user = { username: user.username, role: user.role };
        res.redirect('/');
    } else {
        res.status(401).render('login', { error: 'Invalid credentials' });
    }
});
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
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




//   THIS NEEDS TO BE AT THE BOTTOM 
module.exports = router;