const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session
app.use(session({
    secret: 'rental_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Route Imports
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const bookingRoutes = require('./routes/bookings');

// Routes
app.use('/', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/bookings', bookingRoutes);

// Home
app.get('/', (req, res) => {
    res.render('index', { session: req.session });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
