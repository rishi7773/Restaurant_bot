const axios = require('axios');
require('dotenv').config();

async function searchRestaurants(location, cuisine = 'restaurants') {
    try {
        const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
            headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` },
            params: { term: cuisine, location, limit: 5 }
        });
        return response.data.businesses;
    } catch (error) {
        console.error('Yelp error:', error);
        return [];
    }
}

module.exports = { searchRestaurants };