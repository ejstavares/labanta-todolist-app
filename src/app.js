const express = require('express');
const session = require('express-session');
require('dotenv').config();


// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', 'views'); // Set the directory for EJS templates
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (for form submissions)
app.use(express.json()); // Parse corpos em JSON (necessário para a API em /api/*)

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET, // Secret key for session encryption
  resave: false,
  saveUninitialized: false,
}));

// Use the imported routes
app.get('/', (req, res) => res.redirect('/tasks')); // Redirect root route to /tasks
app.get('/session-debug', (req, res) => res.json(req.session));
app.get('/debug-session', (req, res) => res.json(req.session));
app.use(authRoutes); // Use authentication routes
app.use(taskRoutes); // Use task management routes
app.use(apiRoutes); // Use API routes

// Start the server on port specified in environment variable or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TodoList app a correr em http://localhost:${PORT}`));