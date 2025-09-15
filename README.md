# Gemini Backend Clone – Assignment (Kuvaka Tech)

# Setup and run 

1. git clone https://github.com/your-username/gemini-backend-clone.git
2. npm install  (install all dependencies)
3. Run redis-server
4. Install stripe by reading its official docs for webhook security 
5. Setup the Environment Variables -
PORT=3000
MONGO_URI=your_mongodb_URI
JWT_SECRET=your_jwt_secret
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
GEMINI_API_KEY=your_gemini_api_key
6. npm run dev

# Architecture Overview
User → Auth (JWT + OTP via Redis)
    → Chatroom (MongoDB stores messages)
        → Message added to BullMQ queue
            → Worker consumes queue
                → Calls Gemini API
                → Stores response in MongoDB 
    → Stripe subscription check
        - Basic: 5 requests/day
        - Pro: unlimited

# Queue System Explanation

When a user sends a message (POST /chatroom/:id/message):
Message is saved in MongoDB.
Message is pushed into a BullMQ queue.

The worker listens to the queue:
Calls Gemini API with the message.
Gets AI response.
Stores response in MongoDB.

This ensures:
Requests don’t block user responses.
Failed jobs can retry automatically.
System scales well under load.

#Gemini API Integration Overview

Uses @google/generativeai client.
API key is stored in .env as GEMINI_API_KEY.
Code of getting the gemini response is there in a file name as gemini.js in a PROJECT
Response is stored in DB and optionally.
When fetching chat messages, user sees both their messages and Gemini’s responses.

#Assumptions & Design Decisions

OTP via Redis: Chosen because OTPs are short-lived, making Redis ideal.
Queue for Gemini: Avoids blocking user request and supports retries.
Caching responses: Prevents repeated Gemini API calls for same queries.
Stripe Sandbox: Used only in test mode, no real payments.
User Identification in Stripe: Stored via metadata.userId in Checkout sessions for mapping events back to DB.
Basic vs Pro tier: Enforced via middleware that checks request count per day.
