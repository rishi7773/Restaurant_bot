Restaurant Bot (rbot)
A Node.js-based chatbot for restaurant discovery, menu exploration, reservations, orders, and more using Microsoft Bot Framework, MySQL, and Azure CLU.
Setup

Clone the repository:
git clone <your-repo-url>
cd rbot


Install dependencies:
npm install


Set up environment variables:

Copy .env.example to .env and fill in the values:
MICROSOFT_APP_ID, MICROSOFT_APP_PASSWORD: From Azure Bot Service
MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE: MySQL credentials
YELP_API_KEY: From Yelp Developer Portal
STRIPE_SECRET_KEY: From Stripe Dashboard
CLU_ENDPOINT, CLU_API_KEY: From Azure CLU
TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID: From Telegram BotFather




Set up MySQL:

Run sql/init.sql in your MySQL client to create the database and tables.


Run the bot:
npm run dev


Test with Bot Framework Emulator:

Download from GitHub.
Connect to http://localhost:3000/api/messages.



Features

Restaurant discovery via Yelp API
Menu exploration with images
Reservation management
Order placement and tracking
Payment integration with Stripe
Personalized recommendations
Telegram notifications for reservations

Deployment

Deploy to Azure App Service:az webapp up --name rbot --resource-group your-resource-group


