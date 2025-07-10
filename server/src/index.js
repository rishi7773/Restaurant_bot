const express = require('express');
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { handleIntent } = require('./bot');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());



app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true
}));

// Change this endpoint to match what the client is using
app.post('/api/message', (req, res) => {
    adapter.processActivity(req, res, async(context) => {
        const conversationStateAccessors = {
            conversation: conversationState.createProperty('conversationState'),
            user: userState.createProperty('userState')
        };
        await handleIntent(context, conversationStateAccessors);
    });
});



// Bot setup
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
const storage = new MemoryStorage();
const conversationState = new ConversationState(storage);
const userState = new UserState(storage);

// Bot endpoint
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async(context) => {
        const conversationStateAccessors = {
            conversation: conversationState.createProperty('conversationState'),
            user: userState.createProperty('userState')
        };
        await handleIntent(context, conversationStateAccessors);
    });
});

// Health check
app.get('/', (req, res) => res.send('Restaurant Bot is running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));