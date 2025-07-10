const mysql = require('mysql2/promise');
require('dotenv').config();

async function createOrder(userId, restaurantId, items, total) {
    const [result] = await pool.query(
        'INSERT INTO orders (user_id, restaurant_id, items, total, status) VALUES (?, ?, ?, ?, ?)', [userId, restaurantId, JSON.stringify(items), total, 'pending']
    );
    return result.insertId;
}

module.exports = { createOrder };