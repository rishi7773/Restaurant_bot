const { MessageFactory, CardFactory } = require('botbuilder');
const { getIntent } = require('./services/cluService');
const { searchRestaurants } = require('./services/yelpService');
const { sendTelegramNotification } = require('./services/telegramService');
const mysql = require('mysql2/promise');
const { ActivityHandler } = require('botbuilder');
require('dotenv').config();




class RestaurantBot extends ActivityHandler {
    constructor(conversationStateAccessors) {
        super();

        this.conversationStateAccessors = conversationStateAccessors;

        this.onMessage(async(context, next) => {
            const text = context.activity.text.toLowerCase();
            let replyText = '';

            // Add your intent handling logic here
            if (text.includes('reservation') || text.includes('book')) {
                replyText = 'Sure! I can help with reservations. How many people and for when?';
            } else if (text.includes('menu')) {
                replyText = 'Here is our menu: ...';
            } else if (text.includes('order')) {
                replyText = 'What would you like to order?';
            } else if (text.includes('restaurant') || text.includes('find')) {
                replyText = 'I found these restaurants nearby: ...';
            } else {
                replyText = 'I can help with reservations, orders, and menu information. What would you like to do?';
            }

            await context.sendActivity(replyText);
            await next();
        });
    }
}

module.exports.handleIntent = async(context, conversationStateAccessors) => {
    const bot = new RestaurantBot(conversationStateAccessors);
    await bot.run(context);
};




const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

async function handleIntent(context, stateAccessors) {
    const userMessage = context.activity.text;
    const userId = context.activity.from.id;
    const intent = await getIntent(userMessage);

    switch (intent) {
        case 'find_restaurant':
            await handleRestaurantSearch(context);
            break;
        case 'show_menu':
            await handleShowMenu(context);
            break;
        case 'make_reservation':
            await handleMakeReservation(context, userId);
            break;
        case 'place_order':
            await handlePlaceOrder(context, userId);
            break;
        case 'track_order':
            await handleTrackOrder(context);
            break;
        case 'cancel_reservation':
            await handleCancelReservation(context);
            break;
        case 'get_recommendations':
            await handleRecommendations(context, userId);
            break;
        default:
            await context.sendActivity(MessageFactory.suggestedActions(
                ['Find Restaurants', 'View Menu', 'Make Reservation', 'Place Order'],
                'What would you like to do?'
            ));
    }
}

async function handleRestaurantSearch(context) {
    const location = 'New York'; // Replace with CLU entity extraction
    try {
        const restaurants = await searchRestaurants(location);
        const cards = restaurants.map(r => CardFactory.heroCard(
            r.name,
            `${r.location.address1}\nRating: ${r.rating}`,
            r.image_url ? [r.image_url] : []
        ));
        await context.sendActivity(MessageFactory.carousel(cards));
    } catch (error) {
        await context.sendActivity('Sorry, I couldn’t find restaurants.');
    }
}

async function handleShowMenu(context, restaurantId = 1) {
    const [rows] = await pool.query('SELECT * FROM menus WHERE restaurant_id = ?', [restaurantId]);
    const cards = rows.map(item => CardFactory.heroCard(
        item.item_name,
        `${item.description}\nPrice: $${item.price}`,
        item.image_url ? [item.image_url] : [], [{ type: 'postBack', title: 'Order', value: `order_${item.id}` }]
    ));
    await context.sendActivity(MessageFactory.carousel(cards));
}

async function handleMakeReservation(context, userId) {
    const dateTime = '2025-07-01 19:00'; // Replace with CLU entity extraction
    const specialRequests = 'Window seat'; // Replace with CLU entity extraction
    const restaurantId = 1;
    try {
        await pool.query(
            'INSERT INTO reservations (user_id, restaurant_id, date_time, special_requests, status) VALUES (?, ?, ?, ?, ?)', [userId, restaurantId, dateTime, specialRequests, 'pending']
        );
        await context.sendActivity('Reservation made! We’ll confirm soon.');
        await sendTelegramNotification(`New reservation: ${dateTime}, Requests: ${specialRequests}`);
    } catch (error) {
        await context.sendActivity('Failed to make reservation.');
    }
}

async function handlePlaceOrder(context, userId) {
    const restaurantId = 1;
    const items = [{ id: 1, name: 'Pizza', quantity: 1, price: 10 }]; // Replace with user selection
    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    try {
        await pool.query(
            'INSERT INTO orders (user_id, restaurant_id, items, total, status) VALUES (?, ?, ?, ?, ?)', [userId, restaurantId, JSON.stringify(items), total, 'pending']
        );
        await context.sendActivity(`Order placed! Total: $${total}`);
    } catch (error) {
        await context.sendActivity('Failed to place order.');
    }
}

async function handleTrackOrder(context, orderId = 1) {
    try {
        const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (order.length) {
            await context.sendActivity(`Order #${order[0].id}: ${order[0].status}`);
        } else {
            await context.sendActivity('Order not found.');
        }
    } catch (error) {
        await context.sendActivity('Error tracking order.');
    }
}

async function handleCancelReservation(context, reservationId = 1) {
    try {
        await pool.query('UPDATE reservations SET status = ? WHERE id = ?', ['cancelled', reservationId]);
        await context.sendActivity('Reservation cancelled.');
    } catch (error) {
        await context.sendActivity('Error cancelling reservation.');
    }
}

async function handleRecommendations(context, userId) {
    try {
        const [prefs] = await pool.query(
            'SELECT favorite_cuisines FROM user_preferences WHERE user_id = ?', [userId]
        );

        let cuisines = ['italian']; // default fallback
        if (prefs && prefs.length > 0 && prefs[0].favorite_cuisines) {
            try {
                cuisines = JSON.parse(prefs[0].favorite_cuisines);
            } catch (err) {
                console.error('Error parsing favorite_cuisines:', err);
            }
        }

        const restaurants = await searchRestaurants('New York', cuisines[0]);
        const cards = restaurants.map(r =>
            CardFactory.heroCard(r.name, r.location.address1)
        );
        await context.sendActivity(MessageFactory.carousel(cards));
    } catch (error) {
        console.error('Recommendation error:', error);
        await context.sendActivity('Sorry, I couldn’t find recommendations.');
    }

}

module.exports = { handleIntent };