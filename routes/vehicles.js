const express = require('express');
const router = express.Router();
const db = require('../models/db');

// List all available vehicles
router.get('/', (req, res) => {
    db.query('SELECT * FROM vehicles WHERE available = TRUE', (err, results) => {
        if (err) {
            return res.send('Error fetching vehicles');
        }
        res.render('vehicles/list', { vehicles: results });
    });
});

// Vehicle details page
router.get('/:id', (req, res) => {
    const vehicleId = req.params.id;

    db.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId], (err, results) => {
        if (err || results.length === 0) {
            return res.send('Vehicle not found');
        }
        res.render('vehicles/details', { vehicle: results[0] });
    });
});

module.exports = router;
