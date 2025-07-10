const mysql = require('mysql2/promise');
require('dotenv').config();

async function createRestaurant(name, cuisine, location, price_range) {
    const [result] = await pool.query(
        'INSERT INTO restaurants (name, cuisine, location, price_range) VALUES (?, ?, ?, ?)', [name, cuisine, location, price_range]
    );
    return result.insertId;
}

module.exports = { createRestaurant };