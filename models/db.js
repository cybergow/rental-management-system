const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         // Use your DB username
    password: 'Nathi_098',         // Add your DB password if any
    database: 'rentaldb'  // We’ll create this DB in the next step
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

module.exports = db;
