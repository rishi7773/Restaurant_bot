const { MessageFactory, CardFactory, ConversationState, MemoryStorage, ActivityHandler } = require('botbuilder');
const { getIntent } = require('./services/cluService');
const { searchRestaurants } = require('./services/yelpService');
const { sendTelegramNotification } = require('./services/telegramService');
const mysql = require('mysql2/promise');
require('dotenv').config();



const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

class RestaurantBot extends ActivityHandler {
    constructor(conversationStateAccessor) {
        super();
        this.conversationStateAccessor = conversationStateAccessor;

        this.onMessage(async(context, next) => {
            const state = await this.conversationStateAccessor.get(context, {});
            const text = context.activity.text;

            if (text.startsWith('menu_')) {
                const restaurantName = text.replace('menu_', '');
                return await handleShowMenu(context, restaurantName);
            }

            if (text.startsWith('order_')) {
                return await context.sendActivity("Ordering will be there for you soon!");
            }


            const rawIntent = await getIntent(text);
            const intent = rawIntent.toLowerCase().replaceAll('_', '');
            console.log('🔍 Raw user input:', text);
            console.log('🎯 CLU Detected Intent:', intent);



            state.lastIntent = intent;

            switch (intent) {
                case 'findrestaurant':
                    await handleRestaurantSearch(context);
                    break;
                case 'showmenu':
                    await handleShowMenu(context);
                    break;
                case 'makereservation':
                    await handleMakeReservation(context, state);
                    break;
                case 'placeorder':
                    await handlePlaceOrder(context, state);
                    break;
                default:
                    console.log('⚠️ Unhandled intent:', intent);
                    await context.sendActivity(
                        MessageFactory.suggestedActions(
                            ['Find Restaurants', 'View Menu', 'Make Reservation', 'Place Order'],
                            'I can help with reservations, orders, and menus. What would you like to do?'
                        )
                    );
            }

            await this.conversationStateAccessor.set(context, state);
            await next();
        });

    }
}


async function handleRestaurantSearch(context) {
    const location = 'New York';
    try {
        const restaurants = await searchRestaurants(location);
        const cards = restaurants.map(r =>
            CardFactory.heroCard(
                r.name,
                `${r.location.address1}\nRating: ${r.rating}`,
                r.image_url ? [r.image_url] : [], [{ type: 'postBack', title: 'View Menu', value: `menu_${r.name}` }]
            )
        );
        await context.sendActivity(MessageFactory.carousel(cards));
    } catch (err) {
        console.error(err);
        await context.sendActivity('Sorry, I couldn’t find restaurants.');
    }
}


async function handleShowMenu(context, restaurantName = 'Default') {
    const restaurantId = 1;
    const [rows] = await pool.query('SELECT * FROM menus WHERE restaurant_id = ?', [restaurantId]);

    const cards = rows.map(item =>
        CardFactory.heroCard(
            item.item_name,
            `${item.description}\nPrice: ₹${item.price}`,
            item.image_url ? [item.image_url] : [], [{ type: 'postBack', title: 'Order', value: `order_${item.id}` }]
        )
    );

    await context.sendActivity(MessageFactory.carousel(cards));
}


async function handleMakeReservation(context, state) {
    const text = context.activity.text;

    if (!state.step) {
        await context.sendActivity('Sure! For how many people?');
        state.step = 'askPeople';
        return;
    }

    if (state.step === 'askPeople') {
        state.people = text;
        await context.sendActivity('Great! What date and time? (e.g., 2025-07-20 19:30)');
        state.step = 'askDate';
        return;
    }

    if (state.step === 'askDate') {
        state.dateTime = text;
        await context.sendActivity('Any special requests? (type "no" if none)');
        state.step = 'askRequests';
        return;
    }

    if (state.step === 'askRequests') {
        state.specialRequests = text;
        try {
            await pool.query(
                'INSERT INTO reservations (user_id, restaurant_id, date_time, special_requests, status) VALUES (?, ?, ?, ?, ?)', [context.activity.from.id, 1, state.dateTime, state.specialRequests, 'pending']
            );
            await context.sendActivity(`✅ Reservation made for ${state.people} on ${state.dateTime}.`);
            await sendTelegramNotification(`New reservation for ${state.people} people on ${state.dateTime}`);
        } catch (e) {
            await context.sendActivity('⚠️ Failed to make reservation.');
        }
        state.step = null;
    }
}


async function handlePlaceOrder(context, state) {
    const text = context.activity.text;

    if (!state.step) {
        await context.sendActivity('What would you like to order?');
        state.step = 'askItem';
        return;
    }

    if (state.step === 'askItem') {
        state.orderItem = text;
        await context.sendActivity('How many servings?');
        state.step = 'askQuantity';
        return;
    }

    if (state.step === 'askQuantity') {
        const quantity = parseInt(text);
        const item = state.orderItem;
        const price = 10;

        const total = quantity * price;

        try {
            await pool.query(
                'INSERT INTO orders (user_id, restaurant_id, items, total, status) VALUES (?, ?, ?, ?, ?)', [context.activity.from.id, 1, JSON.stringify([{ item, quantity }]), total, 'pending']
            );
            await context.sendActivity(`✅ Order placed for ${quantity} x ${item}. Total: ₹${total}`);
        } catch (e) {
            await context.sendActivity('⚠️ Order failed.');
        }

        state.step = null;
    }
}


const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const stateAccessor = conversationState.createProperty('conversationData');

module.exports.handleIntent = async(context) => {
    const bot = new RestaurantBot(stateAccessor);
    await bot.run(context);
};