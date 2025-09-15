import express from "express"
import dotenv from "dotenv"
dotenv.config({path : "./.env"})
import cors from "cors"
import mongoose from "mongoose"
import Authroutes from "./Routes/Auth.Routes.js"
import Chatroomroutes from "./Routes/Chatroom.Routes.js"
import Subscriptionroutes from "./Routes/Subscription.Routes.js"
import Webhookroutes from "./Routes/Webhook.Routes.js"
import redisClient from "./Caching/redisclient.js"


// Connect to Redis
async function connectToRedis() {
    try {
        await redisClient.connect();
        console.log("Connected to Redis");
    } catch (error) {
        console.error("Error connecting to Redis:", error);
    }
}

connectToRedis();

const app = express()



app.use(cors({
    origin: "*",
    methods: ["GET" , "POST" , "PUT" , "DELETE"]
}))

// Health check endpoint (important for Render)
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
    });
});

// Webhook routes need the raw body to validate the signature
app.use('/webhook',  Webhookroutes);


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3000

// Root route
app.get("/" , (req , res) => {
    res.status(200).json({
       message: "Gemini AI Chatbot API", 
        version: "1.0.0",
        status: "running"
    })   
});


// handle Routes
app.use('/api/auth' , Authroutes)
app.use('/api/chatroom' , Chatroomroutes) 
app.use('/api/subscription' , Subscriptionroutes)


console.log("All routes registered successfully");



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});


// Connect to Database

mongoose.connect(process.env.MONGO_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB Connected Successfully")
    app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`)
})
})
.catch((error) => {
    console.error("Error connecting to Database:", error)
    console.log("server is not connected to database")
})




