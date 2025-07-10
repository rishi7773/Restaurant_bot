const mysql = require('mysql2/promise');
require('dotenv').config();

async function createReservation(userId, restaurantId, dateTime, specialRequests) {
    const [result] = await pool.query(
        'INSERT INTO reservations (user_id, restaurant_id, date_time, special_requests, status) VALUES (?, ?, ?, ?, ?)', [userId, restaurantId, dateTime, specialRequests, 'pending']
    );
    return result.insertId;
}

module.exports = { createReservation };