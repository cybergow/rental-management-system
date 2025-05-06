const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Book a vehicle
router.post('/:vehicleId', (req, res) => {
    const vehicleId = req.params.vehicleId;
    const userId = req.session.user.id;
    const { startDate, endDate } = req.body;

    db.query('SELECT rent_per_day FROM vehicles WHERE id = ?', [vehicleId], (err, results) => {
        if (err || results.length === 0) {
            return res.send('Error fetching vehicle details');
        }

        const rentPerDay = results[0].rent_per_day;
        const totalDays = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
        const totalAmount = rentPerDay * totalDays;

        db.query(
            'INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_amount) VALUES (?, ?, ?, ?, ?)',
            [userId, vehicleId, startDate, endDate, totalAmount],
            (err, result) => {
                if (err) {
                    return res.send('Error booking vehicle');
                }

                db.query('UPDATE vehicles SET available = FALSE WHERE id = ?', [vehicleId]);
                res.redirect('/bookings/history');
            }
        );
    });
});

// View booking history
router.get('/history', (req, res) => {
    const userId = req.session.user.id;

    db.query(
        `SELECT b.*, v.name AS vehicle_name FROM bookings b
         JOIN vehicles v ON b.vehicle_id = v.id
         WHERE b.user_id = ?`,
        [userId],
        (err, results) => {
            if (err) {
                return res.send('Error fetching booking history');
            }
            res.render('bookings/history', { bookings: results });
        }
    );
});

// View my bookings
router.get('/mybookings', (req, res) => {
    const userId = req.session.user.id;

    db.query(
        `SELECT b.*, v.name AS vehicle_name FROM bookings b
         JOIN vehicles v ON b.vehicle_id = v.id
         WHERE b.user_id = ?`,
        [userId],
        (err, results) => {
            if (err) throw err;
            res.render('mybookings', { bookings: results });
        }
    );
});

// Edit Booking - Show Form
router.get('/edit/:id', (req, res) => {
    const bookingId = req.params.id;
    db.query('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, results) => {
        if (err || results.length === 0) return res.send('Booking not found');
        res.render('editBooking', { booking: results[0] });
    });
});

// Update Booking - Handle Form
router.post('/update/:id', (req, res) => {
    const bookingId = req.params.id;
    const { start_date, end_date } = req.body;

    db.query('UPDATE bookings SET start_date = ?, end_date = ? WHERE id = ?',
        [start_date, end_date, bookingId],
        (err, results) => {
            if (err) throw err;
            res.redirect('/bookings/mybookings');
        });
});

// Delete Booking
router.get('/delete/:id', (req, res) => {
    const bookingId = req.params.id;
    db.query('DELETE FROM bookings WHERE id = ?', [bookingId], (err, result) => {
        if (err) throw err;
        res.redirect('/bookings/mybookings');
    });
});

module.exports = router;
