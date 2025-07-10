const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateUserPreferences(userId, favoriteCuisines) {
    const [result] = await pool.query(
        'INSERT INTO user_preferences (user_id, favorite_cuisines) VALUES (?, ?) ON DUPLICATE KEY UPDATE favorite_cuisines = ?', [userId, JSON.stringify(favoriteCuisines), JSON.stringify(favoriteCuisines)]
    );
    return result;
}

module.exports = { updateUserPreferences };