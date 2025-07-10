const mysql = require('mysql2/promise');
require('dotenv').config();

async function createMenu(restaurantId, category, itemName, description, price, imageUrl) {
    const [result] = await pool.query(
        'INSERT INTO menus (restaurant_id, category, item_name, description, price, image_url) VALUES (?, ?, ?, ?, ?, ?)', [restaurantId, category, itemName, description, price, imageUrl]
    );
    return result.insertId;
}

module.exports = { createMenu };